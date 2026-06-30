import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import CarDetailPage from './pages/CarDetailPage';

import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import CarFormPage from './pages/admin/CarFormPage';
import InquiriesPage from './pages/admin/InquiriesPage';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/inventory" element={<PublicLayout><InventoryPage /></PublicLayout>} />
          <Route path="/inventory/:id" element={<PublicLayout><CarDetailPage /></PublicLayout>} />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<DashboardPage />} />
            <Route path="cars/new" element={<CarFormPage />} />
            <Route path="cars/:id/edit" element={<CarFormPage />} />
            <Route path="inquiries" element={<InquiriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
