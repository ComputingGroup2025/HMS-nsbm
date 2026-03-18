const { Pool } = require("pg");

const useConnectionString = Boolean(process.env.DATABASE_URL);
const dbSslRejectUnauthorized =
  String(process.env.DB_SSL_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true";

const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 30000),
        ssl: {
          rejectUnauthorized: dbSslRejectUnauthorized
        }
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "hostel_management",
        password: process.env.DB_PASSWORD || "1234",
        port: process.env.DB_PORT || 5432,
        connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 30000)
      }
);

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.code || "", err.message || err);
});

module.exports = pool;