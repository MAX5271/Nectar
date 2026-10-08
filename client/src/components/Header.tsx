import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSmartNavigate } from '../hooks/useSmartNavigate';
import { useAppSelector } from '../hooks/reduxHooks';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';

const Header: React.FC = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const username = useAppSelector(state => state.auth.user?.username);

  const navigate = useSmartNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const routes = {
    'Home': '/',
    'Dashboard': '/dashboard',
    'Progress': '/progress',
    'About': '/about',
  };

  const navItems = ['Home', 'Dashboard', 'Progress', 'About'] as const;

  const handleRoutes = (item: keyof typeof routes) => {
    navigate(routes[item]);
    setIsMobileMenuOpen(false);
  };

  const ctaTarget = isAuthenticated ? '/dashboard' : '/register';
  const ctaLabel = isAuthenticated ? 'Your plan' : 'Get started';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bone/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <button onClick={() => navigate('/')} className="flex items-center transition-opacity hover:opacity-80" aria-label="Nectar, go to home">
          <Logo />
        </button>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-9 text-sm font-medium text-ink-soft">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  onClick={() => handleRoutes(item)}
                  className="group relative cursor-pointer py-2 transition-colors hover:text-ink"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-beet transition-all duration-300 ease-out group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <button onClick={() => navigate('/login')} className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block">
              Log in
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block">
              {username}
            </button>
          )}

          <Button variant="primary" size="sm" onClick={() => navigate(ctaTarget)} className="hidden md:inline-flex">
            {ctaLabel}
          </Button>

          <IconButton
            label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </IconButton>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="border-t border-line bg-bone px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-1 text-sm font-medium text-ink-soft">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  onClick={() => handleRoutes(item)}
                  className="block cursor-pointer py-2.5 transition-colors hover:text-ink"
                >
                  {item}
                </a>
              </li>
            ))}
            {!isAuthenticated ? (
              <li>
                <button
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="block w-full py-2.5 text-left transition-colors hover:text-ink"
                >
                  Log in
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                  className="block w-full py-2.5 text-left transition-colors hover:text-ink"
                >
                  {username}
                </button>
              </li>
            )}
            <li className="pt-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => { navigate(ctaTarget); setIsMobileMenuOpen(false); }}
              >
                {ctaLabel}
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
