import pg from "pg";

const { Pool, types } = pg;

// Return big numbers (ids) as normal numbers, like MySQL did
types.setTypeParser(20, (value) => Number(value));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const db = {
  query: (text, params) => pool.query(text, params),
};

export default db;
