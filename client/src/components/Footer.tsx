import React from 'react';

const Footer: React.FC = () => {

  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm shadow-sm">
                🍯
              </div>
              <span className="text-xl font-black tracking-tighter text-zinc-900">
                NECTAR
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Fuel your potential with precision-engineered diet plans and performance tracking.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Platform</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600">
              <li><a href="#" className="hover:text-amber-600 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-amber-600 transition-colors">Diet Planner</a></li>
              <li><a href="#" className="hover:text-amber-600 transition-colors">Meal Logs</a></li>
              <li><a href="#" className="hover:text-amber-600 transition-colors">Pro Features</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Resources</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600">
              <li><a href="#" className="hover:text-amber-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-amber-600 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-amber-600 transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Stay Connected</h3>
            <p className="mt-4 text-sm text-zinc-600">Join our newsletter for weekly fitness insights.</p>
            <form className="mt-4 flex max-w-md gap-x-2">
              <input
                type="email"
                required
                placeholder="Enter email"
                className="min-w-0 flex-auto rounded-md border-0 bg-zinc-100 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6 outline-none"
              />
              <button className="flex-none rounded-md bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-all">
                Join
              </button>
            </form>
          </div>

        </div>
        
        <div className="mt-12 border-t border-zinc-100 pt-8 text-center">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Nectar Health Systems. Built for high-performance engineering.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;