const express = require("express");
const router = express.Router();

const wardenController = require("../controllers/wardenController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
  registerStudent,
  registerParent
} = require("../controllers/wardenController");

// Warden-only registration endpoints
router.post(
  "/register-student",
  authenticate,
  checkRole(["warden"]),
  registerStudent
);

router.post(
  "/register-parent",
  authenticate,
  checkRole(["warden"]),
  registerParent
);

// Warden approvals for outings
router.put(
  "/approve/:id",
  authenticate,
  checkRole(["warden"]),
  wardenController.wardenApprove
);

router.put(
  "/reject/:id",
  authenticate,
  checkRole(["warden"]),
  wardenController.wardenReject
);

module.exports = router;