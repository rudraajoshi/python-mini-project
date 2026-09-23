import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../layouts/AppShell.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';
import RouteFallback from '../components/app/RouteFallback.jsx';

const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const Documents = lazy(() => import('../pages/Documents.jsx'));
const DocumentDetails = lazy(() => import('../pages/DocumentDetails.jsx'));
const Search = lazy(() => import('../pages/Search.jsx'));
const Ask = lazy(() => import('../pages/Ask.jsx'));
const Collections = lazy(() => import('../pages/Collections.jsx'));
const CollectionDetails = lazy(() => import('../pages/CollectionDetails.jsx'));
const Bookmarks = lazy(() => import('../pages/Bookmarks.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetails />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
