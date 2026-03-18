const updateOutingState = require("../utils/updateOutingState");
const logOutingHistory = require("../utils/logOutingHistory");
const pool = require("../config/db");

exports.parentApprove = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "parentApprove"
    );

    await logOutingHistory(
      requestId,
      "parent_approved",
      req.user.id
    );

    res.json({
      message: "Parent approved",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};



exports.parentReject = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "parentReject"
    );

    await logOutingHistory(
      requestId,
      "parent_rejected",
      req.user.id
    );

    res.json({
      message: "Parent rejected",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};


// List all outing requests for the child linked to this parent
exports.listChildOutings = async (req, res) => {

  try {

    const parent = await pool.query(
      "SELECT student_id FROM parents WHERE id=$1",
      [req.user.id]
    );

    if (parent.rows.length === 0) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const studentCode = parent.rows[0].student_id;
    const studentName = parent.rows[0].student_name;

    // Map external student code to internal users.id used in outing_requests
    const userRow = await pool.query(
      "SELECT id FROM users WHERE student_id = $1",
      [studentCode]
    );

    if (userRow.rows.length === 0) {
      return res.json([]);
    }

    const internalUserId = userRow.rows[0].id;

    const outings = await pool.query(
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
    
    // Attach student name for nicer display on the parent dashboard
    const rowsWithName = outings.rows.map((row) => ({
      ...row,
      student_name: studentName
    }));

    res.json(rowsWithName);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};