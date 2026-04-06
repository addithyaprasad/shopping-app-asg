import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

export async function healthCheck() {
  await pool.query("SELECT 1");
}