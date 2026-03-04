require("dotenv").config();   // MUST BE FIRST LINE

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const outingRoutes = require("./routes/outingRoutes");
const parentRoutes = require("./routes/parentRoutes");
const wardenRoutes = require("./routes/wardenRoutes");
const securityRoutes = require("./routes/securityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/outings", outingRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/warden", wardenRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Hostel Management API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});