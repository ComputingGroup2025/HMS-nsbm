const pool = require("../config/db");
const logOutingHistory = require("../utils/logOutingHistory");

exports.createOuting = async (req, res) => {

  try {

    const {
      student_id,
      room_number,
      destination,
      type,
      reason,
      leaving_date,
      leaving_time,
      emergency
    } = req.body;

    // Find the internal user id that matches this external student_id code
    const userResult = await pool.query(
      "SELECT id FROM users WHERE student_id = $1",
      [student_id]
    );

    let internalUserId;

    if (userResult.rows.length === 0) {

      // Try to auto-create a corresponding users row from students table
      const studentResult = await pool.query(
        "SELECT id, full_name, email, password FROM students WHERE student_id = $1",
        [student_id]
      );

      if (studentResult.rows.length === 0) {
        return res.status(400).json({
          message: "Student ID is not registered in the system"
        });
      }

      const student = studentResult.rows[0];

      const userInsert = await pool.query(
        `INSERT INTO users (name,email,password,role,student_id,parent_password)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
          student.full_name,
          student.email,
          student.password,
          "student",
          student_id,
          null
        ]
      );

      internalUserId = userInsert.rows[0].id;

    } else {

      internalUserId = userResult.rows[0].id;

    }

    // Support both `type` and older `reason` field from frontend.
    let outingType =
      type ||
      reason ||
      (destination && destination.trim() !== "" ? "outing" : "home");

    // Normalize variations to match DB check constraint
    if (outingType === "going_home") {
      outingType = "home";
    }

    const initialStatus = outingType === "home" ? "approved" : "pending_parent";

    await pool.query(
      `INSERT INTO outing_requests
      (student_id,room_number,destination,type,leaving_date,leaving_time,emergency,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        internalUserId,
        room_number,
        destination || null,
        outingType,
        leaving_date,
        leaving_time,
        emergency === true,
        initialStatus
      ]
    );

    res.json({
      message: "Outing request created"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};


// List all outing requests for the currently logged-in student
exports.getMyOutings = async (req, res) => {

  try {

    // First, try to use the token id directly (when it already matches users.id)
    let internalUserId = req.user.id;

    // If no outings found, map from students table to users table
    let result = await pool.query(
      `SELECT o.id,
              o.student_id,
              o.room_number,
              o.destination,
              o.type AS reason,
              o.leaving_date,
              o.leaving_time,
              CASE
                WHEN last_history.action = 'cancelled_by_student' THEN 'cancelled'
                ELSE o.status
              END AS status,
              o.emergency,
              o.left_time,
              o.arrival_time,
              o.created_at
       FROM outing_requests o
       LEFT JOIN LATERAL (
         SELECT h.action
         FROM outing_history h
         WHERE h.outing_id = o.id
         ORDER BY h.created_at DESC, h.id DESC
         LIMIT 1
       ) AS last_history ON TRUE
       WHERE o.student_id = $1
       ORDER BY o.created_at DESC`,
      [internalUserId]
    );

    if (result.rows.length === 0) {
      const studentRow = await pool.query(
        "SELECT student_id FROM students WHERE id=$1",
        [req.user.id]
      );

      if (studentRow.rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const studentCode = studentRow.rows[0].student_id;

      const userRow = await pool.query(
        "SELECT id FROM users WHERE student_id = $1",
        [studentCode]
      );

      if (userRow.rows.length === 0) {
        return res.json([]);
      }

      internalUserId = userRow.rows[0].id;

      result = await pool.query(
        `SELECT o.id,
                o.student_id,
                o.room_number,
                o.destination,
                o.type AS reason,
                o.leaving_date,
                o.leaving_time,
                CASE
                  WHEN last_history.action = 'cancelled_by_student' THEN 'cancelled'
                  ELSE o.status
                END AS status,
                o.emergency,
                o.left_time,
                o.arrival_time,
                o.created_at
         FROM outing_requests o
         LEFT JOIN LATERAL (
           SELECT h.action
           FROM outing_history h
           WHERE h.outing_id = o.id
           ORDER BY h.created_at DESC, h.id DESC
           LIMIT 1
         ) AS last_history ON TRUE
         WHERE o.student_id = $1
         ORDER BY o.created_at DESC`,
        [internalUserId]
      );
    }

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};


// Detailed history timeline for the logged-in student,
// based on outing_history entries.
exports.getOutingHistory = async (req, res) => {

  try {

    // Resolve internal user id similar to getMyOutings
    let internalUserId = req.user.id;

    let outings = await pool.query(
      `SELECT id
       FROM outing_requests
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [internalUserId]
    );

    if (outings.rows.length === 0) {
      const studentRow = await pool.query(
        "SELECT student_id FROM students WHERE id=$1",
        [req.user.id]
      );

      if (studentRow.rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const studentCode = studentRow.rows[0].student_id;

      const userRow = await pool.query(
        "SELECT id FROM users WHERE student_id = $1",
        [studentCode]
      );

      if (userRow.rows.length === 0) {
        return res.json([]);
      }

      internalUserId = userRow.rows[0].id;

      outings = await pool.query(
        `SELECT id
         FROM outing_requests
         WHERE student_id = $1
         ORDER BY created_at DESC`,
        [internalUserId]
      );
    }

    const outingIds = outings.rows.map((row) => row.id);

    if (outingIds.length === 0) {
      return res.json([]);
    }

    const history = await pool.query(
      `SELECT outing_id, action, performed_by, created_at
       FROM outing_history
       WHERE outing_id = ANY($1::int[])
       ORDER BY outing_id, created_at`,
      [outingIds]
    );

    const grouped = {};

    for (const row of history.rows) {
      if (!grouped[row.outing_id]) {
        grouped[row.outing_id] = [];
      }

      const titleMap = {
        created: "Request Created",
        parent_approved: "Parent Approved",
        parent_rejected: "Parent Rejected",
        warden_approved: "Warden Approved",
        warden_rejected: "Warden Rejected",
        cancelled_by_student: "Cancelled by Student",
        student_left: "Student Left Hostel",
        student_returned: "Student Returned"
      };

      const descriptionMap = {
        created: "Outing request was created",
        parent_approved: "Parent approved the outing request",
        parent_rejected: "Parent rejected the outing request",
        warden_approved: "Warden approved the outing request",
        warden_rejected: "Warden rejected the outing request",
        cancelled_by_student: "Student cancelled this request",
        student_left: "Security marked student as left the hostel",
        student_returned: "Security marked student as returned to the hostel"
      };

      grouped[row.outing_id].push({
        title: titleMap[row.action] || row.action,
        description: descriptionMap[row.action] || "",
        time: row.created_at
      });
    }

    const response = outings.rows.map((o) => ({
      id: o.id,
      events: grouped[o.id] || []
    }));

    res.json(response);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};


exports.cancelMyOuting = async (req, res) => {

  try {

    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        message: "Invalid request id"
      });
    }

    let internalUserId = req.user.id;

    let ownershipCheck = await pool.query(
      `SELECT id,
              status,
              left_time,
              arrival_time,
              (
                SELECT h.action
                FROM outing_history h
                WHERE h.outing_id = outing_requests.id
                ORDER BY h.created_at DESC, h.id DESC
                LIMIT 1
              ) AS last_action
       FROM outing_requests
       WHERE id = $1 AND student_id = $2`,
      [requestId, internalUserId]
    );

    if (ownershipCheck.rows.length === 0) {
      const studentRow = await pool.query(
        "SELECT student_id FROM students WHERE id=$1",
        [req.user.id]
      );

      if (studentRow.rows.length > 0) {
        const studentCode = studentRow.rows[0].student_id;
        const userRow = await pool.query(
          "SELECT id FROM users WHERE student_id = $1",
          [studentCode]
        );

        if (userRow.rows.length > 0) {
          internalUserId = userRow.rows[0].id;
          ownershipCheck = await pool.query(
            `SELECT id,
                    status,
                    left_time,
                    arrival_time,
                    (
                      SELECT h.action
                      FROM outing_history h
                      WHERE h.outing_id = outing_requests.id
                      ORDER BY h.created_at DESC, h.id DESC
                      LIMIT 1
                    ) AS last_action
             FROM outing_requests
             WHERE id = $1 AND student_id = $2`,
            [requestId, internalUserId]
          );
        }
      }
    }

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    const request = ownershipCheck.rows[0];

    const nonCancelableStatuses = new Set([
      "student_left",
      "student_returned",
      "rejected_by_parent",
      "rejected_by_warden"
    ]);

    if (
      request.last_action === "cancelled_by_student" ||
      nonCancelableStatuses.has(request.status) ||
      request.left_time ||
      request.arrival_time
    ) {
      return res.status(400).json({
        message: "This request can no longer be cancelled"
      });
    }

    await pool.query(
      `UPDATE outing_requests
       SET status = 'rejected_by_parent'
       WHERE id = $1 AND student_id = $2`,
      [requestId, internalUserId]
    );

    await logOutingHistory(
      requestId,
      "cancelled_by_student",
      req.user.id
    );

    return res.json({
      message: "Request cancelled successfully"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      message: "Server error"
    });

  }

};