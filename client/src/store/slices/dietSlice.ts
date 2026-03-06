import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

export interface DietMeal {
  id: string;
  type: string;
  portion: string;
  meal: string;
  calories: number;
  carb: number;
  protein: number;
  fat: number;
  date: string;
  dietPlanId: string;
}

export interface DietPlan {
  id: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  userId: string;
  diets?: DietMeal[]; 
}

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