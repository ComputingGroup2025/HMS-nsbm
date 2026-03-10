const express = require("express");
const router = express.Router();

const securityController = require("../controllers/securityController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.put(
  "/exit/:id",
  authenticate,
  checkRole(["security"]),
  securityController.securityExit
);

router.put(
  "/return/:id",
  authenticate,
  checkRole(["security"]),
  securityController.securityReturn
);

// Daily list for security dashboard
router.get(
  "/today",
  authenticate,
  checkRole(["security"]),
  securityController.listTodayOutings
);

module.exports = router;