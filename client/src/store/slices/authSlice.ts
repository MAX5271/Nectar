import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
  token: string | null;
}
// read from hard drive to initialize the state, this way we persist the login across page refreshes and browser restarts. If the data is corrupted, we catch the error, log it, and clear the corrupted data from storage
const loadUserFromStorage = () => {
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

const loadTokenFromStorage = () => localStorage.getItem('nectar_token');

// instead of strictly null, it boots up with whatever it found on the hard drive.
// the double bang (!!) converts the string token into a strict boolean true/false.
const initialState: AuthState = {
  user: loadUserFromStorage(),
  token: loadTokenFromStorage(),
  isAuthenticated: !!loadTokenFromStorage(), 
};

// mutators: only these can change the state, and they are triggered by actions
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // action are triggered when a user logs in successfully
    setCredentials: (state, action: PayloadAction<{ user: AuthState['user']; token: string }>) => {
      //UPDATE RAM
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      //stringify the user object because localStorage can ONLY hold raw strings
      localStorage.setItem('nectar_user', JSON.stringify(action.payload.user));
      localStorage.setItem('nectar_token', action.payload.token);
    },
    
    // logout action
    logout: (state) => {
      // WIPE RAM
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // WIPE HARD DRIVE
      localStorage.removeItem('nectar_user');
      localStorage.removeItem('nectar_token');
    },
  },
});

// transmitters export the actions so components can dispatch them
export const { setCredentials, logout } = authSlice.actions;

//export the reducer to be included in the store
export default authSlice.reducer;