import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setHistory } from '../../store/slices/dietSlice';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { NectarButton } from '../../components/ui/NectarButton';
import { TrajectoryChart } from '../../components/progress/TrajectoryChart';
import { AdherenceCalendar } from '../../components/progress/AdherenceCalendar';
import { NutritionConsistency } from '../../components/progress/NutritionConsistency';
import { CaloriesTrendChart } from '../../components/charts/CaloriesTrendChart';
import { MacroMixTrendChart } from '../../components/charts/MacroMixTrendChart';
import { DietHistoryList } from '../../components/progress/DietHistoryList';

const HISTORY_WINDOW = 30;

const Progress: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { history } = useAppSelector((state) => state.diet);
  const userConstraints = useAppSelector(
    (state) => state.auth.user?.constraints?.[0] || state.auth.user?.constraint,
  );
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await api.get('/diet/history', { params: { days: HISTORY_WINDOW } });
      if (response.data.result) {
        dispatch(setHistory(response.data.result));
      }
    } catch (error) {
      console.error('Failed to load plan history.', error);
      setFetchError("Couldn't load your past plans.");
    } finally {
      setIsFetching(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <section className="pb-4 border-b border-line">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Trajectory & Precision
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-normal tracking-tight text-ink">
          The Long Arc of Your Nutrition
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-sans text-ink-muted max-w-2xl leading-relaxed">
          Body composition responds to weeks and months of sustained rhythm, not single meals. Track your trendlines, calendar cadence, and macro mix.
        </p>
      </section>

      {/* Primary Trajectory & Calendar Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Weight Trajectory */}
        <div className="xl:col-span-7">
          <TrajectoryChart unitSystem={userConstraints?.unitSystem} />
        </div>

        {/* Right 5 Cols: Adherence Matrix */}
        <div className="xl:col-span-5">
          <AdherenceCalendar />
        </div>
      </div>

      {/* Precision Metrics */}
      <NutritionConsistency />

      {/* Secondary Detailed Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CaloriesTrendChart
          history={history}
          isLoading={isFetching}
          error={fetchError}
          onRetry={fetchHistory}
        />
        <MacroMixTrendChart
          history={history}
          isLoading={isFetching}
          error={fetchError}
          onRetry={fetchHistory}
        />
      </div>

      {/* Past Daily Plans Archive */}
      <section className="pt-4">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
          <div>
            <h2 className="font-display text-2xl font-normal text-ink">Past Protocols</h2>
            <p className="text-xs font-sans text-ink-muted mt-0.5">
              Archive of daily generated plans and meals
            </p>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            {history.length} {history.length === 1 ? 'day' : 'days'} archived
          </span>
        </div>

        {isFetching ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : fetchError ? (
          <EmptyState
            icon={<AlertTriangle className="h-5 w-5 text-beet" />}
            title="Couldn't load archives"
            description={fetchError}
            action={
              <NectarButton variant="secondary" size="sm" onClick={fetchHistory}>
                Try again
              </NectarButton>
            }
          />
        ) : history.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-5 w-5 text-honey" />}
            title="No past protocols yet"
            description="As you generate and complete daily plans, your meal logs and macro totals will be preserved here."
            action={
              <NectarButton variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
                Go to Today
              </NectarButton>
            }
          />
        ) : (
          <DietHistoryList history={history} />
        )}
      </section>
    </div>
  );
};

export default Progress;
