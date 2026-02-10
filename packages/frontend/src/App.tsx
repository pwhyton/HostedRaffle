import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';

// Layouts
import PublicLayout from './components/layout/PublicLayout.js';
import DashboardLayout from './components/layout/DashboardLayout.js';
import AdminLayout from './components/layout/AdminLayout.js';

// Auth
import LoginPage from './pages/auth/LoginPage.js';

// Public
import RaffleListPage from './pages/public/RaffleListPage.js';
import RaffleDetailPage from './pages/public/RaffleDetailPage.js';
import BuyTicketsPage from './pages/public/BuyTicketsPage.js';
import MyTicketsPage from './pages/public/MyTicketsPage.js';

// Dashboard
import DashboardHomePage from './pages/dashboard/DashboardHomePage.js';
import RaffleListDashboard from './pages/dashboard/RaffleListDashboard.js';
import RaffleEditPage from './pages/dashboard/RaffleEditPage.js';
import DrawPage from './pages/dashboard/DrawPage.js';

// Admin
import AdminHomePage from './pages/admin/AdminHomePage.js';
import OrganisationsPage from './pages/admin/OrganisationsPage.js';
import OrganisationEditPage from './pages/admin/OrganisationEditPage.js';
import SettingsPage from './pages/admin/SettingsPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHomePage />} />
              <Route path="raffles" element={<RaffleListDashboard />} />
              <Route path="raffles/:id" element={<RaffleEditPage />} />
              <Route path="raffles/:id/draw" element={<DrawPage />} />
            </Route>

            {/* Admin (nested inside dashboard layout) */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminHomePage />} />
                <Route path="organisations" element={<OrganisationsPage />} />
                <Route path="organisations/:id" element={<OrganisationEditPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Public (org-scoped) */}
            <Route path="/:orgSlug" element={<PublicLayout />}>
              <Route index element={<RaffleListPage />} />
              <Route path="raffle/:id" element={<RaffleDetailPage />} />
              <Route path="raffle/:id/buy" element={<BuyTicketsPage />} />
              <Route path="my-tickets" element={<MyTicketsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
