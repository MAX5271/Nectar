import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, TrendingUp, UtensilsCrossed, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavEntry {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navEntries: NavEntry[] = [
  { name: 'Today', href: '/dashboard', icon: CalendarDays },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Meals', href: '/meals', icon: UtensilsCrossed },
  { name: 'Profile', href: '/profile', icon: User },
];

export const MobileBottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-line bg-bone-light/95 backdrop-blur-md px-2 safe-area-bottom"
    >
      {navEntries.map((entry) => {
        const Icon = entry.icon;
        return (
          <NavLink
            key={entry.href}
            to={entry.href}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center w-16 py-1 select-none transition-colors duration-200',
                isActive ? 'text-beet font-medium' : 'text-ink-muted hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                <span className="text-[11px] font-sans mt-0.5 tracking-tight">{entry.name}</span>
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-beet" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
