import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import MethodologyPage from './pages/MethodologyPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/methodology" element={<MethodologyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
