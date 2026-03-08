import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => (
  <LanguageProvider>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  </LanguageProvider>
);

export default App;
