const express = require("express");
const router = express.Router();

const outingController = require("../controllers/outingController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post(
  "/create",
  authenticate,
  checkRole(["student"]),
  outingController.createOuting
);

module.exports = router;