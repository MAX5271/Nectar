import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/reduxHooks';
import Loader from './Loader';

const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen">
        <Loader />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
