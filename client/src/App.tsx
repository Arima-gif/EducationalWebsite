import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { ApiDataProvider } from "./contexts/api-data-context";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard defaultSection="organizations" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiDataProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ApiDataProvider>
    </QueryClientProvider>
  );
}

export default App;
