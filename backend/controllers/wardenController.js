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