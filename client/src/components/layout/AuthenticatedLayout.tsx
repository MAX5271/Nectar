import React, { useState, Suspense } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { MobileBottomNav } from './MobileBottomNav';
import Loader from '../Loader';
import { Toaster } from '../ui/Toaster';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const AuthenticatedLayout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="flex min-h-screen bg-linen text-ink">
      {isLoading && <Loader />}

      {/* Primary Sidebar (Desktop & Mobile Drawer) */}
      <AppSidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
        <AppTopBar onMobileMenuOpen={() => setIsMobileNavOpen(true)} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};
