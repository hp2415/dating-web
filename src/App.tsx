import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PreviewPage from "./pages/PreviewPage";
import ModerationPage from "./pages/ModerationPage";
import OrdersPage from "./pages/OrdersPage";
import WalletPage from "./pages/WalletPage";
import CompanionsPage, { BuddyIntentsPage } from "./pages/CompanionsPage";
import {
  TrustPage,
  VerificationPage,
  SanctionsPage,
  SensitiveWordsPage,
} from "./pages/TrustPages";
import {
  TaxonomyPage,
  ShelvesPage,
  PushPage,
  AnnouncementsFeedbackPage,
} from "./pages/OpsPages";
import ActivitiesPage from "./pages/ActivitiesPage";
import ConversationsPage from "./pages/ConversationsPage";
import CommunityPage from "./pages/CommunityPage";
import SafetyReportsPage from "./pages/SafetyReportsPage";
import UsersPage from "./pages/UsersPage";
import { APP_MENUS } from "./layouts/menu";
import { isLoggedIn } from "./auth/session";

function PrivateRoute({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** Routes already bound to real pages — excluded from PreviewPage auto-reg */
const LIVE_PATHS = new Set([
  "/",
  "/moderation",
  "/orders",
  "/wallet",
  "/buddies/paid",
  "/buddies/free",
  "/users",
  "/users/trust",
  "/users/verification",
  "/safety/blocks",
  "/safety/sensitive-words",
  "/activities",
  "/activities/shelves",
  "/config/taxonomy",
  "/config/push",
  "/config/announcements",
  "/conversations",
  "/community",
  "/safety/reports",
]);

const previewRoutes = APP_MENUS.filter(
  (m) => !LIVE_PATHS.has(m.path) && m.status !== "live",
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
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="buddies/paid" element={<CompanionsPage />} />
          <Route path="buddies/free" element={<BuddyIntentsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/trust" element={<TrustPage />} />
          <Route path="users/verification" element={<VerificationPage />} />
          <Route path="safety/blocks" element={<SanctionsPage />} />
          <Route path="safety/sensitive-words" element={<SensitiveWordsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="activities/shelves" element={<ShelvesPage />} />
          <Route path="config/taxonomy" element={<TaxonomyPage />} />
          <Route path="config/push" element={<PushPage />} />
          <Route path="config/announcements" element={<AnnouncementsFeedbackPage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="safety/reports" element={<SafetyReportsPage />} />
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
