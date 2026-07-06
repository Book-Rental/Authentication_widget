import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "rentbook-ui-lib/microfrontend.min.css";
import "./index.css";
import AuthLayoutGlass from "./components/AuthLayoutGlass";
import { WidgetOptions } from "./index.widget";
import { useEffect } from "react";

const queryClient = new QueryClient();

interface AppProps {
  options?: WidgetOptions;
}

const App: React.FC<AppProps> = ({ options }) => {

  useEffect(() => {
    const event = new CustomEvent("widget-loading-status", {
      detail: false
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-center" />
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