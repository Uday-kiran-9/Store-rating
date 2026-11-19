const bcrypt = require('bcrypt');
const pool = require('../config/db');

const ROLES = ['ADMIN', 'USER', 'STORE_OWNER'];

// Whitelists: only these keys may be used for sorting.
const USER_SORT = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
};
const STORE_SORT = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'AVG(r.rating)',
};

function orderBy(map, sortBy, order) {
  const column = map[sortBy] || map.name;
  const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${column} ${direction} NULLS LAST`;
}

// Builds "WHERE a ILIKE $1 AND b ILIKE $2" safely.
function buildFilters(filters) {
  const conditions = [];
  const values = [];
  for (const { sql, value } of filters) {
    if (value === undefined || value === '') continue;
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  }
  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
}

exports.getStats = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)   ::int AS "totalUsers",
      (SELECT COUNT(*) FROM stores)  ::int AS "totalStores",
      (SELECT COUNT(*) FROM ratings) ::int AS "totalRatings"
  `);
  res.json(rows[0]);
};

exports.createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rowCount > 0) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role`,
    [name, email, passwordHash, address, role]
  );
  res.status(201).json({ user: rows[0] });
};

exports.createStore = async (req, res) => {
  const { name, email, address } = req.body;
  const ownerId = req.body.ownerId || null;

  const dup = await pool.query('SELECT 1 FROM stores WHERE email = $1', [email]);
  if (dup.rowCount > 0) {
    return res.status(409).json({ message: 'A store with this email already exists' });
  }

  if (ownerId) {
    const owner = await pool.query('SELECT role FROM users WHERE id = $1', [ownerId]);
    if (owner.rowCount === 0) {
      return res.status(400).json({ message: 'Owner user not found' });
    }
    if (owner.rows[0].role !== 'STORE_OWNER') {
      return res.status(400).json({ message: 'Selected user is not a store owner' });
    }
    const taken = await pool.query('SELECT 1 FROM stores WHERE owner_id = $1', [ownerId]);
    if (taken.rowCount > 0) {
      return res.status(409).json({ message: 'This owner already has a store' });
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id AS "ownerId"`,
    [name, email, address, ownerId]
  );
  res.status(201).json({ store: rows[0] });
};

exports.listUsers = async (req, res) => {
  const { name, email, address, role, sortBy, order } = req.query;

  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role filter' });
  }

  const { where, values } = buildFilters([
    { sql: 'u.name ILIKE ?', value: name && `%${name}%` },
    { sql: 'u.email ILIKE ?', value: email && `%${email}%` },
    { sql: 'u.address ILIKE ?', value: address && `%${address}%` },
    { sql: 'u.role = ?', value: role },
  ]);

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role
     FROM users u
     ${where}
     ORDER BY ${orderBy(USER_SORT, sortBy, order)}`,
    values
  );
  res.json(rows);
};

exports.listStores = async (req, res) => {
  const { name, email, address, sortBy, order } = req.query;

  const { where, values } = buildFilters([
    { sql: 's.name ILIKE ?', value: name && `%${name}%` },
    { sql: 's.email ILIKE ?', value: email && `%${email}%` },
    { sql: 's.address ILIKE ?', value: address && `%${address}%` },
  ]);

  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 1)::float AS rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${where}
     GROUP BY s.id
     ORDER BY ${orderBy(STORE_SORT, sortBy, order)}`,
    values
  );
  res.json(rows);
};

exports.getUser = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const { rows } = await pool.query(
    'SELECT id, name, email, address, role FROM users WHERE id = $1',
    [id]
  );
  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'STORE_OWNER') {
    const result = await pool.query(
      `SELECT ROUND(AVG(r.rating), 1)::float AS rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1`,
      [id]
    );
    user.rating = result.rows[0].rating;
  }

  res.json(user);
};