import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Events from './components/Events';
import Students from './components/Students';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import SuperAdmin from './components/SuperAdmin';
import Layout from './components/Layout';

function SuperAdminOrDashboard() {
  const { admin } = useAuth();
  
  if (admin?.role === 'super_admin') {
    return <SuperAdmin />;
  }
  
  return <Dashboard />;
}

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return admin ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<SuperAdminOrDashboard />} />
              <Route path="superadmin" element={<SuperAdmin />} />
              <Route path="events" element={<Events />} />
              <Route path="students" element={<Students />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
