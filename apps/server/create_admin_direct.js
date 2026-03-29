const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function main() {
  const pool = new Pool({
    connectionString: "postgresql://postgres:password@localhost:5432/onchat?schema=public"
  });

  const email = 'md@modassir.info';
  const password = 'Am5361$44';
  const hashedPassword = await bcrypt.hash(password, 10);
  const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const id = crypto.randomUUID();

  try {
    // Check if user exists
    const res = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      // Update
      await pool.query('UPDATE "User" SET password = $1, "isAdmin" = true WHERE email = $2', [hashedPassword, email]);
      console.log('User updated to Super Admin');
    } else {
      // Create
      await pool.query(
        'INSERT INTO "User" (id, email, password, "isAdmin", "shortId", name, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [id, email, hashedPassword, true, shortId, 'Super Admin']
      );
      console.log('Super Admin created');
    }
  } catch (err) {
    console.error('DATABASE_ERROR:', err);
  } finally {
    await pool.end();
  }
}

main();
