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
      `SELECT id,
              student_id,
              room_number,
              destination,
              type AS reason,
              leaving_date,
              leaving_time,
              status,
              left_time,
              arrival_time,
              created_at
       FROM outing_requests
       WHERE student_id = $1
       ORDER BY created_at DESC`,
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