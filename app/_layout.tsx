import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import RootLayout from '@/components/RootLayout';

export default function AppLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayout />
      </PersistGate>
    </Provider>
  );
}