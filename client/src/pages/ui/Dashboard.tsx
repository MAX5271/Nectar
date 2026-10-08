import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setLoading, setLatestPlan } from '../../store/slices/dietSlice';
import api from '../../services/api';
import axios from 'axios';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { DashboardHero } from '../../components/dashboard/DashboardHero';
import { MealTimeline } from '../../components/dashboard/MealTimeline';
import { DailyBalance } from '../../components/dashboard/DailyBalance';
import { WeightSnapshot } from '../../components/dashboard/WeightSnapshot';
import { GuestClaim } from '../../components/dashboard/GuestClaim';
import { NectarGenerationModal } from '../../components/nectar/NectarGenerationModal';
import { notify } from '../../lib/toast';
import type { DietMealDTO, DietPlanDTO, MealLogDTO } from '@nectar/types';

const adherenceKey = (mealType: string | undefined, name: string) =>
  `${mealType || 'LUNCH'}|${name}`;

const DashboardContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { latestPlan, isLoading } = useAppSelector((state) => state.diet);

  const [refreshKey, setRefreshKey] = useState(0);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [todayAdherence, setTodayAdherence] = useState<Map<string, boolean>>(new Map());

  const userConstraints = user?.constraints?.[0] || user?.constraint;
  const isAnonymous = user?.isAnonymous || !user?.email;

  // Fetch latest plan
  useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const response = await api.get('/diet/latest');
        const plan = response.data.data || response.data.result;
        if (plan) {
          dispatch(setLatestPlan(plan));
        }
      } catch (err) {
        console.error('No active plan found or fetch failed.', err);
      }
    };
    if (user) {
      fetchLatestPlan();
    }
  }, [dispatch, user, refreshKey]);

  // Fetch today's logged meals adherence
  useEffect(() => {
    const fetchTodayAdherence = async () => {
      try {
        const res = await api.get('/tracking/meals');
        const logs: MealLogDTO[] = res.data?.data?.logs ?? [];
        setTodayAdherence(
          new Map(logs.map((log) => [adherenceKey(log.mealType, log.name), log.adhered])),
        );
      } catch (err) {
        console.error("Failed to fetch today's logged meals.", err);
      }
    };
    if (user) {
      fetchTodayAdherence();
    }
  }, [user, refreshKey]);

  // Fetch target calories
  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const res = await api.get('/diet/explain');
        if (res.data.success && res.data.data?.targetCalories) {
          setTargetCalories(res.data.data.targetCalories);
        }
      } catch (err) {
        console.error('Failed to fetch calorie target', err);
      }
    };
    if (user) {
      fetchTarget();
    }
  }, [user, refreshKey]);

  // Check if plan has been generated today
  const hasGeneratedToday =
    !!latestPlan?.date &&
    (typeof latestPlan.date === 'string'
      ? latestPlan.date.slice(0, 10)
      : new Date(latestPlan.date).toISOString().slice(0, 10)) ===
      new Date().toISOString().slice(0, 10);

  const handleGeneratePlan = async () => {
    if (hasGeneratedToday) return;

    dispatch(setLoading(true));
    try {
      const planResponse = await api.post('/diet/plan');
      const plan = planResponse.data.data || planResponse.data.result;
      dispatch(setLatestPlan(plan));
      notify.success("Today's food plan synthesized.");
    } catch (err) {
      console.error('Plan generation failed.', err);
      notify.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Couldn't build your plan."
          : "Couldn't build your plan.",
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMealSwapped = (_swappedMeal: DietMealDTO, updatedPlan: DietPlanDTO) => {
    if (updatedPlan) {
      dispatch(setLatestPlan(updatedPlan));
    }
  };

  const handleAdherenceLogged = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Greeting & Baseline */}
      <DashboardHero />

      {/* Anonymous Guest Alert */}
      {isAnonymous && <GuestClaim />}

      {/* 12-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main 8-Column Area: The Protagonist Meal Timeline */}
        <section className="lg:col-span-8 order-2 lg:order-1">
          <MealTimeline
            plan={latestPlan}
            todayAdherence={todayAdherence}
            onMealSwapped={handleMealSwapped}
            onAdherenceLogged={handleAdherenceLogged}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isLoading}
          />
        </section>

        {/* Right 4-Column Area: Instrumentation Panels */}
        <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          {/* Daily Balance Centerpiece & Macro Bars */}
          <DailyBalance
            plan={latestPlan}
            targetCalories={targetCalories}
            todayAdherence={todayAdherence}
            hasGeneratedToday={hasGeneratedToday}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isLoading}
          />

          {/* Weight Trajectory Snapshot */}
          <WeightSnapshot
            unitSystem={userConstraints?.unitSystem}
            onWeightLogged={() => setRefreshKey((k) => k + 1)}
          />
        </aside>
      </div>

      {/* Generative Synthesis Motion Modal */}
      <NectarGenerationModal isOpen={isLoading} />
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
};

export default Dashboard;
