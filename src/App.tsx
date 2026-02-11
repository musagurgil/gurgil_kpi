import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SocketProvider } from "./contexts/SocketContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import React, { Suspense } from "react";
import { PageLoader } from "@/components/common/PageLoader";

// Lazy imports for Code Splitting
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AuthPage = React.lazy(() => import("./components/auth/AuthPage").then(module => ({ default: module.AuthPage })));
const Layout = React.lazy(() => import("./components/layout/Layout").then(module => ({ default: module.Layout })));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const KPITracking = React.lazy(() => import("./pages/KPITracking"));
const Tickets = React.lazy(() => import("./pages/Tickets"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Reports = React.lazy(() => import("./pages/Reports"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const Users = React.lazy(() => import("./pages/Users"));
const Settings = React.lazy(() => import("./pages/Settings"));
const MeetingRooms = React.lazy(() => import("./pages/MeetingRooms"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/auth" element={<AuthPage />} />

                  {/* Protected Routes with Layout (Sidebar) */}
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/kpi" element={<KPITracking />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/meeting-rooms" element={<MeetingRooms />} />

                    {/* Manager+ Routes */}
                    <Route path="/analytics" element={
                      <ProtectedRoute requiredRole="department_manager">
                        <Analytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute requiredRole="department_manager">
                        <Reports />
                      </ProtectedRoute>
                    } />

                    {/* Admin Only Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminPanel />
                      </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                      <ProtectedRoute requiredRole="admin">
                        <Users />
                      </ProtectedRoute>
                    } />

                    {/* Settings */}
                    <Route path="/settings" element={<Settings />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
