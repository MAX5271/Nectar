import React, { useState } from 'react';
import { SlidersHorizontal, Scale, Save } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { updateUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import axios from 'axios';
import { NectarButton } from '../../components/ui/NectarButton';
import { NectarBadge } from '../../components/ui/NectarBadge';
import { notify } from '../../lib/toast';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const constraint = user?.constraints?.[0] || user?.constraint;

  const [weight, setWeight] = useState(constraint?.weight || 70);
  const [height, setHeight] = useState(constraint?.height || 175);
  const [age, setAge] = useState(constraint?.age || 26);
  const [planType, setPlanType] = useState(constraint?.planType || 'MAINTENANCE');
  const [activityLevel, setActivityLevel] = useState(constraint?.activityLevel || 'MODERATE');
  const [preferences, setPreferences] = useState(constraint?.preferences || '');
  const unitSystem = constraint?.unitSystem || 'METRIC';
  const [isSaving, setIsSaving] = useState(false);

  const isMetric = unitSystem !== 'IMPERIAL';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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
        notify.success('Your system configuration was updated.');
      }
    } catch (err) {
      notify.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Couldn't save your system settings."
          : "Couldn't save your system settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <section className="pb-4 border-b border-line">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Your System
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-normal tracking-tight text-ink">
          Physiological Baseline & Preferences
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-sans text-ink-muted max-w-2xl leading-relaxed">
          Nectar calibrates all daily energy equations and macro splits from your baseline physiology and dietary boundaries.
        </p>
      </section>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Biometrics Panel */}
        <div className="rounded-3xl border border-line bg-bone-light/90 p-6 sm:p-8 shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-ink-muted" />
              <h2 className="font-display text-xl font-normal text-ink">Body & Biometrics</h2>
            </div>
            <NectarBadge variant="subtle" size="sm">
              Unit: {isMetric ? 'Metric (kg/cm)' : 'Imperial (lb/in)'}
            </NectarBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                Current Weight ({isMetric ? 'kg' : 'lb'})
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-bone text-base font-mono text-ink focus:outline-none focus:border-beet"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                Height ({isMetric ? 'cm' : 'in'})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-bone text-base font-mono text-ink focus:outline-none focus:border-beet"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-bone text-base font-mono text-ink focus:outline-none focus:border-beet"
              />
            </div>
          </div>
        </div>

        {/* Metabolic Goal & Activity */}
        <div className="rounded-3xl border border-line bg-bone-light/90 p-6 sm:p-8 shadow-warm-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-line/60">
            <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
            <h2 className="font-display text-xl font-normal text-ink">Metabolic Direction</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                Primary Goal
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-bone text-sm font-sans text-ink focus:outline-none focus:border-beet"
              >
                <option value="CUTTING">Fat Loss / Cutting (Deficit)</option>
                <option value="MAINTENANCE">Weight Maintenance & Energy Balance</option>
                <option value="BULKING">Muscle Gain / Hypertrophy (Surplus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-bone text-sm font-sans text-ink focus:outline-none focus:border-beet"
              >
                <option value="SEDENTARY">Sedentary (Desk job, minimal exercise)</option>
                <option value="LIGHT">Lightly Active (1–3 days/week)</option>
                <option value="MODERATE">Moderately Active (3–5 days/week)</option>
                <option value="VERY_ACTIVE">Very Active (6–7 days/week hard training)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
              Dietary Boundaries & Flavor Preferences
            </label>
            <textarea
              rows={3}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Vegetarian, no cilantro, high protein, Mediterranean spices, prefer quick lunches..."
              className="w-full px-4 py-3 rounded-xl border border-line bg-bone text-sm font-sans text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-beet"
            />
            <p className="mt-1.5 text-xs font-sans text-ink-muted">
              These guidelines steer the recipe synthesis algorithm when building your daily protocols.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <NectarButton
            type="submit"
            size="lg"
            loading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save System Settings
          </NectarButton>
        </div>
      </form>
    </div>
  );
};

export default Profile;
