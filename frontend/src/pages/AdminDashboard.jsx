import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!stats) return <p>Loading...</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card"><div className="big">{stats.totalUsers}</div>Total Users</div>
        <div className="card"><div className="big">{stats.totalStores}</div>Total Stores</div>
        <div className="card"><div className="big">{stats.totalRatings}</div>Total Ratings</div>
      </div>
    </>
  );
}