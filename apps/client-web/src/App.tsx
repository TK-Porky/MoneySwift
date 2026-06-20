import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VerifyOtpPage from "@/pages/auth/VerifyOtpPage";

// App pages
import DashboardPage from "@/pages/app/DashboardPage";
import TransferPage from "@/pages/app/TransferPage";
import DepositPage from "@/pages/app/DepositPage";
import WithdrawPage from "@/pages/app/WithdrawPage";
//import HistoryPage from "@/pages/app/HistoryPage";
//import CardsPage from "@/pages/app/CardsPage";
//import NotificationsPage from "@/pages/app/NotificationsPage";
//import SettingsPage from "@/pages/app/SettingsPage";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";

// ── Route guard ────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  return isAuth ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        {/*
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
