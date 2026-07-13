import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "rentbook-ui-lib/microfrontend.min.css";
import "./index.css";

import AuthLayoutGlass from "./components/AuthLayoutGlass";
import { WidgetOptions } from "./index.widget";

const queryClient = new QueryClient();

interface AppProps {
  options?: WidgetOptions;
}

const App: React.FC<AppProps> = ({ options }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthLayoutGlass
        options={
          options ?? {
            containerElementId: "",
            name: "",
          }
        }
      />
    </QueryClientProvider>
  );
};

export default App;