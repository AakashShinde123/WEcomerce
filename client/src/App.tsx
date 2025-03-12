import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./hooks/use-cart";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import DeliveryTasks from "@/pages/delivery/tasks";
import MainLayout from "@/components/layouts/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />

      <ProtectedRoute path="/" component={() => (
        <MainLayout>
          <HomePage />
        </MainLayout>
      )} />

      <ProtectedRoute path="/admin" component={() => (
        <MainLayout>
          <AdminDashboard />
        </MainLayout>
      )} />

      <ProtectedRoute path="/admin/products" component={() => (
        <MainLayout>
          <AdminProducts />
        </MainLayout>
      )} />

      <ProtectedRoute path="/delivery" component={() => (
        <MainLayout>
          <DeliveryTasks />
        </MainLayout>
      )} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;