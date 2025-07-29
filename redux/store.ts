// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import houseReducer from './slices/houseSlice';
import taskReducer from './slices/taskSlice';
import choreReducer from './slices/choreSlice';
import scriptureReducer from './slices/scriptureSlice';
import userReducer from './slices/userSlice';
import feedbackReducer from './slices/feedbackSlice';
import authReducer from './slices/authSlice';
import chatReducer from "./slices/chatSlice"

const rootReducer = combineReducers({
  house: houseReducer,
  task: taskReducer,
  chore: choreReducer,
  scripture: scriptureReducer,
  user: userReducer,
  feedback: feedbackReducer,
  auth: authReducer,
  chat: chatReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
