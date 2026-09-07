import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { QuoteModal } from './components/QuoteModal';

// Public Marketing Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PropertyManagementPage } from './pages/PropertyManagementPage';
import { InteriorDesignPage } from './pages/InteriorDesignPage';
import { AboutPage } from './pages/AboutPage';
import { CareersPage } from './pages/CareersPage';
import { PartnerPage } from './pages/PartnerPage';
import { ContactPage } from './pages/ContactPage';

// Portal & ERP Modules
import { AuthProvider } from './portal/context/AuthContext';
import { ProtectedRoute } from './portal/components/ProtectedRoute';
import { LoginPage } from './portal/pages/LoginPage';
import { PortalLayout } from './portal/components/PortalLayout';
import { DashboardPage } from './portal/pages/DashboardPage';
import { CategoryMasterPage } from './portal/pages/CategoryMasterPage';
import { ClientMasterPage } from './portal/pages/ClientMasterPage';
import { QuotationPage } from './portal/pages/QuotationPage';
import { QuotationListPage } from './portal/pages/QuotationListPage';
import { QuotationViewPage } from './portal/pages/QuotationViewPage';
import { TransactionDetailPage } from './portal/pages/TransactionDetailPage';
import { ServiceReportPage } from './portal/pages/ServiceReportPage';
import { ServiceReportListPage } from './portal/pages/ServiceReportListPage';
import { ServiceReportViewPage } from './portal/pages/ServiceReportViewPage';
import { InvoicePage } from './portal/pages/InvoicePage';
import { InvoiceListPage } from './portal/pages/InvoiceListPage';
import { InvoiceViewPage } from './portal/pages/InvoiceViewPage';

// Scroll to top helper when navigating routes
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Public Website Layout wrapper
interface PublicLayoutProps {
  onOpenQuote: (serviceName?: string) => void;
}

function PublicLayout({ onOpenQuote }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F9] text-gray-800 font-sans selection:bg-brand-green selection:text-white">
      <Navbar onOpenQuote={onOpenQuote} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export function App() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string>('');

  const handleOpenQuote = (serviceName?: string) => {
    setPreselectedService(serviceName || 'Plumbing');
    setIsQuoteOpen(true);
  };

  const handleCloseQuote = () => {
    setIsQuoteOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* =================================================== */}
          {/* AUTHENTICATION PORTAL (STANDALONE)                 */}
          {/* =================================================== */}
          <Route path="/login" element={<LoginPage />} />

          {/* =================================================== */}
          {/* AUTHENTICATED ERP MANAGEMENT PORTAL                 */}
          {/* =================================================== */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="category-master" element={<CategoryMasterPage />} />
            <Route path="client-master" element={<ClientMasterPage />} />
            <Route path="quotation" element={<QuotationPage />} />
            <Route path="quotation/edit/:id" element={<QuotationPage />} />
            <Route path="quotation/:id" element={<QuotationViewPage />} />
            <Route path="quotations" element={<QuotationListPage />} />

            {/* Central Master Transaction Cockpit */}
            <Route path="transaction/:id" element={<TransactionDetailPage />} />

            {/* Service Report Routes */}
            <Route path="service-report" element={<ServiceReportPage />} />
            <Route path="service-reports" element={<ServiceReportListPage />} />
            <Route path="service-report/:id" element={<ServiceReportViewPage />} />

            {/* Invoice Routes */}
            <Route path="invoice" element={<InvoicePage />} />
            <Route path="invoices" element={<InvoiceListPage />} />
            <Route path="invoice/:id" element={<InvoiceViewPage />} />

            {/* Fallback inside portal */}
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Route>

          {/* =================================================== */}
          {/* PUBLIC MARKETING WEBSITE (UNTOUCHED DESIGN)        */}
          {/* =================================================== */}
          <Route element={<PublicLayout onOpenQuote={handleOpenQuote} />}>
            <Route path="/" element={<HomePage onOpenQuote={handleOpenQuote} />} />
            <Route path="/services" element={<ServicesPage onOpenQuote={handleOpenQuote} />} />
            <Route path="/property-management" element={<PropertyManagementPage onOpenQuote={handleOpenQuote} />} />
            <Route path="/interior-design" element={<InteriorDesignPage onOpenQuote={handleOpenQuote} />} />
            <Route path="/about" element={<AboutPage onOpenQuote={handleOpenQuote} />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/partner-with-us" element={<PartnerPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Fallback public route */}
            <Route path="*" element={<HomePage onOpenQuote={handleOpenQuote} />} />
          </Route>
        </Routes>

        {/* Global Quote Modal for public website */}
        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={handleCloseQuote}
          preselectedService={preselectedService}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
