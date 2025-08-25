import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import CreatePurchaseOrderPage from './pages/CreatePurchaseOrderPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import CreateSalesOrderPage from './pages/CreateSalesOrderPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage'; 
import ConfirmPasswordResetPage from './pages/ConfirmPasswordResetPage'; 
import InvoicePage from './pages/InvoicePage'; // Import the new page


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
          <Route path="/reset-password/:token" element={<ConfirmPasswordResetPage />} />
                    <Route path="/sales-orders/:id/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="purchase-orders/create" element={<CreatePurchaseOrderPage />} />
            <Route path="sales-orders" element={<SalesOrdersPage />} />
            <Route path="sales-orders/create" element={<CreateSalesOrderPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;