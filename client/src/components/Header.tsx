import React, { useState } from 'react';
import { useSmartNavigate } from '../hooks/useSmartNavigate';
import { useAppSelector } from '../hooks/reduxHooks';

const Header: React.FC = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const username = useAppSelector(state => state.auth.user?.username);

  const navigate = useSmartNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const routes = {
    'Dashboard': '/dashboard',
    'Diet Plan': '/diet-history',
  }

  // writing as const after the array means that the array won't change after initialization
  const navItems = ['Dashboard', 'Diet Plan'] as const;

  const handleRoutes = (item: keyof typeof routes) => {
    navigate(routes[item] as string);
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-red-600 bg-black">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        
        <div onClick={() => navigate('/')} className="flex cursor-pointer items-center gap-4 transition-transform hover:scale-105">
          <div className="flex h-12 w-12 items-center justify-center bg-red-600 text-2xl font-black text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            N/
          </div>
          <span className="text-3xl font-black uppercase tracking-widest text-white">
            Nectar
          </span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-zinc-500">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  onClick={() => handleRoutes(item)}
                  className="group relative cursor-pointer py-2 transition-colors hover:text-white"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 h-1 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-8">
          {!isAuthenticated ? (
            <button onClick={() => navigate('/login')} className="hidden text-sm font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-white sm:block">
              Log in
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="hidden text-sm font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-white sm:block">
              {username}
            </button>
          )}
          
          <button onClick={() => navigate('/about')} className="hidden transform bg-red-600 px-8 py-3 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none md:block">
            Initialize
          </button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="block p-2 text-white hover:text-red-600 md:hidden"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="border-t border-zinc-800 bg-black px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  onClick={() => handleRoutes(item)}
                  className="block cursor-pointer py-2 transition-colors hover:text-white"
                >
                  {item}
                </a>
              </li>
            ))}
            {!isAuthenticated ? (
              <li>
                <button 
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} 
                  className="block w-full py-2 text-left uppercase tracking-wider transition-colors hover:text-white"
                >
                  Log in
                </button>
              </li>
            ) : (
              <li>
                <button 
                  onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} 
                  className="block w-full py-2 text-left uppercase tracking-wider transition-colors hover:text-white"
                >
                  {username}
                </button>
              </li>
            )}
            <li className="pt-2">
              <button 
                onClick={() => { navigate('/about'); setIsMobileMenuOpen(false); }} 
                className="w-full transform bg-red-600 px-8 py-3 text-center text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none"
              >
                Initialize
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;