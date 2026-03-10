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

// Student: list own outing requests
router.get(
  "/my-requests",
  authenticate,
  checkRole(["student"]),
  outingController.getMyOutings
);

// Student: detailed outing history timeline
router.get(
  "/history",
  authenticate,
  checkRole(["student"]),
  outingController.getOutingHistory
);

module.exports = router;