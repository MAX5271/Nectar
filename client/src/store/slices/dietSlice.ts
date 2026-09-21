import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

import type { DietMealDTO, DietPlanDTO } from '@nectar/types';

export type DietMeal = DietMealDTO;
export type DietPlan = DietPlanDTO;

interface DietState {
  latestPlan: DietPlan | null;
  history: DietPlan[];
  isLoading: boolean;
}

const initialState: DietState = {
  latestPlan: null,
  history: [],
  isLoading: false,
};

const dietSlice = createSlice({
  name: 'diet',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLatestPlan: (state, action: PayloadAction<DietPlan>) => {
      state.latestPlan = action.payload;
    },
    setHistory: (state, action: PayloadAction<DietPlan[]>) => {
      state.history = action.payload;
    },
    clearDietData: (state) => {
      state.latestPlan = null;
      state.history = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.latestPlan = null;
      state.history = [];
      state.isLoading = false;
    });
  },
});

export const { setLoading, setLatestPlan, setHistory, clearDietData } = dietSlice.actions;
export default dietSlice.reducer;