import React from 'react';
import { useSmartNavigate } from '../hooks/useSmartNavigate';

const Home: React.FC = () => {

  const navigate = useSmartNavigate();

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden px-6 pt-16 pb-24 text-center lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex justify-center">
            <div className="cursor-pointer rounded-full bg-amber-50 px-3 py-1 text-sm leading-6 text-amber-600 ring-1 ring-amber-600/10 transition-colors hover:ring-amber-600/20">
              New: Personalized AI Meal Generation is live.
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl">
            Fuel your body. <span className="text-amber-500">Hit your targets.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Nectar takes the guesswork out of your diet. Track your macros, manage your caloric deficit, and reach your goal weight with smart, adaptable meal plans.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button onClick={()=>navigate('/login')} className="rounded-full bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-zinc-800 active:scale-95">
              Start Your Journey
            </button>
            <button onClick={()=>navigate('/about')} className="text-base font-semibold leading-6 text-zinc-900 transition-colors hover:text-amber-600">
              See How It Works <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold uppercase tracking-widest text-amber-600">
              Achieve Your Best Physique
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Everything you need to optimize your nutrition
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              
              <div className="flex flex-col items-start rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 transition-shadow hover:shadow-md">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-2xl">
                  🥑
                </div>
                <dt className="text-xl font-bold leading-7 text-zinc-900">Effortless Macro Tracking</dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">Stop stressing over spreadsheets. Log your meals in seconds and let Nectar calculate your exact protein, carb, and fat intake.</p>
                </dd>
              </div>

              <div className="flex flex-col items-start rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 transition-shadow hover:shadow-md">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-2xl">
                  🧠
                </div>
                <dt className="text-xl font-bold leading-7 text-zinc-900">AI-Powered Dietitian</dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">Get dynamic meal suggestions tailored perfectly to your current weight, preferences, and daily caloric goals.</p>
                </dd>
              </div>

              <div className="flex flex-col items-start rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 transition-shadow hover:shadow-md">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-2xl">
                  📉
                </div>
                <dt className="text-xl font-bold leading-7 text-zinc-900">Visual Progress</dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">Watch the numbers drop. Track your daily weigh-ins and visualize your journey to your target physique with clean, easy-to-read charts.</p>
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;