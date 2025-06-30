// App.tsx or your main entry file
import { store} from "@/redux/store";
import { Provider } from "react-redux";
import RootLayout from "@/components/RootLayout";

export default function AppLayout() {
  return (
    <Provider store={store}>
      
        <RootLayout />
      
    </Provider>
  );
}