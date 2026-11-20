import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';
import UserForm from '../components/UserForm';
import { useSort } from '../useSort';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: true },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    render: (r) => <span className={`badge ${r.role}`}>{r.role.replace('_', ' ')}</span>,
  },
];

export default function AdminUsers() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const { sortBy, order, onSort } = useSort('name');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get('/admin/users', { params: { ...filters, sortBy, order } })
        .then((r) => { setRows(r.data); setError(''); })
        .catch((e) => setError(errorMessage(e)));
    }, 300);
    return () => clearTimeout(t);
  }, [filters, sortBy, order, refresh]);

  const setFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const openDetails = async (row) => {
    try {
      const { data } = await api.get(`/admin/users/${row.id}`);
      setSelected(data);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const addUser = async (values) => {
    await api.post('/admin/users', values);
    setShowForm(false);
    setRefresh((n) => n + 1);
  };

  return (
    <>
      <div className="row">
        <h2>Users</h2>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add user'}</button>
      </div>

      {showForm && (
        <div className="card">
          <UserForm withRole submitLabel="Create user" onSubmit={addUser} />
        </div>
      )}

      <div className="toolbar">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={setFilter} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={setFilter} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={setFilter} />
        <select name="role" value={filters.role} onChange={setFilter}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      {selected && (
        <div className="card">
          <h3>
            User details
            <button className="link" onClick={() => setSelected(null)}>close</button>
          </h3>
          <p><b>Name:</b> {selected.name}</p>
          <p><b>Email:</b> {selected.email}</p>
          <p><b>Address:</b> {selected.address}</p>
          <p><b>Role:</b> {selected.role}</p>
          {selected.role === 'STORE_OWNER' && (
            <p><b>Store rating:</b> {selected.rating ?? 'No ratings yet'}</p>
          )}
        </div>
      )}

      <p className="muted">Click a row to view full details.</p>
      <DataTable
        columns={columns}
        rows={rows}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
        onRowClick={openDetails}
      />
    </>
  );
}