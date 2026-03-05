import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center bg-transparent">
      <div className="flex flex-col items-center justify-center text-center">
        
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse bg-red-600 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"></div>
          <span className="text-4xl font-black uppercase tracking-widest text-white">
            Loading
          </span>
        </div>

        <div className="relative mt-8 h-1.5 w-64 overflow-hidden bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="absolute top-0 left-0 h-full w-1/3 animate-[translateX_1s_ease-in-out_infinite_alternate] bg-red-600"></div>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Syncing local state
        </p>

      </div>
    </div>
  );
};

export default Loader;