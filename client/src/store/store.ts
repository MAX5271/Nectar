import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dietReducer from './slices/dietSlice';

export const store = configureStore({
    //structure of the store, we can have multiple slices of state
  reducer: {
    auth: authReducer,
    diet: dietReducer,
  },
});
//we have to return the type of the store's state and dispatch so we can use them in our components with proper typing
export type RootState = ReturnType<typeof store.getState>;
// export the exact type of the dispatch function, so we can use it in our components with proper typing
export type AppDispatch = typeof store.dispatch;