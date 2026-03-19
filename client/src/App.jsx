import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import WhatsAppFloat from './components/common/WhatsAppFloat';
import LeadGateModal from './components/common/LeadGateModal';

// Pages
import Home from './pages/Home';
import Institutions from './pages/Institutions';
import InstitutionDetails from './pages/InstitutionDetails';
import Contact from './pages/Contact';
import ItServices from './pages/ItServices';
import International from './pages/International';

// Admin
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/super-admin-login';

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="min-h-screen">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppFloat />}
      {!isAdminRoute && <LeadGateModal />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/institution/:id" element={<InstitutionDetails />} />
            <Route path="/it-services" element={<ItServices />} />
            <Route path="/international" element={<International />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin Routes */}
            <Route path="/super-admin-login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
};

export default App;
