import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setHistory } from '../../store/slices/dietSlice';
import api from '../../services/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const DietPlanHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { history } = useAppSelector((state) => state.diet);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useSmartNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/diet/history');
        if (response.data.result) {
          dispatch(setHistory(response.data.result));
        }
      } catch (error) {
        console.error('[SYSTEM] Failed to retrieve historical telemetry.', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchHistory();
    }
  }, [dispatch, isAuthenticated]);

  const formatArchiveDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).toUpperCase();
  };

  return isAuthenticated ? (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 lg:p-12">
      <header className="mb-12 border-b-4 border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-zinc-800 text-2xl font-black text-white shadow-[4px_4px_0px_0px_rgba(255,0,0,0.2)]">
            H/
          </div>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white">
            Protocol Archives
          </h1>
        </div>
        <p className="mt-4 text-xs font-bold tracking-widest text-zinc-500 uppercase">
          Review past generation matrices and macro telemetry.
        </p>
      </header>

      {isFetching ? (
        <div className="flex justify-center py-20">
          <span className="text-red-600 font-black uppercase tracking-widest animate-pulse">
            Accessing Server Records...
          </span>
        </div>
      ) : history.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-800 p-12 text-center text-zinc-600 font-bold uppercase tracking-widest">
          No historical data found. System is waiting for first generation cycle.
        </div>
      ) : (
        <div className="space-y-12">
          {history.map((plan) => (
            <div key={plan.id} className="border-2 border-zinc-800 bg-black">
              <div className="border-b-2 border-zinc-800 bg-zinc-900 p-4 sm:p-6 flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                <div>
                  <h2 className="text-xl font-black text-white tracking-widest">
                    {formatArchiveDate(plan.date)}
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    ID: {plan.id.split('-')[0]}
                  </span>
                </div>

                <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2 xl:pb-0">
                  <div className="text-center">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold">KCAL</span>
                    <span className="text-lg font-black text-red-500">{plan.totalCalories}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold">PRO</span>
                    <span className="text-lg font-black text-blue-400">{plan.totalProtein}g</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold">CARB</span>
                    <span className="text-lg font-black text-yellow-500">{plan.totalCarbs}g</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold">FAT</span>
                    <span className="text-lg font-black text-orange-500">{plan.totalFat}g</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-2">
                {plan.diets?.map((diet) => (
                  <div key={diet.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-zinc-900 hover:border-zinc-700 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {diet.type}
                      </span>
                      <span className="text-sm font-bold text-zinc-300">
                        {diet.meal}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-black text-red-600">
                      {diet.calories} KCAL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className='min-h-screen'></div>
  );
};

export default DietPlanHistory;