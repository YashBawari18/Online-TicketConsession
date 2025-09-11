import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { StudentLogin } from './pages/student/StudentLogin';
import { StudentSignup } from './pages/student/StudentSignup';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const PrivateRoute: React.FC<{ children: React.ReactNode; userType?: 'student' | 'admin' }> = 
  ({ children, userType }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (userType && user.type !== userType) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/${user.type}/dashboard`} replace /> : <HomePage />} />
        
        {/* Student Routes */}
        <Route path="/student/login" element={user ? <Navigate to="/student/dashboard" replace /> : <StudentLogin />} />
        <Route path="/student/signup" element={user ? <Navigate to="/student/dashboard" replace /> : <StudentSignup />} />
        <Route 
          path="/student/dashboard" 
          element={
            <PrivateRoute userType="student">
              <Layout>
                <StudentDashboard />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute userType="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;