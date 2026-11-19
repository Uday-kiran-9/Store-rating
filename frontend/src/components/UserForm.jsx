import { useState } from 'react';
import Field from './Field';
import { validate } from '../validation';
import { errorMessage } from '../api';

const EMPTY = { name: '', email: '', address: '', password: '', role: 'USER' };

export default function UserForm({ withRole, submitLabel, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values, ['name', 'email', 'address', 'password']);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
    } catch (err) {
      setServerError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Name (20-60 characters)" error={errors.name}>
        <input name="name" value={values.name} onChange={set} />
      </Field>
      <Field label="Email" error={errors.email}>
        <input name="email" type="email" value={values.email} onChange={set} />
      </Field>
      <Field label="Address (max 400 characters)" error={errors.address}>
        <textarea name="address" rows="2" value={values.address} onChange={set} />
      </Field>
      <Field label="Password" error={errors.password}>
        <input name="password" type="password" value={values.password} onChange={set} />
      </Field>
      {withRole && (
        <Field label="Role">
          <select name="role" value={values.role} onChange={set}>
            <option value="USER">Normal User</option>
            <option value="ADMIN">Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </Field>
      )}
      {serverError && <div className="alert">{serverError}</div>}
      <button type="submit" disabled={busy}>{busy ? 'Please wait...' : submitLabel}</button>
    </form>
  );
}