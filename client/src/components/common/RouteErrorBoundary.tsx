import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  let title = "System Fault";
  let message = "An unexpected anomaly interrupted operations.";
  let code = "500";

  if (isRouteErrorResponse(error)) {
    code = String(error.status);
    if (error.status === 404) {
      title = "Area Not Found";
      message = "The requested sector does not exist in the current database structure.";
    } else {
      title = error.statusText || "Route Fault";
      message = typeof error.data === 'string' ? error.data : message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="border-4 border-red-600 bg-black p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] md:p-12 max-w-lg w-full">
        <h1 className="text-6xl font-black leading-none tracking-tighter text-red-600 md:text-8xl">
          {code}
        </h1>
        <div className="mt-6 border-t-4 border-red-600 pt-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-white md:text-2xl">
            {title}
          </h2>
          <p className="mt-4 text-xs font-mono text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="mt-8 flex gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-red-500"
          >
            Return to Base
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-zinc-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Reboot
          </button>
        </div>
      </div>
    </div>
  );
};
