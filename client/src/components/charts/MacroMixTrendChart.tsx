import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartPie } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import type { DietPlanDTO } from '@nectar/types';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { MACRO_META, MACRO_ORDER, macroShare } from '../../lib/macros';

interface MacroMixTrendChartProps {
  history: DietPlanDTO[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function MacroMixTrendChart({ history, isLoading, error, onRetry }: MacroMixTrendChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const data = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((plan) => ({
      date: plan.date,
      protein: macroShare(plan.totalProtein, MACRO_META.protein.kcalPerGram, plan.totalCalories),
      carbs: macroShare(plan.totalCarbs, MACRO_META.carbs.kcalPerGram, plan.totalCalories),
      fat: macroShare(plan.totalFat, MACRO_META.fat.kcalPerGram, plan.totalCalories),
    }));

  return (
    <ChartCard
      title="Macro mix"
      subtitle="Share of calories from each macro, by day"
      isLoading={isLoading}
      isEmpty={data.length === 0}
      error={error}
      onRetry={onRetry}
      emptyState={{
        icon: <ChartPie className="h-5 w-5" />,
        title: 'No plans yet',
        description: 'Build a plan to see how your macro mix trends.',
      }}
      height="h-[200px] sm:h-[220px]"
      footer={
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {MACRO_ORDER.map((key) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MACRO_META[key].color }}
                aria-hidden="true"
              />
              {MACRO_META[key].label}
            </div>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} stackOffset="expand" margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            content={
              <ChartTooltip labelFormatter={(l) => new Date(l).toLocaleDateString()} formatValue={(v) => `${v}%`} />
            }
          />
          <Area
            type="monotone"
            dataKey="protein"
            name={MACRO_META.protein.label}
            stackId="1"
            stroke="var(--color-beet)"
            fill="var(--color-beet)"
            fillOpacity={0.18}
            isAnimationActive={!shouldReduceMotion}
          />
          <Area
            type="monotone"
            dataKey="carbs"
            name={MACRO_META.carbs.label}
            stackId="1"
            stroke="var(--color-turmeric)"
            fill="var(--color-turmeric)"
            fillOpacity={0.18}
            isAnimationActive={!shouldReduceMotion}
          />
          <Area
            type="monotone"
            dataKey="fat"
            name={MACRO_META.fat.label}
            stackId="1"
            stroke="var(--color-herb)"
            fill="var(--color-herb)"
            fillOpacity={0.18}
            isAnimationActive={!shouldReduceMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
