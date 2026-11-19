require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'ADMIN')
     ON CONFLICT (email) DO NOTHING`,
    [
      'System Administrator Account',
      'admin@example.com',
      passwordHash,
      'Head Office, Bengaluru',
    ]
  );

  console.log('Admin ready: admin@example.com / Admin@12345');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});