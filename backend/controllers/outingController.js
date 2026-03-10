const pool = require("../config/db");
const logOutingHistory = require("../utils/logOutingHistory");

exports.createOuting = async (req,res)=>{

  try{

    const {
      student_id,
      room_number,
      destination,
      reason,
      leaving_date,
      leaving_time,
      return_date,
      return_time
    } = req.body;

    await pool.query(
      `INSERT INTO outing_requests
      (student_id,room_number,destination,reason,leaving_date,leaving_time,return_date,return_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        student_id,
        room_number,
        destination,
        reason,
        leaving_date,
        leaving_time,
        return_date,
        return_time
      ]
    );

    res.json({
      message:"Outing request created"
    });

  }
  catch(err){

    console.log(err);

    res.status(500).json({
      message:"Server error"
    });

  }

};