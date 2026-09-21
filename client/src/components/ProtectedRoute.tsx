import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/reduxHooks';

const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
        [INITIALIZING OPERATIVE SESSION...]
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
