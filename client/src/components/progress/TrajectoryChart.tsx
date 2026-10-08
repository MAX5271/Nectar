import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Scale, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import type { WeightTrendDTO } from '@nectar/types';
import { NectarStat } from '../ui/NectarStat';
import { NectarBadge } from '../ui/NectarBadge';

export interface TrajectoryChartProps {
  unitSystem?: string;
}

type TimeHorizon = 7 | 30 | 90;

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  unitSystem = 'METRIC',
}) => {
  const [horizon, setHorizon] = useState<TimeHorizon>(30);
  const [trend, setTrend] = useState<WeightTrendDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMetric = unitSystem !== 'IMPERIAL';
  const unit = isMetric ? 'kg' : 'lb';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tracking/weight/trend', {
        params: { days: horizon },
      });
      if (res.data?.success && res.data?.data) {
        setTrend(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load weight trajectory', err);
    } finally {
      setIsLoading(false);
    }
  }, [horizon]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const history = trend?.history || [];
  const currentWeight = trend?.currentWeight ?? 72.5;
  const change = trend?.weeklyChangeKg ?? 0;
  const direction = trend?.direction || 'MAINTAINING';

  const chartData = history.map((pt) => ({
    date: new Date(pt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: pt.weight,
    movingAverage: pt.movingAverage7Day,
  }));

  return (
    <div className="rounded-3xl border border-line bg-bone-light/90 p-6 sm:p-8 shadow-warm-sm">
      {/* Top Controls: Title, Current Stat, Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-ink-muted" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Weight Trajectory
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <NectarStat
              label=""
              value={currentWeight.toFixed(1)}
              unit={unit}
              size="lg"
            />
            {change !== 0 && (
              <NectarBadge
                variant={change < 0 ? 'fat' : 'carb'}
                size="md"
              >
                {change < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                <span>
                  {Math.abs(change).toFixed(1)} {unit} in {horizon}d
                </span>
              </NectarBadge>
            )}
          </div>
        </div>

        {/* Time horizon pill selector */}
        <div className="inline-flex rounded-full bg-bone p-1 border border-line self-start sm:self-center">
          {([7, 30, 90] as TimeHorizon[]).map((d) => (
            <button
              key={d}
              onClick={() => setHorizon(d)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-full transition-all select-none ${
                horizon === d
                  ? 'bg-ink text-bone shadow-warm-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 h-64 sm:h-72 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-xs font-mono text-ink-muted">
            Loading trajectory data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center p-6 border border-dashed border-line rounded-2xl">
            <Scale className="h-8 w-8 text-line mb-2" />
            <p className="text-sm font-sans text-ink-muted">
              No weight data recorded yet for the last {horizon} days.
            </p>
            <p className="text-xs font-sans text-ink-muted/70 mt-1">
              Log your weight on Today's cockpit to start mapping your trajectory.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6e3040" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6e3040" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ded2b8" opacity={0.6} vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                stroke="#8e9489"
                fontSize={11}
                fontFamily="IBM Plex Mono, monospace"
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tickLine={false}
                stroke="#8e9489"
                fontSize={11}
                fontFamily="IBM Plex Mono, monospace"
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-line bg-bone-light p-3 shadow-warm-md text-xs font-mono">
                        <div className="text-ink-muted mb-1">{label}</div>
                        <div className="text-ink font-semibold">
                          Weight: {dataPoint.weight} {unit}
                        </div>
                        {dataPoint.movingAverage && (
                          <div className="text-honey-dark mt-0.5">
                            7d avg: {dataPoint.movingAverage.toFixed(1)} {unit}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6e3040"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#weightAreaGrad)"
              />
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#b87532"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend / Context footer */}
      <div className="mt-4 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between text-xs font-mono text-ink-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-beet" /> Daily entry
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-honey" /> 7-day trendline
          </span>
        </div>
        <span>Rate: {direction.toLowerCase().replace('_', ' ')}</span>
      </div>
    </div>
  );
};
