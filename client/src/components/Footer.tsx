import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-line bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-ink-soft">
              A diet plan built around your body and your goals — one meal at a time.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Platform</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-soft">
              <li><Link to="/dashboard" className="transition-colors hover:text-beet">Your plan</Link></li>
              <li><Link to="/progress" className="transition-colors hover:text-beet">Progress</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-beet">About Nectar</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center">
          <p className="text-xs text-ink-soft">
            &copy; {new Date().getFullYear()} Nectar. Built for people who want to eat well.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
