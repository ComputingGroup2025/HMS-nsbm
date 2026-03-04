const express = require("express");
const router = express.Router();

const wardenController = require("../controllers/wardenController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

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