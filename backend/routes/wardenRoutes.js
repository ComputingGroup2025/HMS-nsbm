const express = require("express");
const router = express.Router();

const wardenController = require("../controllers/wardenController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const {
  registerStudent,
  registerParent,
  searchStudentAndParent,
  removeStudent,
  resetStudentParentPasswords
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

router.get(
  "/search/:studentId",
  authenticate,
  checkRole(["warden"]),
  searchStudentAndParent
);

router.delete(
  "/remove-student/:studentId",
  authenticate,
  checkRole(["warden"]),
  removeStudent
);

router.post(
  "/reset-passwords/:studentId",
  authenticate,
  checkRole(["warden"]),
  resetStudentParentPasswords
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