import { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import api from '../../services/api';
import type { WeightTrendDTO } from '@nectar/types';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { Badge } from '../ui/Badge';

interface WeightTrendChartProps {
  unitSystem?: string;
}

const TREND_TONE = { LOSING: 'beet', GAINING: 'turmeric' } as const;
const TREND_LABEL = { LOSING: 'Trending down', GAINING: 'Trending up', MAINTAINING: 'Stable' } as const;

export function WeightTrendChart({ unitSystem = 'METRIC' }: WeightTrendChartProps) {
  const [trend, setTrend] = useState<WeightTrendDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const unitLabel = unitSystem !== 'IMPERIAL' ? 'kg' : 'lb';

  // Kept as a plain promise chain (not async/await) so state is only ever set inside
  // .then/.catch/.finally — never synchronously during the effect's own execution.
  const loadTrend = useCallback(() => {
    api
      .get('/tracking/weight/trend', { params: { days: 90 } })
      .then((res) => {
        if (res.data.success) setTrend(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load weight trend', err);
        setError("Couldn't load your weight trend.");
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

  const hasData = !!trend && trend.history.length > 0;
  const data =
    trend?.history.map((pt) => ({ date: pt.date, weight: pt.weight, movingAverage: pt.movingAverage7Day })) ?? [];

  return (
    <ChartCard
      title="Weight"
      subtitle="Daily weigh-ins and the 7-day average"
      badge={
        hasData && trend.direction !== 'INSUFFICIENT_DATA' ? (
          <Badge tone={TREND_TONE[trend.direction as keyof typeof TREND_TONE] ?? 'neutral'}>
            {TREND_LABEL[trend.direction as keyof typeof TREND_LABEL] ?? 'Stable'}
          </Badge>
        ) : undefined
      }
      isLoading={isLoading}
      isEmpty={!hasData}
      error={error}
      onRetry={handleRetry}
      emptyState={{
        icon: <TrendingUp className="h-5 w-5" />,
        title: 'No weigh-ins yet',
        description: 'Log your weight from the dashboard to start a trend line here.',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
                formatValue={(v) => `${v} ${unitLabel}`}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="weight"
            name="Daily"
            stroke="var(--color-line)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--color-ink-soft)', strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: 'var(--color-bone)', strokeWidth: 2 }}
            isAnimationActive={!shouldReduceMotion}
          />
          <Line
            type="monotone"
            dataKey="movingAverage"
            name="7-day avg"
            stroke="var(--color-beet)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, stroke: 'var(--color-bone)', strokeWidth: 2 }}
            isAnimationActive={!shouldReduceMotion}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
