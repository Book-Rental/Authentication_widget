import "rentbook-ui-lib/microfrontend.min.css";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import AuthLayoutGlass from "./components/AuthLayoutGlass";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />

      <AuthLayoutGlass
        options={{
          containerElementId: "",
          name: "",
        }}
      />
    </QueryClientProvider>
  );
};

export default App;