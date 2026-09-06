import 'dotenv/config';
import fs from 'fs';
import db from './db/db.config.js';

async function runSchema() {
  try {
    const sql = fs.readFileSync('./db/schema.sql', 'utf8');
    const connection = await db.getConnection();
    await connection.query(sql);
    connection.release();
    console.log('Schema applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying schema:', error.message);
    process.exit(1);
  }
}

runSchema();