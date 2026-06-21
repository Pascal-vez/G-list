import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AppGate from './components/AppGate';
import FirstVisit from './components/FirstVisit';
import MiniSitePage from './pages/MiniSitePage';
import MiniSitePreviewPage from './pages/MiniSitePreviewPage';
import Home from './pages/Home';
import Annuaire from './pages/Annuaire';
import CategoryPage from './pages/CategoryPage';
import Profile from './pages/Profile';
import APropos from './pages/APropos';
import Confidentialite from './pages/Confidentialite';
import Conditions from './pages/Conditions';
import Cookies from './pages/Cookies';
import MentionsLegales from './pages/MentionsLegales';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PlanDuSite from './pages/PlanDuSite';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Admin from './pages/Admin';
import ProDashboard from './pages/ProDashboard';
import ProPublicProfile from './pages/ProPublicProfile';
import VisitorDashboard from './pages/VisitorDashboard';
import DashboardRoute from './components/dashboard/DashboardRoute';
import { EvaluationProvider } from './context/EvaluationContext';
import { ThemeProvider } from './context/ThemeContext';
import { hasVisited, markVisited } from './utils/storage';

function GatedLayout({ children }) {
  return (
    <AppGate>
      <Layout>{children}</Layout>
    </AppGate>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mini-sites — sans layout G-List */}
        <Route path="/pro/:slug" element={<MiniSitePage />} />
        <Route path="/espace-pro/apercu-minisite" element={<MiniSitePreviewPage />} />

        <Route path="/" element={<GatedLayout><Home /></GatedLayout>} />
        <Route path="/categorie/:id" element={<GatedLayout><CategoryPage /></GatedLayout>} />
        <Route path="/annuaire" element={<GatedLayout><Annuaire /></GatedLayout>} />
        <Route path="/profil/:id" element={<GatedLayout><Profile /></GatedLayout>} />
        <Route path="/rejoindre" element={<Navigate to="/espace-pro" replace />} />
        <Route path="/a-propos" element={<GatedLayout><APropos /></GatedLayout>} />
        <Route path="/confidentialite" element={<GatedLayout><Confidentialite /></GatedLayout>} />
        <Route path="/conditions" element={<GatedLayout><Conditions /></GatedLayout>} />
        <Route path="/cookies" element={<GatedLayout><Cookies /></GatedLayout>} />
        <Route path="/mentions-legales" element={<GatedLayout><MentionsLegales /></GatedLayout>} />
        <Route path="/contact" element={<GatedLayout><Contact /></GatedLayout>} />
        <Route path="/faq" element={<GatedLayout><FAQ /></GatedLayout>} />
        <Route path="/plan-du-site" element={<GatedLayout><PlanDuSite /></GatedLayout>} />
        <Route path="/espace-pro" element={<GatedLayout><DashboardRoute><ProDashboard /></DashboardRoute></GatedLayout>} />
        <Route path="/dashboard/visiteur" element={<GatedLayout><DashboardRoute><VisitorDashboard /></DashboardRoute></GatedLayout>} />
        <Route path="/mon-profil" element={<GatedLayout><ProPublicProfile /></GatedLayout>} />
        <Route path="/mot-de-passe-oublie" element={<GatedLayout><ForgotPassword /></GatedLayout>} />
        <Route path="/reinitialiser-mot-de-passe/:token" element={<GatedLayout><ResetPassword /></GatedLayout>} />
        <Route path="/verifier-email/:token" element={<GatedLayout><VerifyEmail /></GatedLayout>} />
        <Route path="/admin-glist-2026" element={<DashboardRoute><Admin /></DashboardRoute>} />
        <Route path="*" element={<GatedLayout><NotFound /></GatedLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

function AppShell() {
  const [visited, setVisited] = useState(hasVisited);

  const finishVisit = () => {
    markVisited();
    setVisited(true);
  };

  if (!visited) {
    return (
      <FirstVisit onExplore={finishVisit} />
    );
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <ThemeProvider>
      <EvaluationProvider>
        <AppShell />
      </EvaluationProvider>
    </ThemeProvider>
  );
}
