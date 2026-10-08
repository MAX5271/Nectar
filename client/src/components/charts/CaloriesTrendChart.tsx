import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import type { DietPlanDTO } from '@nectar/types';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';

interface CaloriesTrendChartProps {
  history: DietPlanDTO[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function CaloriesTrendChart({ history, isLoading, error, onRetry }: CaloriesTrendChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const data = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((plan) => ({ date: plan.date, calories: plan.totalCalories }));

  return (
    <ChartCard
      title="Calories"
      subtitle="Daily total across your recent plans"
      isLoading={isLoading}
      isEmpty={data.length === 0}
      error={error}
      onRetry={onRetry}
      emptyState={{
        icon: <Flame className="h-5 w-5" />,
        title: 'No plans yet',
        description: 'Build a plan to see your calorie trend here.',
      }}
      height="h-[200px] sm:h-[220px]"
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
          />
          <YAxis tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
                formatValue={(v) => `${v} kcal`}
              />
            }
            cursor={{ fill: 'var(--color-linen)' }}
          />
          <Bar
            dataKey="calories"
            name="Calories"
            fill="var(--color-beet)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={!shouldReduceMotion}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
