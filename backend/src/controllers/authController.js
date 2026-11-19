const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

exports.signup = async (req, res) => {
  const { name, email, password, address } = req.body;

  const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rowCount > 0) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING id, name, email, address, role`,
    [name, email, passwordHash, address]
  );

  res.status(201).json({ user: rows[0] });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await pool.query(
    'SELECT id, name, email, address, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];

  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const { password_hash, ...safeUser } = user;
  res.json({ token: signToken(safeUser), user: safeUser });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const { rows } = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.id]
  );
  const valid = rows[0] && (await bcrypt.compare(currentPassword, rows[0].password_hash));
  if (!valid) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    newHash,
    req.user.id,
  ]);

  res.json({ message: 'Password updated successfully' });
};