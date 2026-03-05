import React from 'react';

const Error404: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="relative border-4 border-red-600 bg-black p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] md:p-16">
        
        <h1 className="text-8xl font-black leading-none tracking-tighter text-red-600 md:text-[12rem]">
          404
        </h1>
        
        <div className="mt-6 border-t-4 border-red-600 pt-6">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white md:text-4xl">
            Area Not Found
          </h2>
          <p className="mt-4 max-w-md text-sm font-bold uppercase tracking-widest text-zinc-500">
            The requested sector does not exist in the current database structure. Navigation terminated.
          </p>
        </div>
        
        <div className="mt-12">
          <a 
            href="/"
            className="inline-flex transform items-center gap-4 bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none"
          >
            <div className="h-3 w-3 bg-black"></div>
            Return to Base
          </a>
        </div>

      </div>
    </div>
  );
};

export default Error404;