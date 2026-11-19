const pool = require('../config/db');

const SORT = {
  name: 'u.name',
  email: 'u.email',
  rating: 'r.rating',
  date: 'r.updated_at',
};

exports.dashboard = async (req, res) => {
  const { sortBy, order } = req.query;

  const store = await pool.query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 1)::float AS "averageRating",
            COUNT(r.id)::int AS "totalRatings"
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1
     GROUP BY s.id`,
    [req.user.id]
  );

  if (store.rowCount === 0) {
    return res.status(404).json({ message: 'No store is assigned to your account' });
  }

  const column = SORT[sortBy] || SORT.date;
  const direction = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const raters = await pool.query(
    `SELECT u.id, u.name, u.email, r.rating, r.updated_at AS "ratedAt"
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY ${column} ${direction}`,
    [store.rows[0].id]
  );

  res.json({ store: store.rows[0], raters: raters.rows });
};