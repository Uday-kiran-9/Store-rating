import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, homeFor } from './AuthContext';
import Protected from './components/Protected';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStores from './pages/AdminStores';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';

const page = (roles, element) => (
  <Protected roles={roles}>
    <Layout>{element}</Layout>
  </Protected>
);

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={page(['ADMIN'], <AdminDashboard />)} />
      <Route path="/admin/users" element={page(['ADMIN'], <AdminUsers />)} />
      <Route path="/admin/stores" element={page(['ADMIN'], <AdminStores />)} />
      <Route path="/stores" element={page(['USER'], <UserStores />)} />
      <Route path="/owner" element={page(['STORE_OWNER'], <OwnerDashboard />)} />
      <Route
        path="/password"
        element={page(['ADMIN', 'USER', 'STORE_OWNER'], <ChangePassword />)}
      />
      <Route
        path="*"
        element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />}
      />
    </Routes>
  );
}