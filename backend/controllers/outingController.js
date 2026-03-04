const pool = require("../config/db");
const logOutingHistory = require("../utils/logOutingHistory");

exports.createOuting = async (req, res) => {

  try {

    const {
      type,
      destination,
      vehicle_number,
      leaving_date,
      leaving_time,
      emergency
    } = req.body;

    const studentId = req.user.id;

    const result = await pool.query(
      `INSERT INTO outing_requests
      (student_id, type, destination, vehicle_number, leaving_date, leaving_time, emergency, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending_parent')
      RETURNING id`,
      [
        studentId,
        type,
        destination,
        vehicle_number,
        leaving_date,
        leaving_time,
        emergency
      ]
    );

    const outingId = result.rows[0].id;

    await logOutingHistory(
      outingId,
      "request_created",
      studentId
    );

    res.status(201).json({
      message: "Outing request created",
      outing_id: outingId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};