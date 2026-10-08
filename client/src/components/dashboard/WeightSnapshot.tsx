import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import type { WeightTrendDTO } from '@nectar/types';
import { NectarStat } from '../ui/NectarStat';
import { NectarButton } from '../ui/NectarButton';
import api from '../../services/api';
import { notify } from '../../lib/toast';

export interface WeightSnapshotProps {
  unitSystem?: string;
  onWeightLogged?: (newWeight: number) => void;
}

export const WeightSnapshot: React.FC<WeightSnapshotProps> = ({
  unitSystem = 'METRIC',
  onWeightLogged,
}) => {
  const [trend, setTrend] = useState<WeightTrendDTO | null>(null);
  const [inputWeight, setInputWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogInput, setShowLogInput] = useState(false);

  const isMetric = unitSystem !== 'IMPERIAL';
  const unitLabel = isMetric ? 'kg' : 'lb';

  const fetchTrend = async () => {
    try {
      const res = await api.get('/tracking/weight/trend');
      if (res.data.success && res.data.data) {
        setTrend(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch weight trend', err);
    }
  };

  useEffect(() => {
    fetchTrend();
  }, []);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(inputWeight);
    if (isNaN(w) || w <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/tracking/weight', { weight: w });
      if (res.data.success) {
        setInputWeight('');
        setShowLogInput(false);
        fetchTrend();
        onWeightLogged?.(w);
        notify.success(`Weight logged: ${w} ${unitLabel}`);
      }
    } catch {
      notify.error("Couldn't save weight. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWeight = trend?.currentWeight ?? 72.5;
  const changeValue = trend?.weeklyChangeKg ?? 0;
  const trendDirection = changeValue < 0 ? 'down' : changeValue > 0 ? 'up' : 'neutral';

  return (
    <div className="rounded-3xl border border-line bg-bone-light/90 p-6 shadow-warm-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-ink-muted" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
            Weight Trajectory
          </span>
        </div>
        <button
          onClick={() => setShowLogInput(!showLogInput)}
          className="text-xs font-sans font-medium text-beet hover:underline select-none"
        >
          {showLogInput ? 'Cancel' : '+ Log Weight'}
        </button>
      </div>

      {/* Main Stat & 7D Delta */}
      <div className="flex items-baseline justify-between">
        <NectarStat
          label="Current Weight"
          value={currentWeight.toFixed(1)}
          unit={unitLabel}
          delta={
            changeValue !== 0
              ? {
                  value: `${Math.abs(changeValue).toFixed(1)} ${unitLabel}`,
                  trend: trendDirection,
                  label: '7-day trend',
                }
              : undefined
          }
          size="lg"
        />

        {/* Mini SVG Sparkline */}
        <div className="h-10 w-24">
          <svg viewBox="0 0 100 40" className="h-full w-full stroke-beet fill-none">
            <path
              d="M 5 32 Q 25 28, 45 22 T 85 14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="85" cy="14" r="3.5" className="fill-beet stroke-bone-light" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Inline Log Input Form */}
      {showLogInput && (
        <form onSubmit={handleLogWeight} className="pt-3 border-t border-line/50 flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              placeholder={`e.g. ${currentWeight}`}
              required
              autoFocus
              className="w-full px-3 py-1.5 rounded-xl border border-line bg-bone text-sm font-mono text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-beet"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-muted">
              {unitLabel}
            </span>
          </div>
          <NectarButton
            type="submit"
            size="sm"
            loading={isSubmitting}
            variant="primary"
          >
            Save
          </NectarButton>
        </form>
      )}
    </div>
  );
};
