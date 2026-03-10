const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

// Return the current authenticated user (decoded from JWT)
router.get(
  "/me",
  authenticate,
  (req, res) => {
    res.json({
      id: req.user.id,
      role: req.user.role
    });
  }
);

module.exports = router;

