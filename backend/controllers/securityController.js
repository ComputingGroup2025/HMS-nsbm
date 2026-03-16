const pool = require("../config/db");
const updateOutingState = require("../utils/updateOutingState");
const logOutingHistory = require("../utils/logOutingHistory");

exports.securityExit = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "securityExit"
    );

    await pool.query(
      "UPDATE outing_requests SET left_time = NOW() WHERE id=$1",
      [requestId]
    );

    await logOutingHistory(
      requestId,
      "student_left",
      req.user.id
    );

    res.json({
      message: "Student exit recorded",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};



exports.securityReturn = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "securityReturn"
    );

    await pool.query(
      "UPDATE outing_requests SET arrival_time = NOW() WHERE id=$1",
      [requestId]
    );

    await logOutingHistory(
      requestId,
      "student_returned",
      req.user.id
    );

    res.json({
      message: "Student returned",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};


// For security: list today's outings and going-home notifications
exports.listTodayOutings = async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT o.id,
              u.student_id AS student_id,
              u.name AS student_name,
              o.room_number,
              o.vehicle_number,
              o.status,
              o.left_time,
              o.arrival_time
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.status IN ('approved','student_left')
       ORDER BY o.leaving_date, o.leaving_time ASC`
    );

    res.json(result.rows);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};