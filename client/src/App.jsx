import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SharedFiles from './pages/SharedFiles';
import TrustedUsers from './pages/TrustedUsers';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>加载中...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shared-files"
        element={
          <ProtectedRoute>
            <SharedFiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trusted-users"
        element={
          <ProtectedRoute>
            <TrustedUsers />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;