require("dotenv").config();
const mysql = require("mysql2/promise");

async function createDb() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASS;
  const dbName = process.env.DB_NAME;

  console.log(`Connecting to ${host}:${port} as ${user} ...`);
  try {
    const conn = await mysql.createConnection({
      host, port, user, password: pass, multipleStatements: true
    });
    const sql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`;
    await conn.query(sql);
    console.log(`✅ Database '${dbName}' ensured/created.`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create database:', err.message);
    process.exit(1);
  }
}
createDb();
