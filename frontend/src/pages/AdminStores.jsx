import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import DataTable from '../components/DataTable';
import Field from '../components/Field';
import { useSort } from '../useSort';
import { validate } from '../validation';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: true },
  { key: 'rating', label: 'Rating', sortable: true },
];

function StoreForm({ onCreated }) {
  const [values, setValues] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'STORE_OWNER' } }).then((r) => setOwners(r.data));
  }, []);

  const set = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, ['name', 'email', 'address']);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;
    try {
      await api.post('/admin/stores', {
        name: values.name,
        email: values.email,
        address: values.address,
        ownerId: values.ownerId ? Number(values.ownerId) : null,
      });
      onCreated();
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Store name (20-60 characters)" error={errors.name}>
        <input name="name" value={values.name} onChange={set} />
      </Field>
      <Field label="Store email" error={errors.email}>
        <input name="email" type="email" value={values.email} onChange={set} />
      </Field>
      <Field label="Address (max 400 characters)" error={errors.address}>
        <textarea name="address" rows="2" value={values.address} onChange={set} />
      </Field>
      <Field label="Store owner (optional)">
        <select name="ownerId" value={values.ownerId} onChange={set}>
          <option value="">No owner</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
          ))}
        </select>
      </Field>
      {serverError && <div className="alert">{serverError}</div>}
      <button type="submit">Create store</button>
    </form>
  );
}

export default function AdminStores() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const { sortBy, order, onSort } = useSort('name');
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get('/admin/stores', { params: { ...filters, sortBy, order } })
        .then((r) => { setRows(r.data); setError(''); })
        .catch((e) => setError(errorMessage(e)));
    }, 300);
    return () => clearTimeout(t);
  }, [filters, sortBy, order, refresh]);

  const setFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <>
      <div className="row">
        <h2>Stores</h2>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add store'}</button>
      </div>

      {showForm && (
        <div className="card">
          <StoreForm onCreated={() => { setShowForm(false); setRefresh((n) => n + 1); }} />
        </div>
      )}

      <div className="toolbar">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={setFilter} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={setFilter} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={setFilter} />
      </div>

      {error && <div className="alert">{error}</div>}
      <DataTable columns={columns} rows={rows} sortBy={sortBy} order={order} onSort={onSort} />
    </>
  );
}