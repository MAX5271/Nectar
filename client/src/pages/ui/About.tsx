import React from 'react';

const About: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-zinc-950 p-6 font-sans text-white md:p-12">
      <div className="w-full max-w-5xl">
        
        <div className="mb-12 border-b-4 border-red-600 pb-6">
          <h1 className="text-4xl font-black uppercase tracking-widest text-white md:text-6xl">
            System.Nectar <span className="text-red-600">//</span> Directive
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Eliminating biological guesswork through high-performance engineering and AI synthesis.
          </p>
        </div>

        <div className="mb-16 border-4 border-zinc-800 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-shadow hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] md:p-12">
          <p className="text-lg font-bold uppercase leading-relaxed tracking-wider text-zinc-400 md:text-2xl md:leading-loose">
            Nectar is not a generic calorie counter. It is a precision-engineered tool built for those who treat their physical optimization as a <span className="text-white">data-driven protocol</span>. By feeding the system your exact biometric parameters, Nectar computes the optimal path to your target physique—whether you are maintaining baseline or executing a strict cut/bulk to hit that <span className="text-red-600">70kg milestone</span>.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-black uppercase tracking-widest text-white">
            Active Modules
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            <div className="group border-2 border-zinc-800 bg-black p-6 transition-colors hover:border-red-600">
              <div className="mb-4 inline-block bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
                [ SYS-01 ]
              </div>
              <h3 className="mb-2 text-xl font-black uppercase tracking-widest text-white transition-colors group-hover:text-red-600">
                Biometric Calibration
              </h3>
              <p className="text-sm font-bold uppercase leading-relaxed tracking-wider text-zinc-500">
                The system ingests your baseline metrics—current mass, target mass, activity threshold, and dietary constraints—to establish your baseline metabolic algorithms.
              </p>
            </div>

            <div className="group border-2 border-zinc-800 bg-black p-6 transition-colors hover:border-red-600">
              <div className="mb-4 inline-block bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
                [ AI-GEN ]
              </div>
              <h3 className="mb-2 text-xl font-black uppercase tracking-widest text-white transition-colors group-hover:text-red-600">
                AI Diet Synthesis
              </h3>
              <p className="text-sm font-bold uppercase leading-relaxed tracking-wider text-zinc-500">
                Powered by an advanced Gemini AI integration, Nectar dynamically generates your meal protocols. No static templates. Every diet plan is a custom output calculated against your daily caloric deficit targets.
              </p>
            </div>

            <div className="group border-2 border-zinc-800 bg-black p-6 transition-colors hover:border-red-600">
              <div className="mb-4 inline-block bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
                [ MACRO ]
              </div>
              <h3 className="mb-2 text-xl font-black uppercase tracking-widest text-white transition-colors group-hover:text-red-600">
                Granular Macro Analysis
              </h3>
              <p className="text-sm font-bold uppercase leading-relaxed tracking-wider text-zinc-500">
                Total visibility into your fuel intake. The system provides an exact, mathematically precise breakdown of your protein, carbohydrate, and lipid distribution to ensure peak performance and muscle retention.
              </p>
            </div>

            <div className="group border-2 border-zinc-800 bg-black p-6 transition-colors hover:border-red-600">
              <div className="mb-4 inline-block bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
                [ DATA ]
              </div>
              <h3 className="mb-2 text-xl font-black uppercase tracking-widest text-white transition-colors group-hover:text-red-600">
                Persistent State Tracking
              </h3>
              <p className="text-sm font-bold uppercase leading-relaxed tracking-wider text-zinc-500">
                Your progress is continuously logged to a secure database. Track your daily weigh-ins, monitor your adherence, and visualize your trajectory over time with uncompromised type-safety.
              </p>
            </div>

          </div>
        </div>

        <div className="border-4 border-red-600 bg-red-600 p-8 text-center md:p-12">
          <h2 className="mb-6 text-2xl font-black uppercase tracking-widest text-black md:text-4xl">
            [ END OF READOUT ] - Ready to Initialize?
          </h2>
          <button className="transform bg-black px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)] active:translate-y-0 active:shadow-none">
            Access Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default About;