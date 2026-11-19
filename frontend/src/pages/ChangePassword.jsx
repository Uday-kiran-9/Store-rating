import { useState } from 'react';
import api, { errorMessage } from '../api';
import { validators } from '../validation';

export default function ChangePassword() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    const msg = validators.password(values.newPassword);
    if (msg) return setError(msg);
    try {
      await api.put('/auth/password', values);
      setOk('Password updated successfully');
      setValues({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Change Password</h2>
      {error && <div className="alert">{error}</div>}
      {ok && <div className="success">{ok}</div>}
      <form onSubmit={submit}>
        <label className="field">
          <span>Current password</span>
          <input
            type="password"
            value={values.currentPassword}
            onChange={(e) => setValues({ ...values, currentPassword: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>New password</span>
          <input
            type="password"
            value={values.newPassword}
            onChange={(e) => setValues({ ...values, newPassword: e.target.value })}
            required
          />
        </label>
        <button type="submit">Update password</button>
      </form>
    </div>
  );
}