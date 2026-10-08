import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  TrendingUp,
  UtensilsCrossed,
  SlidersHorizontal,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { endSession } from '../../services/authFlow';
import { NectarMark } from '../nectar/NectarMark';
import { cn } from '../../lib/utils';

export interface AppSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Today', href: '/dashboard', icon: CalendarDays },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Meals', href: '/meals', icon: UtensilsCrossed },
  { name: 'Your System', href: '/profile', icon: SlidersHorizontal },
  { name: 'Security', href: '/security', icon: ShieldCheck },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isAnonymous = user?.isAnonymous || !user?.email;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nectar_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nectar_sidebar_collapsed', String(isCollapsed));
    } catch {
      // storage unavailable
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    await endSession(dispatch);
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-bone-light border-r border-line">
      {/* Top: Logo & Navigation */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-line/60">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <NectarMark size="sm" showText={!isCollapsed} />
          </NavLink>

          {/* Mobile close button */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-bone transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-bone transition-colors border border-transparent hover:border-line"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-200 select-none',
                    isActive
                      ? 'bg-bone text-ink shadow-warm-sm border border-line/80 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-bone/60',
                    isCollapsed && 'justify-center px-2',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative flex items-center justify-center">
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive ? 'text-beet' : 'text-ink-muted group-hover:text-ink',
                        )}
                      />
                      {isActive && (
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-beet" />
                      )}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-turmeric-subtle text-turmeric-dark border border-turmeric/20">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Guest Alert / Account Profile & Sign Out */}
      <div className="pt-4 border-t border-line/60 space-y-3">
        {/* Anonymous Guest Alert */}
        {isAnonymous && !isCollapsed && (
          <div className="p-3 rounded-xl bg-turmeric-subtle border border-turmeric/30 text-xs">
            <div className="flex items-center gap-1.5 text-turmeric-dark font-medium font-sans">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Guest Session</span>
            </div>
            <p className="mt-1 text-ink-muted text-[11px] leading-relaxed">
              Your plan is stored on this device. Save your account to sync everywhere.
            </p>
            <NavLink
              to="/welcome"
              onClick={onMobileClose}
              className="mt-2 inline-flex items-center text-[11px] font-medium font-sans text-turmeric-dark underline underline-offset-2 hover:text-ink"
            >
              Secure account →
            </NavLink>
          </div>
        )}

        {/* User Card */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl p-2 transition-colors',
            isCollapsed ? 'justify-center' : 'bg-bone/50 border border-line/40',
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beet text-bone text-xs font-mono font-medium">
            {user?.name ? user.name[0].toUpperCase() : 'N'}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-medium text-ink font-sans">
                {user?.name || (isAnonymous ? 'Guest Traveler' : 'Explorer')}
              </div>
              <div className="truncate text-[10px] font-mono text-ink-muted">
                {user?.email || 'Temporary guest'}
              </div>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="p-1.5 rounded-lg text-ink-muted hover:text-beet hover:bg-bone transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed logout icon */}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="w-full flex items-center justify-center p-2 rounded-xl text-ink-muted hover:text-beet hover:bg-bone transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Pinned) */}
      <aside
        className={cn(
          'hidden md:block shrink-0 sticky top-0 h-screen transition-all duration-300 z-30',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full shadow-warm-lg z-10 animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
