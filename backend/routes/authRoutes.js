const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Student / Staff Register
router.post("/register", authController.register);

// Student Login (email + password)
router.post("/login", authController.login);

// Parent Login (student_id + parent_password)
router.post("/parent-login", authController.parentLogin);

module.exports = router;