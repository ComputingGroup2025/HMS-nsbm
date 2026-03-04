const express = require("express");
const router = express.Router();

const parentController = require("../controllers/parentController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.put(
  "/approve/:id",
  authenticate,
  checkRole(["parent"]),
  parentController.parentApprove
);

router.put(
  "/reject/:id",
  authenticate,
  checkRole(["parent"]),
  parentController.parentReject
);

module.exports = router;