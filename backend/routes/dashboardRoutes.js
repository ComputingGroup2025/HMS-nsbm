const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Warden Dashboard
router.get(
  "/warden",
  authenticate,
  checkRole(["warden"]),
  dashboardController.getWardenDashboard
);

router.get(
  "/warden/past-summaries",
  authenticate,
  checkRole(["warden"]),
  dashboardController.getWardenPastSummariesByDate
);

module.exports = router;