const pool = require('../config/db');

const SORT = {
  name: 's.name',
  address: 's.address',
  rating: 'AVG(r.rating)',
};

exports.listStores = async (req, res) => {
  const { search, sortBy, order } = req.query;

  const values = [req.user.id];
  let where = '';
  if (search) {
    values.push(`%${search}%`);
    where = 'WHERE s.name ILIKE $2 OR s.address ILIKE $2';
  }

  const column = SORT[sortBy] || SORT.name;
  const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 1)::float AS "overallRating",
            MAX(mine.rating) AS "myRating"
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     LEFT JOIN ratings mine ON mine.store_id = s.id AND mine.user_id = $1
     ${where}
     GROUP BY s.id
     ORDER BY ${column} ${direction} NULLS LAST`,
    values
  );

  res.json(rows);
};

exports.submitRating = async (req, res) => {
  const storeId = Number(req.params.id);
  if (!Number.isInteger(storeId)) {
    return res.status(400).json({ message: 'Invalid store id' });
  }

  const store = await pool.query('SELECT 1 FROM stores WHERE id = $1', [storeId]);
  if (store.rowCount === 0) {
    return res.status(404).json({ message: 'Store not found' });
  }

  const { rows } = await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()
     RETURNING store_id AS "storeId", rating`,
    [req.user.id, storeId, req.body.rating]
  );

  res.json(rows[0]);
};