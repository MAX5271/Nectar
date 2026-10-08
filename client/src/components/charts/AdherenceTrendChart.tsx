import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import api from '../../services/api';
import type { MealAdherenceTrendDTO } from '@nectar/types';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { Badge } from '../ui/Badge';

/** Stub bar height for a day with no logged meals, so it reads as "no data" rather than "0%". */
const NO_DATA_STUB = 3;

export function AdherenceTrendChart() {
  const [trend, setTrend] = useState<MealAdherenceTrendDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Kept as a plain promise chain (not async/await) so state is only ever set inside
  // .then/.catch/.finally — never synchronously during the effect's own execution.
  const loadTrend = useCallback(() => {
    api
      .get('/tracking/meals/trend', { params: { days: 30 } })
      .then((res) => {
        if (res.data.success) setTrend(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load adherence trend', err);
        setError("Couldn't load your consistency data.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadTrend();
  }, [loadTrend]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    loadTrend();
  };

  const hasData = !!trend && trend.daysWithLogs > 0;
  const data =
    trend?.points.map((p) => ({
      date: p.date,
      rate: p.adherenceRatePercent,
      barValue: p.adherenceRatePercent ?? NO_DATA_STUB,
    })) ?? [];

  return (
    <ChartCard
      title="Consistency"
      subtitle="How often you stuck to the plan, by day"
      badge={
        hasData && trend.averageAdherenceRatePercent !== null ? (
          <Badge tone="herb">{trend.averageAdherenceRatePercent}% average</Badge>
        ) : undefined
      }
      isLoading={isLoading}
      isEmpty={!hasData}
      error={error}
      onRetry={handleRetry}
      emptyState={{
        icon: <CheckCircle2 className="h-5 w-5" />,
        title: 'No meals logged yet',
        description: 'Mark meals eaten on your dashboard and your consistency will show up here.',
      }}
      footer={<p className="mt-2 text-xs text-ink-soft">Darker means more on-plan that day.</p>}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
                formatValue={(_v, item) => {
                  const rate = (item.payload as { rate: number | null } | undefined)?.rate;
                  return rate === null || rate === undefined ? 'No meals logged' : `${rate}% on-plan`;
                }}
              />
            }
            cursor={{ fill: 'var(--color-linen)' }}
          />
          <Bar dataKey="barValue" name="Adherence" radius={[4, 4, 0, 0]} maxBarSize={16} isAnimationActive={!shouldReduceMotion}>
            {data.map((point) => (
              <Cell
                key={point.date}
                fill={point.rate === null ? 'var(--color-line)' : 'var(--color-herb-dark)'}
                fillOpacity={point.rate === null ? 0.5 : 0.3 + (point.rate / 100) * 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
