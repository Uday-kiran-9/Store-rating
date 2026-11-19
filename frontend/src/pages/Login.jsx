import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth, homeFor } from '../AuthContext';

export default function Login() {
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      saveSession(data.token, data.user);
      navigate(homeFor(data.user.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="auth-box">
      <h2>Login</h2>
      {location.state?.registered && (
        <div className="success">Account created. Please log in.</div>
      )}
      {error && <div className="alert">{error}</div>}
      <form onSubmit={submit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>New user? <Link to="/signup">Create an account</Link></p>
    </div>
  );
}