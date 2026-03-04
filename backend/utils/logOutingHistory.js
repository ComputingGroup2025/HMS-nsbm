const pool = require("../config/db");

async function logOutingHistory(outingId, action, userId) {

  await pool.query(
    `INSERT INTO outing_history (outing_id, action, performed_by)
     VALUES ($1,$2,$3)`,
    [outingId, action, userId]
  );

}

module.exports = logOutingHistory;