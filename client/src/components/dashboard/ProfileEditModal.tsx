import React, { useState } from 'react';
import api from '../../services/api';
import axios from 'axios';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { updateUser, type AuthUser } from '../../store/slices/authSlice';
import { Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { notify } from '../../lib/toast';

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
        onUpdated?.();
        notify.success('Profile updated.');
        onClose();
      }
    } catch (err) {
      notify.error(
        axios.isAxiosError(err) ? err.response?.data?.message || "Couldn't update your profile." : "Couldn't update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Edit profile"
      description="Update your stats, goal, and activity level."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Weight (kg)">
            <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </Field>
          <Field label="Height (cm)">
            <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </Field>
          <Field label="Age">
            <Input type="number" min="13" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Goal">
            <Select value={planType} onChange={(e) => setPlanType(e.target.value)}>
              <option value="CUTTING">Cutting (-500 kcal)</option>
              <option value="BULKING">Bulking (+300 kcal)</option>
              <option value="RECOMP">Recomp (0 kcal)</option>
            </Select>
          </Field>
          <Field label="Activity level">
            <Select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
              <option value="SEDENTARY">Sedentary (x1.2)</option>
              <option value="LIGHT">Lightly active (x1.375)</option>
              <option value="MODERATE">Moderately active (x1.55)</option>
              <option value="VERY_ACTIVE">Very active (x1.725)</option>
              <option value="EXTRA_ACTIVE">Extra active (x1.9)</option>
            </Select>
          </Field>
        </div>

        <Field label="Food restrictions or allergies">
          <Input
            type="text"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g. no peanuts, lactose intolerant, vegan"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" loading={isSaving} className="flex-1">
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
