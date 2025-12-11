const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
  const cfg = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 10000
  };

  console.log("Attempting connect with config:", { host: cfg.host, port: cfg.port, user: cfg.user });
  try {
    const conn = await mysql.createConnection(cfg);
    console.log("Connected — running simple query...");
    const [rows] = await conn.query("SELECT NOW() AS now");
    console.log("Query result:", rows);
    await conn.end();
    console.log("Connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Connection test failed:", err);
    process.exit(1);
  }
})();
