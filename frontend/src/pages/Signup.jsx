import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import UserForm from '../components/UserForm';

export default function Signup() {
  const navigate = useNavigate();

  const signup = async ({ name, email, address, password }) => {
    await api.post('/auth/signup', { name, email, address, password });
    navigate('/login', { state: { registered: true } });
  };

  return (
    <div className="auth-box">
      <h2>Sign up</h2>
      <UserForm submitLabel="Sign up" onSubmit={signup} />
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}