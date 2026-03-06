import React, { useState } from 'react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import api from '../../services/api';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { setCredentials } from '../../store/slices/authSlice';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useSmartNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = () => {
    setPassword('');
  };

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsLoading(true);
    console.log('[SYSTEM] Initiating authorization sequence...');

    try {
      const authResponse = await api.post('/auth/login', { email, password });

      if (authResponse.data.success && authResponse.data.data.accessToken) {
        const { accessToken } = authResponse.data.data;

        const profileResponse = await api.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const userData = profileResponse.data.data;

        dispatch(setCredentials({
          user: userData,
          token: accessToken
        }));

        console.log('[SYSTEM] Authorization successful. Access granted.');
        navigate('/dashboard');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Invalid credentials.";
        console.error("[SYSTEM] Authorization failed:", errorMessage);
        alert(`Error: ${errorMessage}`);
      } else {
        console.error("[SYSTEM] Critical internal failure:", error);
        alert("A critical system error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-zinc-950 p-6 font-sans text-white">
      <div className="w-full max-w-md border-4 border-red-600 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-shadow hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] sm:p-12">
        
        <div className="mb-8 flex items-center gap-4 border-b-4 border-zinc-800 pb-6">
          <div className="flex h-12 w-12 items-center justify-center bg-red-600 text-2xl font-black text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            N/
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white">
            Authorization
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Identification
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-600"
              placeholder="USER@SYSTEM.NET"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Security Key
              </label>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-white focus:outline-none"
                >
                  [{showPassword ? 'Hide' : 'Show'}]
                </button>
                <a onClick={handleReset} className="text-[10px] font-bold uppercase tracking-widest text-red-600 transition-colors hover:text-white cursor-pointer">
                  Reset
                </a>
              </div>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-600"
              placeholder="••••••••"
            />
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full transform bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none ${isLoading ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
            >
              {isLoading ? "Verifying..." : "Access System"}
            </button>
            
            <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-500">
              No Profile Found? <button type="button" onClick={() => navigate('/register')} className="text-red-600 transition-colors hover:text-white">Initialize Here</button>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;