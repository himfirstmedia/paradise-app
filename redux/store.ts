// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import houseReducer from './slices/houseSlice';
import taskReducer from './slices/taskSlice';
import scriptureReducer from './slices/scriptureSlice';
import userReducer from './slices/userSlice';
import feedbackReducer from './slices/feedbackSlice';
import authReducer from './slices/authSlice';


export const store = configureStore({
  reducer: {
    house: houseReducer,
    task: taskReducer,
    scripture: scriptureReducer,
    user: userReducer,
    feedback: feedbackReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
