import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-6 font-sans text-white">
      <div className="w-full max-w-md border-4 border-red-600 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-shadow hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] sm:p-12">
        
        <div className="mb-8 flex items-center gap-4 border-b-4 border-zinc-800 pb-6">
          <div className="flex h-12 w-12 items-center justify-center bg-red-600 text-2xl font-black text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            N/
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white">
            Authorization
          </h1>
        </div>

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Identification
            </label>
            <input 
              type="email" 
              required
              className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-600"
              placeholder="USER@SYSTEM.NET"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Security Key
              </label>
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-red-600 transition-colors hover:text-white">
                Reset
              </a>
            </div>
            <input 
              type="password" 
              required
              className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-600"
              placeholder="••••••••"
            />
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <button 
              type="submit"
              className="w-full transform bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none"
            >
              Access System
            </button>
            
            <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-500">
              No Profile Found? <a href="#" className="text-red-600 transition-colors hover:text-white">Initialize Here</a>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;