import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserConstraint {
  id?: string;
  planType: string;
  gender: string;
  unitSystem: string;
  activityLevel?: string;
  height: number;
  weight: number;
  age: number;
  preferences: string;
  userId?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  constraint?: UserConstraint;
  constraints?: UserConstraint[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  isInitialized: boolean;
}

const loadUserFromStorage = (): AuthUser | null => {
  try {
    const serializedUser = localStorage.getItem('nectar_user');
    if (serializedUser === null) return null;
    return JSON.parse(serializedUser);
  } catch (err) {
    console.error("[SYSTEM] Local storage payload corrupted.", err);
    localStorage.removeItem('nectar_user');
    return null;
  }
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser | null; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;

      if (action.payload.user) {
        localStorage.setItem('nectar_user', JSON.stringify(action.payload.user));
      }
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      localStorage.setItem('nectar_user', JSON.stringify(action.payload));
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      localStorage.removeItem('nectar_user');
      localStorage.removeItem('nectar_token');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, updateUser, setInitialized, logout } = authSlice.actions;

//export the reducer to be included in the store
export default authSlice.reducer;