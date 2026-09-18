import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Customers from './pages/Customers';
import Recommendations from './pages/Recommendations';
import VoiceAI from './pages/VoiceAI';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import './styles/dashboard.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="customers" element={<Customers />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="voice-ai" element={<VoiceAI />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
