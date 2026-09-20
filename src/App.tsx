import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PreviewPage from "./pages/PreviewPage";
import ModerationPage from "./pages/ModerationPage";
import { APP_MENUS } from "./layouts/menu";
import { isLoggedIn } from "./auth/session";

function PrivateRoute({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const previewRoutes = APP_MENUS.filter(
  (m) => m.path !== "/" && m.path !== "/moderation" && m.status !== "live",
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          {previewRoutes.map((item) => (
            <Route
              key={item.key}
              path={item.path.replace(/^\//, "")}
              element={<PreviewPage menuKey={item.key} />}
            />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
