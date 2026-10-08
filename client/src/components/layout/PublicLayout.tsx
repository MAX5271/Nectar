import React, { Suspense } from 'react';
import { Outlet, useNavigation, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import { NectarMark } from '../nectar/NectarMark';
import { NectarButton } from '../ui/NectarButton';
import Footer from '../Footer';
import Loader from '../Loader';
import { Toaster } from '../ui/Toaster';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const PublicLayout: React.FC = () => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = navigation.state === 'loading';

  return (
    <div className="flex min-h-screen flex-col bg-linen text-ink">
      {isLoading && <Loader />}

      {/* Lightweight Editorial Marketing Header */}
      <header className="sticky top-0 z-40 w-full border-b border-line bg-bone-light/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="Nectar home">
            <NectarMark size="md" />
          </Link>

          <nav className="flex items-center gap-6 sm:gap-8">
            <Link
              to="/about"
              className="text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors"
            >
              About
            </Link>

            {isAuthenticated ? (
              <NectarButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Go to Today →
              </NectarButton>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  to="/login"
                  className="text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  Sign in
                </Link>
                <NectarButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Start free
                </NectarButton>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Public Footer */}
      <Footer />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};
