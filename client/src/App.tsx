import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/contexts/theme-context";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/enhanced-dashboard";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import Outlets from "@/pages/outlets";
import Payroll from "@/pages/payroll";
import Vendors from "@/pages/vendors";
import TaxManagement from "@/pages/tax-management";
import POSSync from "@/pages/pos-sync";
import AIAnalytics from "@/pages/ai-analytics";
import AIChat from "@/pages/ai-chat";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden ml-64 bg-background text-foreground">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/reports" component={Reports} />
            <Route path="/ai-analytics" component={AIAnalytics} />
            <Route path="/ai-chat" component={AIChat} />
            <Route path="/profile" component={Profile} />
            <Route path="/outlets" component={Outlets} />
            <Route path="/payroll" component={Payroll} />
            <Route path="/vendors" component={Vendors} />
            <Route path="/tax" component={TaxManagement} />
            <Route path="/pos-sync" component={POSSync} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
