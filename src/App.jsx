import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AppGate from './components/AppGate';
import FirstVisit from './components/FirstVisit';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import Profile from './pages/Profile';
import Join from './pages/Join';
import APropos from './pages/APropos';
import Confidentialite from './pages/Confidentialite';
import Conditions from './pages/Conditions';
import Admin from './pages/Admin';
import ProDashboard from './pages/ProDashboard';
import ProPublicProfile from './pages/ProPublicProfile';
import { EvaluationProvider, useEvaluation } from './context/EvaluationContext';
import { hasVisited, markVisited } from './utils/storage';

function GatedLayout({ children }) {
  return (
    <AppGate>
      <Layout>{children}</Layout>
    </AppGate>
  );
}

function AnnuaireRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/', search }} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GatedLayout><Home /></GatedLayout>} />
        <Route path="/categorie/:id" element={<GatedLayout><CategoryPage /></GatedLayout>} />
        <Route path="/annuaire" element={<AnnuaireRedirect />} />
        <Route path="/profil/:id" element={<GatedLayout><Profile /></GatedLayout>} />
        <Route path="/rejoindre" element={<GatedLayout><Join /></GatedLayout>} />
        <Route path="/a-propos" element={<GatedLayout><APropos /></GatedLayout>} />
        <Route path="/confidentialite" element={<GatedLayout><Confidentialite /></GatedLayout>} />
        <Route path="/conditions" element={<GatedLayout><Conditions /></GatedLayout>} />
        <Route path="/espace-pro" element={<GatedLayout><ProDashboard /></GatedLayout>} />
        <Route path="/mon-profil" element={<GatedLayout><ProPublicProfile /></GatedLayout>} />
        <Route path="/admin-glist-2026" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppShell() {
  const [visited, setVisited] = useState(hasVisited);
  const { openModal } = useEvaluation();

  const finishVisit = (openEvaluation = false) => {
    markVisited();
    setVisited(true);
    if (openEvaluation) {
      requestAnimationFrame(() => openModal());
    }
  };

  if (!visited) {
    return (
      <FirstVisit
        onExplore={() => finishVisit(false)}
        onEvaluate={() => finishVisit(true)}
      />
    );
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <EvaluationProvider>
      <AppShell />
    </EvaluationProvider>
  );
}
