import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BootSplash from '../components/app/BootSplash.jsx';

export default function PublicOnlyRoute() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <BootSplash />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
