import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';
import { useSort } from '../useSort';

const columns = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'rating', label: 'Rating', sortable: true },
  {
    key: 'ratedAt',
    sortKey: 'date',
    label: 'Date',
    sortable: true,
    render: (r) => new Date(r.ratedAt).toLocaleDateString(),
  },
];

export default function OwnerDashboard() {
  const { sortBy, order, onSort } = useSort('date', 'desc');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/owner/dashboard', { params: { sortBy, order } })
      .then((r) => { setData(r.data); setError(''); })
      .catch((e) => setError(errorMessage(e)));
  }, [sortBy, order]);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <p>Loading...</p>;

  return (
    <>
      <h2>{data.store.name}</h2>
      <p className="muted">{data.store.address}</p>
      <div className="cards">
        <div className="card">
          <div className="big">{data.store.averageRating ?? '—'}</div>Average Rating
        </div>
        <div className="card">
          <div className="big">{data.store.totalRatings}</div>Total Ratings
        </div>
      </div>
      <h3>Users who rated your store</h3>
      <DataTable
        columns={columns}
        rows={data.raters}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
      />
    </>
  );
}