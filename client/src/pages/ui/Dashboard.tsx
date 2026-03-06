import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setLoading, setLatestPlan, clearDietData } from '../../store/slices/dietSlice';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { latestPlan, isLoading } = useAppSelector((state) => state.diet);

  useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const response = await api.get('/diet/latest');
        if (response.data.result) {
          dispatch(setLatestPlan(response.data.result));
        }
      } catch (error) {
        console.error('[SYSTEM] No active plan found or fetch failed.', error);
      }
    };
    fetchLatestPlan();
  }, [dispatch]);

  const isPlanGeneratedToday = () => {
    if (!latestPlan?.date) return false;
    const planDate = new Date(latestPlan.date).toDateString();
    const today = new Date().toDateString();
    return planDate === today;
  };

  const hasGeneratedToday = isPlanGeneratedToday();

  const handleLogout = () => {
    dispatch(clearDietData());
    dispatch(logout());
  };

  const handleGeneratePlan = async () => {
    if (hasGeneratedToday) return;
    
    dispatch(setLoading(true));
    try {
      const planResponse = await api.post('/diet/plan');
      const newPlanId = planResponse.data.result.id;
      
      const fullPlanResponse = await api.get(`/diet/${newPlanId}`);
      dispatch(setLatestPlan(fullPlanResponse.data.result));
    } catch (error) {
      console.error('[SYSTEM] Gemini Matrix generation failed.', error);
      alert('Failed to generate protocol. Check server connection.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 lg:p-12">
      <header className="flex justify-between items-end border-b-4 border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white">Command Center</h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 mt-2">ID: {user?.id}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-white transition-colors"
        >
          [ Terminate Session ]
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-8">
          
          <div className="border-2 border-zinc-800 bg-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b-2 border-zinc-900 pb-2">Physical Baseline</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase">Height</span>
                <span className="text-xl font-black">187 CM</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase">Phase</span>
                <span className="text-xl font-black text-red-600">CUTTING</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase">Current Mass</span>
                <span className="text-xl font-black">88 KG</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase">Target Mass</span>
                <span className="text-xl font-black text-green-500">80 KG</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-red-600 bg-black p-6 shadow-[8px_8px_0px_0px_rgba(255,0,0,0.1)]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Gemini Matrix</h2>
            <button
              onClick={handleGeneratePlan}
              disabled={hasGeneratedToday || isLoading}
              className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all 
                ${hasGeneratedToday 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-2 border-zinc-800' 
                  : 'bg-red-600 text-black hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none'}`}
            >
              {isLoading ? 'Compiling...' : hasGeneratedToday ? 'Protocol Locked (24H)' : 'Initialize Protocol'}
            </button>
          </div>

          {latestPlan && (
            <div className="border-2 border-zinc-800 bg-black p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Daily Telemetry</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>CALORIES</span>
                    <span className="text-red-500">{latestPlan.totalCalories} KCAL</span>
                  </div>
                  <div className="h-2 bg-zinc-900 w-full">
                    <div className="h-full bg-red-600 w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>PROTEIN</span>
                    <span className="text-white">{latestPlan.totalProtein}g</span>
                  </div>
                  <div className="h-1 bg-zinc-900 w-full">
                    <div className="h-full bg-blue-500 w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>CARBOHYDRATES</span>
                    <span className="text-white">{latestPlan.totalCarbs}g</span>
                  </div>
                  <div className="h-1 bg-zinc-900 w-full">
                    <div className="h-full bg-yellow-500 w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>FAT</span>
                    <span className="text-white">{latestPlan.totalFat}g</span>
                  </div>
                  <div className="h-1 bg-zinc-900 w-full">
                    <div className="h-full bg-orange-500 w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-2">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-6 border-b-2 border-zinc-800 pb-4">
            Active Rations
          </h2>
          
          {!latestPlan ? (
             <div className="border-2 border-dashed border-zinc-800 p-12 text-center text-zinc-600 font-bold uppercase tracking-widest">
               No active protocol detected. Initialize matrix.
             </div>
          ) : (
            <div className="space-y-4">
              {latestPlan.diets?.map((diet) => (
                <div key={diet.id} className="border-2 border-zinc-800 bg-black p-5 hover:border-zinc-600 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    <div className="max-w-xl">
                      <span className="inline-block bg-zinc-900 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest mb-3">
                        {diet.type}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-2">{diet.meal}</h3>
                      <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                        <span className="text-zinc-600">PORTION:</span> {diet.portion}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 border border-zinc-900 shrink-0 text-center">
                      <div>
                        <span className="block text-[10px] text-zinc-600 uppercase">Cal</span>
                        <span className="font-bold text-red-500">{diet.calories}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-600 uppercase">Pro</span>
                        <span className="font-bold">{diet.protein}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-600 uppercase">Carb</span>
                        <span className="font-bold">{diet.carb}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-600 uppercase">Fat</span>
                        <span className="font-bold">{diet.fat}g</span>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;