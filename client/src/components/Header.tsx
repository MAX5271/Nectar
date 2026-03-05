import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {

  const navigate = useNavigate();

  const handleLogin = ()=>{
    navigate('/login');
  }

  const handleTitle = ()=>{
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-red-600 bg-black">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        
        <div className="flex cursor-pointer items-center gap-4 transition-transform hover:scale-105">
          <div className="flex h-12 w-12 items-center justify-center bg-red-600 text-2xl font-black text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            N/
          </div>
          <span onClick={handleTitle} className="text-3xl font-black uppercase tracking-widest text-white">
            Nectar
          </span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-zinc-500">
            {['Dashboard', 'Diet Plan', 'Stats'].map((item) => (
              <li key={item}>
                <a 
                  href="#" 
                  className="group relative py-2 transition-colors hover:text-white"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 h-1 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-8">
          <button onClick={handleLogin} className="hidden text-sm font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-white sm:block">
            Log in
          </button>
          
          <button className="hidden transform bg-red-600 px-8 py-3 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none md:block">
            Initialize
          </button>
          
          <button className="block p-2 text-white hover:text-red-600 md:hidden">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
      </div>
    </header>
  );
};

export default Header;