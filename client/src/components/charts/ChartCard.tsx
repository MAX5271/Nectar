import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  isLoading: boolean;
  isEmpty: boolean;
  emptyState: { icon: ReactNode; title: string; description: string };
  /** Set when the underlying fetch failed — rendered instead of the empty state, which would otherwise look identical to "no data yet." */
  error?: string | null;
  onRetry?: () => void;
  height?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const DEFAULT_HEIGHT = 'h-[220px] sm:h-[260px] lg:h-[300px]';

/** Shared title/loading/empty/error chrome for every chart — the actual plot goes in `children`, wrapped in a sized container Recharts' ResponsiveContainer needs. */
export function ChartCard({
  title,
  subtitle,
  badge,
  isLoading,
  isEmpty,
  emptyState,
  error,
  onRetry,
  height = DEFAULT_HEIGHT,
  children,
  footer,
}: ChartCardProps) {
  return (
    <Card variant="quiet" padding="md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
        </div>
        {badge}
      </div>

      {isLoading ? (
        <Skeleton className={cn('mt-4', height)} />
      ) : error ? (
        <div className={cn('mt-4 flex items-center', height)}>
          <EmptyState
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Couldn't load this"
            description={error}
            action={onRetry ? <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button> : undefined}
            className="w-full"
          />
        </div>
      ) : isEmpty ? (
        <div className={cn('mt-4 flex items-center', height)}>
          <EmptyState icon={emptyState.icon} title={emptyState.title} description={emptyState.description} className="w-full" />
        </div>
      ) : (
        <>
          <div className={cn('mt-4', height)}>{children}</div>
          {footer}
        </>
      )}
    </Card>
  );
}
