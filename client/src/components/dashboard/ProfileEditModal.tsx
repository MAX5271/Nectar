import React, { useState } from 'react';
import api from '../../services/api';
import axios from 'axios';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { updateUser, type AuthUser } from '../../store/slices/authSlice';

interface ProfileEditModalProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const dispatch = useAppDispatch();
  const constraint = user?.constraints?.[0] || user?.constraint;

  const [weight, setWeight] = useState(constraint?.weight || 70);
  const [height, setHeight] = useState(constraint?.height || 175);
  const [age, setAge] = useState(constraint?.age || 25);
  const [planType, setPlanType] = useState(constraint?.planType || 'CUTTING');
  const [activityLevel, setActivityLevel] = useState(constraint?.activityLevel || 'SEDENTARY');
  const [preferences, setPreferences] = useState(constraint?.preferences || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await api.patch('/user/profile', {
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        planType,
        activityLevel,
        preferences,
      });

      if (res.data.success && res.data.data) {
        dispatch(updateUser(res.data.data));
        onUpdated?.();
        onClose();
      }
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to update profile.'
          : 'Failed to update profile.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="border-2 border-red-600 bg-zinc-950 p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(255,0,0,0.3)]">
        <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-3 mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Modify Biometrics & Goal
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xs font-mono font-bold"
          >
            [X]
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Mass (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-black border border-zinc-800 p-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-black border border-zinc-800 p-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Age
              </label>
              <input
                type="number"
                min="13"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-black border border-zinc-800 p-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Protocol Goal
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
              >
                <option value="CUTTING">Cutting (-500 kcal)</option>
                <option value="BULKING">Bulking (+300 kcal)</option>
                <option value="RECOMP">Recomposition (0 kcal)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
              >
                <option value="SEDENTARY">Sedentary (x1.2)</option>
                <option value="LIGHT">Lightly Active (x1.375)</option>
                <option value="MODERATE">Moderately Active (x1.55)</option>
                <option value="VERY_ACTIVE">Very Active (x1.725)</option>
                <option value="EXTRA_ACTIVE">Extra Active (x1.9)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Dietary Restrictions & Allergies
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., No peanuts, lactose intolerant, vegan"
              className="w-full bg-black border border-zinc-800 p-2 text-xs text-white placeholder-zinc-700 focus:border-red-600 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-red-600 text-black font-black uppercase tracking-widest text-xs hover:bg-red-500 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Update Baseline'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
