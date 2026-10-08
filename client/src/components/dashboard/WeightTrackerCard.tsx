import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import type { WeightTrendDTO } from '@nectar/types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { notify } from '../../lib/toast';

interface WeightTrackerCardProps {
  unitSystem?: string;
  onWeightLogged?: (newWeight: number) => void;
}

const TREND_TONE = {
  LOSING: 'beet',
  GAINING: 'turmeric',
} as const;

export const WeightTrackerCard: React.FC<WeightTrackerCardProps> = ({
  unitSystem = 'METRIC',
  onWeightLogged,
}) => {
  const [trend, setTrend] = useState<WeightTrendDTO | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [inputWeight, setInputWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    } finally {
      setIsFetching(false);
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
        fetchTrend();
        onWeightLogged?.(w);
      }
    } catch {
      notify.error("Couldn't log that weight. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="quiet" padding="md">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Weight</h2>
        {trend?.direction && trend.direction !== 'INSUFFICIENT_DATA' && (
          <Badge tone={TREND_TONE[trend.direction as keyof typeof TREND_TONE] ?? 'neutral'}>
            {trend.direction === 'LOSING' ? 'Trending down' : trend.direction === 'GAINING' ? 'Trending up' : 'Stable'}
            {trend.weeklyChangeKg !== null && ` (${trend.weeklyChangeKg > 0 ? '+' : ''}${trend.weeklyChangeKg} ${unitLabel}/wk)`}
          </Badge>
        )}
      </div>

      {isFetching ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-linen p-3">
            <span className="block text-[10px] font-medium uppercase text-ink-soft">Latest</span>
            <span className="text-lg font-semibold text-ink">
              {trend?.currentWeight ? `${trend.currentWeight} ${unitLabel}` : '—'}
            </span>
          </div>
          <div className="rounded-md bg-linen p-3">
            <span className="block text-[10px] font-medium uppercase text-ink-soft">7-day average</span>
            <span className="text-lg font-semibold text-beet">
              {trend?.latestMovingAverage ? `${trend.latestMovingAverage} ${unitLabel}` : '—'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleLogWeight} className="mt-4 flex gap-2">
        <Input
          type="number"
          step="0.1"
          placeholder={`Log weight (${unitLabel})`}
          value={inputWeight}
          onChange={(e) => setInputWeight(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting} disabled={!inputWeight}>
          <Plus className="h-3.5 w-3.5" /> Log
        </Button>
      </form>

      {trend?.history && trend.history.length > 0 && (
        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-medium uppercase text-ink-soft">Recent weigh-ins</span>
          <div className="max-h-28 space-y-1.5 overflow-y-auto pr-1">
            {trend.history.slice(-5).reverse().map((pt, i) => (
              <div key={i} className="flex justify-between rounded-md bg-linen px-2.5 py-1.5 text-xs text-ink-soft">
                <span>{new Date(pt.date).toLocaleDateString()}</span>
                <span className="font-medium text-ink">{pt.weight} {unitLabel}</span>
                <span>avg {pt.movingAverage7Day}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
