import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import houseReducer from './slices/houseSlice';
import taskReducer from './slices/taskSlice';
import choreReducer from './slices/choreSlice';
import scriptureReducer from './slices/scriptureSlice';
import userReducer from './slices/userSlice';
import feedbackReducer from './slices/feedbackSlice';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';

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

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PURGE', 'persist/REHYDRATE', 'persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);