import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LINKS = {
  ADMIN: [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/stores', 'Stores']],
  USER: [['/stores', 'Stores']],
  STORE_OWNER: [['/owner', 'Dashboard']],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="nav">
        <strong>Store Ratings</strong>
        {(LINKS[user.role] || []).map(([to, label]) => (
          <Link key={to} to={to}>{label}</Link>
        ))}
        <span className="spacer" />
        <Link to="/password">Change Password</Link>
        <span>{user.role}</span>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main className="container">{children}</main>
    </>
  );
}