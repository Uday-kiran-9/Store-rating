import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';
import { useSort } from '../useSort';

function RateCell({ store, onSaved }) {
  const [value, setValue] = useState(store.myRating || 5);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/stores/${store.id}/rating`, { rating: Number(value) });
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="rate">
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <button disabled={busy} onClick={save}>{store.myRating ? 'Modify' : 'Submit'}</button>
    </span>
  );
}

export default function UserStores() {
  const [search, setSearch] = useState('');
  const { sortBy, order, onSort } = useSort('name');
  const [rows, setRows] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get('/stores', { params: { search, sortBy, order } })
        .then((r) => { setRows(r.data); setError(''); })
        .catch((e) => setError(errorMessage(e)));
    }, 300);
    return () => clearTimeout(t);
  }, [search, sortBy, order, refresh]);

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'overallRating', sortKey: 'rating', label: 'Overall Rating', sortable: true },
    { key: 'myRating', label: 'Your Rating', render: (r) => r.myRating ?? 'Not rated' },
    {
      key: 'action',
      label: 'Rate',
      render: (r) => <RateCell store={r} onSaved={() => setRefresh((n) => n + 1)} />,
    },
  ];

  return (
    <>
      <h2>Stores</h2>
      <div className="toolbar">
        <input
          placeholder="Search by store name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="alert">{error}</div>}
      <DataTable columns={columns} rows={rows} sortBy={sortBy} order={order} onSort={onSort} />
    </>
  );
}