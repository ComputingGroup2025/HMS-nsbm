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