const express = require("express");
const router = express.Router();

const wardenController = require("../controllers/wardenController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
 registerStudent,
 registerParent
} = require("../controllers/wardenController");

router.post("/register-student", registerStudent);

router.post("/register-parent", registerParent);

module.exports = router;