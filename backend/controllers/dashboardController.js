const pool = require("../config/db");

/* ==============================
   Warden Super Dashboard
============================== */

exports.getWardenDashboard = async (req, res) => {

  try {

    // Pending parent approvals
    const parentPending = await pool.query(
      `SELECT o.id, u.name, o.destination, o.leaving_date, o.leaving_time
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.status = 'pending_parent'
       ORDER BY o.created_at DESC`
    );

    // Pending warden approvals
    const wardenPending = await pool.query(
      `SELECT o.id, u.name, o.destination, o.leaving_date, o.leaving_time
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.status = 'pending_warden'
       ORDER BY o.created_at DESC`
    );

    // Students currently outside hostel
    const outsideStudents = await pool.query(
      `SELECT o.id, u.name, o.destination, o.left_time
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.status = 'student_left'
       AND o.arrival_time IS NULL
       ORDER BY o.left_time DESC`
    );

    // Late students (after 7:30 PM)
    const lateStudents = await pool.query(
      `SELECT o.id, u.name, o.destination, o.left_time
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.status = 'student_left'
       AND o.arrival_time IS NULL
       AND CURRENT_TIME > TIME '19:30'
       ORDER BY o.left_time DESC`
    );

    // Today's outings / approvals visible to warden
    const todayOutings = await pool.query(
      `SELECT o.id,
              u.name,
              u.student_id,
              o.destination,
              o.leaving_date,
              o.leaving_time,
              o.status
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.type = 'outing'
         AND o.status IN ('pending_warden','approved','student_left','student_returned')
       ORDER BY o.leaving_time ASC`
    );

    // Today's going homes / home-going notifications (no warden approval needed)
    const todayGoingHomes = await pool.query(
      `SELECT o.id,
              u.name,
              u.student_id,
              o.leaving_date,
              o.leaving_time,
              o.status
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.type = 'home'
       ORDER BY o.leaving_time ASC`
    );

    res.json({
      parent_pending: parentPending.rows,
      warden_pending: wardenPending.rows,
      outside_students: outsideStudents.rows,
      late_students: lateStudents.rows,
      today_outings: todayOutings.rows,
      today_going_homes: todayGoingHomes.rows
    });

  } catch (error) {

    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};