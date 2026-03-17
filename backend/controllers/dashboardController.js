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
         AND o.leaving_date = CURRENT_DATE
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
         AND o.leaving_date = CURRENT_DATE
       ORDER BY o.leaving_time ASC`
    );

    const totalStudents = await pool.query(
      `SELECT COUNT(*)::int AS total_students
       FROM students`
    );

    const studentsOutsideToday = await pool.query(
      `SELECT COUNT(DISTINCT o.student_id)::int AS students_outside
       FROM outing_requests o
       WHERE o.leaving_date = CURRENT_DATE
         AND o.status = 'student_left'
         AND o.arrival_time IS NULL`
    );

    const studentsInHomeToday = await pool.query(
      `SELECT COUNT(DISTINCT o.student_id)::int AS students_in_home
       FROM outing_requests o
       WHERE o.type = 'home'
         AND o.leaving_date = CURRENT_DATE
         AND o.status IN ('approved', 'student_left')`
    );

    res.json({
      parent_pending: parentPending.rows,
      warden_pending: wardenPending.rows,
      outside_students: outsideStudents.rows,
      late_students: lateStudents.rows,
      today_outings: todayOutings.rows,
      today_going_homes: todayGoingHomes.rows,
      daily_summary: {
        total_students_registered: totalStudents.rows[0]?.total_students || 0,
        students_outside_hostel: studentsOutsideToday.rows[0]?.students_outside || 0,
        students_in_home_today: studentsInHomeToday.rows[0]?.students_in_home || 0,
        date: new Date().toISOString().split("T")[0]
      }
    });

  } catch (error) {

    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/* ==============================
   Warden Past Summaries by Date
============================== */

exports.getWardenPastSummariesByDate = async (req, res) => {

  try {

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate >= today) {
      return res.status(400).json({
        message: "Please select a past date"
      });
    }

    const pastOutings = await pool.query(
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
         AND o.leaving_date = $1
       ORDER BY o.leaving_time ASC`,
      [date]
    );

    const pastGoingHomes = await pool.query(
      `SELECT o.id,
              u.name,
              u.student_id,
              o.leaving_date,
              o.leaving_time,
              o.status
       FROM outing_requests o
       JOIN users u ON o.student_id = u.id
       WHERE o.type = 'home'
         AND o.leaving_date = $1
       ORDER BY o.leaving_time ASC`,
      [date]
    );

    return res.json({
      past_outings: pastOutings.rows,
      past_going_homes: pastGoingHomes.rows
    });

  } catch (error) {

    console.error("Past summary error:", error);

    return res.status(500).json({
      message: "Server error"
    });

  }

};