const updateOutingState = require("../utils/updateOutingState");
const logOutingHistory = require("../utils/logOutingHistory");

const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.wardenApprove = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "wardenApprove"
    );

    await logOutingHistory(
      requestId,
      "warden_approved",
      req.user.id
    );

    res.json({
      message: "Warden approved",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};



exports.wardenReject = async (req, res) => {

  try {

    const requestId = req.params.id;

    const nextState = await updateOutingState(
      requestId,
      "wardenReject"
    );

    await logOutingHistory(
      requestId,
      "warden_rejected",
      req.user.id
    );

    res.json({
      message: "Warden rejected",
      status: nextState
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};



exports.registerStudent = async (req,res)=>{

 try{

  const {
   full_name,
   student_id,
   room_number,
   email,
   password
  } = req.body;

  const hashedPassword = await bcrypt.hash(password,10);

  // Insert into students table
  await pool.query(
    `INSERT INTO students
     (full_name,student_id,room_number,email,password)
     VALUES ($1,$2,$3,$4,$5)`,
    [
      full_name,
      student_id,
      room_number,
      email,
      hashedPassword
    ]
  );

  // Also create corresponding row in users table for auth/foreign keys
  await pool.query(
    `INSERT INTO users
     (name,email,password,role,student_id,parent_password)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      full_name,
      email,
      hashedPassword,
      "student",
      student_id,
      null
    ]
  );

  res.json({
   message:"Student registered successfully"
  });

 }
 catch(err){

  console.log(err);

  res.status(500).json({
   message:"Server error"
  });

 }

};

exports.registerParent = async (req,res)=>{

 try{

  const {
   parent_name,
   email,
   student_name,
   student_id,
   phone_number,
   password
  } = req.body;

  const hashedPassword = await bcrypt.hash(password,10);

  await pool.query(
   `INSERT INTO parents
   (parent_name,email,student_name,student_id,phone_number,password)
   VALUES ($1,$2,$3,$4,$5,$6)`,
   [
    parent_name,
    email,
    student_name,
    student_id,
    phone_number,
    hashedPassword
   ]
  );

  res.json({
   message:"Parent registered successfully"
  });

 }
 catch(err){

  console.log(err);

  res.status(500).json({
   message:"Server error"
  });

 }

};

exports.searchStudentAndParent = async (req, res) => {

 try {

  const { studentId } = req.params;

  if (!studentId || !studentId.trim()) {
    return res.status(400).json({
      message: "Student ID is required"
    });
  }

  const normalizedStudentId = studentId.trim();

  const studentResult = await pool.query(
    `SELECT
      full_name,
      student_id,
      room_number,
      email
     FROM students
     WHERE student_id = $1`,
    [normalizedStudentId]
  );

  const parentResult = await pool.query(
    `SELECT
      parent_name,
      email,
      student_name,
      student_id,
      phone_number
     FROM parents
     WHERE student_id = $1`,
    [normalizedStudentId]
  );

  const student = studentResult.rows[0] || null;
  const parent = parentResult.rows[0] || null;

  if (!student && !parent) {
    return res.status(404).json({
      message: "No student or parent found for this student ID"
    });
  }

  return res.json({
    student,
    parent
  });

 } catch (err) {

  console.log(err);

  return res.status(500).json({
   message:"Server error"
  });

 }

};

exports.removeStudent = async (req, res) => {

 try {

  const { studentId } = req.params;

  if (!studentId || !studentId.trim()) {
    return res.status(400).json({
      message: "Student ID is required"
    });
  }

  const normalizedStudentId = studentId.trim();

  await pool.query("BEGIN");

  const studentCheck = await pool.query(
    "SELECT student_id FROM students WHERE student_id = $1",
    [normalizedStudentId]
  );

  if (studentCheck.rows.length === 0) {
    await pool.query("ROLLBACK");
    return res.status(404).json({
      message: "Student not found"
    });
  }

  const userRows = await pool.query(
    "SELECT id FROM users WHERE student_id = $1 AND role = 'student'",
    [normalizedStudentId]
  );

  if (userRows.rows.length > 0) {
    const userIds = userRows.rows.map((row) => row.id);

    await pool.query(
      "DELETE FROM outing_history WHERE outing_id IN (SELECT id FROM outing_requests WHERE student_id = ANY($1::int[]))",
      [userIds]
    );

    await pool.query(
      "DELETE FROM outing_requests WHERE student_id = ANY($1::int[])",
      [userIds]
    );

    await pool.query(
      "DELETE FROM users WHERE id = ANY($1::int[])",
      [userIds]
    );
  }

  await pool.query(
    "DELETE FROM parents WHERE student_id = $1",
    [normalizedStudentId]
  );

  await pool.query(
    "DELETE FROM students WHERE student_id = $1",
    [normalizedStudentId]
  );

  await pool.query("COMMIT");

  return res.json({
    message: "Student removed successfully"
  });

 } catch (err) {

  await pool.query("ROLLBACK");
  console.log(err);

  return res.status(500).json({
   message:"Server error"
  });

 }

};

exports.resetStudentParentPasswords = async (req, res) => {

 try {

  const { studentId } = req.params;
  const { studentPassword, parentPassword } = req.body || {};

  if (!studentId || !studentId.trim()) {
    return res.status(400).json({
      message: "Student ID is required"
    });
  }

  const normalizedStudentId = studentId.trim();

  const nextStudentPassword = (studentPassword || "").trim();
  const nextParentPassword = (parentPassword || "").trim();

  if (!nextStudentPassword) {
    return res.status(400).json({
      message: "New student password is required"
    });
  }

  await pool.query("BEGIN");

  const studentRow = await pool.query(
    "SELECT student_id FROM students WHERE student_id = $1",
    [normalizedStudentId]
  );

  if (studentRow.rows.length === 0) {
    await pool.query("ROLLBACK");
    return res.status(404).json({
      message: "Student not found"
    });
  }

  const parentRow = await pool.query(
    "SELECT student_id FROM parents WHERE student_id = $1",
    [normalizedStudentId]
  );

  if (parentRow.rows.length > 0 && !nextParentPassword) {
    await pool.query("ROLLBACK");
    return res.status(400).json({
      message: "New parent password is required"
    });
  }

  const hashedStudentPassword = await bcrypt.hash(nextStudentPassword, 10);
  const hashedParentPassword = await bcrypt.hash(nextParentPassword, 10);

  await pool.query(
    "UPDATE students SET password = $1 WHERE student_id = $2",
    [hashedStudentPassword, normalizedStudentId]
  );

  await pool.query(
    "UPDATE users SET password = $1 WHERE student_id = $2 AND role = 'student'",
    [hashedStudentPassword, normalizedStudentId]
  );

  if (parentRow.rows.length > 0) {
    await pool.query(
      "UPDATE parents SET password = $1 WHERE student_id = $2",
      [hashedParentPassword, normalizedStudentId]
    );
  }

  await pool.query("COMMIT");

  return res.json({
    message: "Passwords reset successfully",
    credentials: {
      student_password: nextStudentPassword,
      parent_password: parentRow.rows.length > 0 ? nextParentPassword : null
    }
  });

 } catch (err) {

  await pool.query("ROLLBACK");
  console.log(err);

  return res.status(500).json({
   message:"Server error"
  });

 }

};

exports.searchStaffByName = async (req, res) => {

 try {

  const searchName = String(req.query?.name || "").trim();

  if (!searchName) {
    return res.status(400).json({
      message: "Staff name is required"
    });
  }

  const staffResult = await pool.query(
    `SELECT
      id,
      name,
      email,
      role,
      created_at
     FROM users
     WHERE role = 'security'
       AND name ILIKE $1
     ORDER BY name ASC`,
    [`%${searchName}%`]
  );

  return res.json({
    staff: staffResult.rows
  });

 } catch (err) {

  console.log(err);

  return res.status(500).json({
   message:"Server error"
  });

 }

};

exports.resetStaffPassword = async (req, res) => {

 try {

  const staffId = Number(req.params.staffId);
  const newPassword = String(req.body?.newPassword || "").trim();

  if (!staffId || Number.isNaN(staffId)) {
    return res.status(400).json({
      message: "Valid staff ID is required"
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      message: "New password is required"
    });
  }

  const staffResult = await pool.query(
    "SELECT id FROM users WHERE id = $1 AND role = 'security'",
    [staffId]
  );

  if (staffResult.rows.length === 0) {
    return res.status(404).json({
      message: "Security staff not found"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password = $1 WHERE id = $2 AND role = 'security'",
    [hashedPassword, staffId]
  );

  return res.json({
    message: "Security password reset successfully",
    credentials: {
      security_password: newPassword
    }
  });

 } catch (err) {

  console.log(err);

  return res.status(500).json({
   message:"Server error"
  });

 }

};

exports.removeStaff = async (req, res) => {

 try {

  const staffId = Number(req.params.staffId);

  if (!staffId || Number.isNaN(staffId)) {
    return res.status(400).json({
      message: "Valid staff ID is required"
    });
  }

  await pool.query("BEGIN");

  const staffResult = await pool.query(
    "SELECT id FROM users WHERE id = $1 AND role = 'security'",
    [staffId]
  );

  if (staffResult.rows.length === 0) {
    await pool.query("ROLLBACK");
    return res.status(404).json({
      message: "Security staff not found"
    });
  }

  await pool.query(
    "UPDATE outing_history SET performed_by = NULL WHERE performed_by = $1",
    [staffId]
  );

  await pool.query(
    "DELETE FROM users WHERE id = $1 AND role = 'security'",
    [staffId]
  );

  await pool.query("COMMIT");

  return res.json({
    message: "Security staff removed successfully"
  });

 } catch (err) {

  await pool.query("ROLLBACK");
  console.log(err);

  return res.status(500).json({
   message:"Server error"
  });

 }

};