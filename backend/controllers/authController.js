const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* ==============================
   Register User
============================== */

exports.register = async (req, res) => {

  try {

    const { name, email, password, role, student_id, parent_password } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let hashedParentPassword = null;

    if (role === "student") {

      if (!student_id || !parent_password) {
        return res.status(400).json({
          message: "Student must have student_id and parent_password"
        });
      }

      hashedParentPassword = await bcrypt.hash(parent_password, 10);
    }

    await pool.query(
      `INSERT INTO users
      (name,email,password,role,student_id,parent_password)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        name,
        email || null,
        hashedPassword,
        role,
        student_id || null,
        hashedParentPassword
      ]
    );

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/* ==============================
   User Login
============================== */

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    // First try users table (staff/legacy users), then fallback to students table.
    let account = null;
    let accountRole = null;

    if (result.rows.length > 0) {
      account = result.rows[0];
      accountRole = account.role;
    } else {
      const studentResult = await pool.query(
        "SELECT * FROM students WHERE email=$1",
        [email]
      );

      if (studentResult.rows.length === 0) {
        return res.status(400).json({
          message: "User not found"
        });
      }

      account = studentResult.rows[0];
      accountRole = "student";
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: account.id,
        role: accountRole
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: account.id,
        name: account.name || account.full_name,
        role: accountRole
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/* ==============================
   Parent Login
============================== */

exports.parentLogin = async (req, res) => {
  try {
    const { student_id, parent_password } = req.body;

    const result = await pool.query(
      "SELECT * FROM parents WHERE student_id = $1",
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Parent not found" });
    }

    const parent = result.rows[0];

    const isMatch = await bcrypt.compare(
      parent_password,
      parent.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid parent password" });
    }

    const token = jwt.sign(
      { id: parent.id, role: "parent" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Parent login successful",
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};