import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setLoading, setLatestPlan } from '../../store/slices/dietSlice';
import api from '../../services/api';
import { endSession } from '../../services/authFlow';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import axios from 'axios';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { MealCard } from '../../components/dashboard/MealCard';
import { WeightTrackerCard } from '../../components/dashboard/WeightTrackerCard';
import { PlanExplanationCard } from '../../components/dashboard/PlanExplanationCard';
import { ProfileEditModal } from '../../components/dashboard/ProfileEditModal';
import type { DietMealDTO, DietPlanDTO } from '@nectar/types';

const DashboardContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { latestPlan, isLoading } = useAppSelector((state) => state.diet);
  const navigate = useSmartNavigate();

  const [error, setError] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userConstraints = user?.constraints?.[0] || user?.constraint;
  const isMetric = userConstraints?.unitSystem !== 'IMPERIAL';

  useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const response = await api.get('/diet/latest');
        const plan = response.data.data || response.data.result;
        if (plan) {
          dispatch(setLatestPlan(plan));
        }
      } catch (err) {
        console.error('[SYSTEM] No active plan found or fetch failed.', err);
      }
    };
    if (user) {
      fetchLatestPlan();
    }
  }, [dispatch, user, refreshKey]);

  // plan dates are stored as UTC midnight, so compare against today's UTC date.
  const hasGeneratedToday =
    !!latestPlan?.date &&
    (typeof latestPlan.date === 'string'
      ? latestPlan.date.slice(0, 10)
      : new Date(latestPlan.date).toISOString().slice(0, 10)) ===
      new Date().toISOString().slice(0, 10);

  const handleLogout = async () => {
    await endSession(dispatch);
    navigate('/login');
  };

  const handleGeneratePlan = async () => {
    if (hasGeneratedToday) return;

    dispatch(setLoading(true));
    setError('');
    try {
      const planResponse = await api.post('/diet/plan');
      const plan = planResponse.data.data || planResponse.data.result;
      dispatch(setLatestPlan(plan));
    } catch (err) {
      console.error('[SYSTEM] Protocol generation failed.', err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to generate protocol.'
          : 'Failed to generate protocol.',
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

  // Share of total calories contributed by each macro (4/4/9 kcal per gram)
  const macroShare = (grams: number, kcalPerGram: number) =>
    latestPlan?.totalCalories
      ? Math.min(100, Math.round((grams * kcalPerGram * 100) / latestPlan.totalCalories))
      : 0;

  return user ? (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 lg:p-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-zinc-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white">
            Command Center
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs font-bold tracking-widest text-zinc-500">
              OPERATIVE: {user.username || user.email}
            </p>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="text-[10px] font-bold text-red-500 hover:text-white uppercase tracking-widest border border-zinc-800 px-2 py-0.5"
            >
              [ Edit Profile ]
            </button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-white transition-colors"
        >
          [ Terminate Session ]
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Physical Baseline */}
          <div className="border-2 border-zinc-800 bg-black p-6">
            <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Physical Baseline
              </h2>
              <span className="text-[10px] font-mono text-zinc-600">
                {userConstraints?.activityLevel || 'SEDENTARY'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-zinc-950 p-2 border border-zinc-900">
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Height</span>
                <span className="text-lg font-black">{userConstraints?.height || '---'} {isMetric ? 'CM' : 'IN'}</span>
              </div>
              <div className="bg-zinc-950 p-2 border border-zinc-900">
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Goal</span>
                <span className="text-lg font-black text-red-500">{userConstraints?.planType || '---'}</span>
              </div>
              <div className="bg-zinc-950 p-2 border border-zinc-900">
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Mass</span>
                <span className="text-lg font-black">{userConstraints?.weight || '---'} {isMetric ? 'KG' : 'LB'}</span>
              </div>
            </div>
          </div>

          {/* AI Generator Control */}
          <div className="border-2 border-red-600 bg-black p-6 shadow-[8px_8px_0px_0px_rgba(255,0,0,0.1)]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Gemini Nutrition Engine
            </h2>
            <button
              onClick={handleGeneratePlan}
              disabled={hasGeneratedToday || isLoading}
              className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all 
                ${hasGeneratedToday 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-2 border-zinc-800' 
                  : 'bg-red-600 text-black hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none'}`}
            >
              {isLoading ? 'Compiling Protocol...' : hasGeneratedToday ? 'Protocol Locked (Today)' : 'Initialize Protocol'}
            </button>
            {error && (
              <p role="alert" className="mt-4 text-xs font-bold uppercase tracking-widest text-red-500">{error}</p>
            )}
          </div>

          {/* Daily Telemetry */}
          {latestPlan && (
            <div className="border-2 border-zinc-800 bg-black p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                Daily Telemetry
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>CALORIES</span>
                    <span className="text-red-500 font-mono font-bold">{latestPlan.totalCalories} KCAL</span>
                  </div>
                  <div className="h-2 bg-zinc-900 w-full">
                    <div className="h-full bg-red-600 w-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>PROTEIN (30%)</span>
                    <span className="text-white font-mono">{latestPlan.totalProtein}g</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 w-full">
                    <div className="h-full bg-blue-500" style={{ width: `${macroShare(latestPlan.totalProtein, 4)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>CARBOHYDRATES (40%)</span>
                    <span className="text-white font-mono">{latestPlan.totalCarbs}g</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 w-full">
                    <div className="h-full bg-yellow-500" style={{ width: `${macroShare(latestPlan.totalCarbs, 4)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>FAT (30%)</span>
                    <span className="text-white font-mono">{latestPlan.totalFat}g</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 w-full">
                    <div className="h-full bg-orange-500" style={{ width: `${macroShare(latestPlan.totalFat, 9)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Explanation Breakdown */}
          <PlanExplanationCard />

          {/* Weight Tracking & 7-Day Trend */}
          <WeightTrackerCard
            unitSystem={userConstraints?.unitSystem}
            onWeightLogged={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        {/* Right Content: Active Rations */}
        <div className="xl:col-span-2">
          <div className="flex justify-between items-center mb-6 border-b-2 border-zinc-800 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-widest">
              Active Rations & Adherence
            </h2>
            {latestPlan && (
              <span className="text-xs font-mono text-zinc-500">
                {latestPlan.diets?.length || 0} Meals Prescribed
              </span>
            )}
          </div>
          
          {!latestPlan ? (
             <div className="border-2 border-dashed border-zinc-800 p-16 text-center text-zinc-600 font-bold uppercase tracking-widest">
               No active protocol detected. Initialize matrix to generate rations.
             </div>
          ) : (
            <div className="space-y-4">
              {latestPlan.diets?.map((diet: DietMealDTO) => (
                <MealCard
                  key={diet.id}
                  meal={diet}
                  onMealSwapped={handleMealSwapped}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileEditModal
        user={user}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  ) : (
    <div className="min-h-screen bg-zinc-950"></div>
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