const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/db');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const result = await pool.query('SELECT now()');
  res.json({ ok: true, time: result.rows[0].now });
});

app.use('/api/auth', require('./routes/authRoutes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;