import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { WeightTrendDTO } from '@nectar/types';

interface WeightTrackerCardProps {
  unitSystem?: string;
  onWeightLogged?: (newWeight: number) => void;
}

export const WeightTrackerCard: React.FC<WeightTrackerCardProps> = ({
  unitSystem = 'METRIC',
  onWeightLogged,
}) => {
  const [trend, setTrend] = useState<WeightTrendDTO | null>(null);
  const [inputWeight, setInputWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMetric = unitSystem !== 'IMPERIAL';
  const unitLabel = isMetric ? 'KG' : 'LB';

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
        fetchTrend();
        onWeightLogged?.(w);
      }
    } catch (err) {
      console.error('Failed to log weight', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-zinc-800 bg-black p-6">
      <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-3 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Weight Telemetry & Trend
        </h2>
        {trend?.direction && trend.direction !== 'INSUFFICIENT_DATA' && (
          <span
            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
              trend.direction === 'LOSING'
                ? 'border-blue-700 bg-blue-950/50 text-blue-400'
                : trend.direction === 'GAINING'
                ? 'border-orange-700 bg-orange-950/50 text-orange-400'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300'
            }`}
          >
            {trend.direction} ({trend.weeklyChangeKg !== null ? `${trend.weeklyChangeKg > 0 ? '+' : ''}${trend.weeklyChangeKg} ${unitLabel}/wk` : ''})
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-zinc-950 p-3 border border-zinc-900">
          <span className="block text-[10px] text-zinc-600 uppercase font-bold">Latest Mass</span>
          <span className="text-xl font-black text-white">
            {trend?.currentWeight ? `${trend.currentWeight} ${unitLabel}` : '---'}
          </span>
        </div>
        <div className="bg-zinc-950 p-3 border border-zinc-900">
          <span className="block text-[10px] text-zinc-600 uppercase font-bold">7-Day Moving Avg</span>
          <span className="text-xl font-black text-red-500">
            {trend?.latestMovingAverage ? `${trend.latestMovingAverage} ${unitLabel}` : '---'}
          </span>
        </div>
      </div>

      <form onSubmit={handleLogWeight} className="flex gap-2 mb-4">
        <input
          type="number"
          step="0.1"
          placeholder={`Log weight (${unitLabel})`}
          value={inputWeight}
          onChange={(e) => setInputWeight(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-white placeholder-zinc-700 focus:border-red-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !inputWeight}
          className="px-4 py-2 bg-red-600 text-black font-black uppercase tracking-widest text-[10px] hover:bg-red-500 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? '...' : '+ Log'}
        </button>
      </form>

      {trend?.history && trend.history.length > 0 && (
        <div className="space-y-1 mt-3">
          <span className="block text-[9px] text-zinc-600 uppercase font-bold tracking-widest mb-1">
            Recent Weigh-Ins (Moving Avg Filter)
          </span>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
            {trend.history.slice(-5).reverse().map((pt, i) => (
              <div key={i} className="flex justify-between text-zinc-400 bg-zinc-950/60 px-2 py-1 border border-zinc-900">
                <span>{new Date(pt.date).toLocaleDateString()}</span>
                <span className="text-white font-bold">{pt.weight} {unitLabel}</span>
                <span className="text-zinc-600">SMA: {pt.movingAverage7Day}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
