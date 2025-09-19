/* ============================================================================
   AXIOS INSTANCE & INTERCEPTORS
============================================================================ */
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const authTokens = localStorage.getItem('authTokens');
    if (authTokens) {
      const token = JSON.parse(authTokens).access;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens & auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const authTokens = localStorage.getItem('authTokens');
      const refreshToken = authTokens ? JSON.parse(authTokens).refresh : null;

      if (refreshToken) {
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh: refreshToken });
          const newTokens = response.data;
          localStorage.setItem('authTokens', JSON.stringify(newTokens));

          api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;

          return api(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem('authTokens');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================================================
   AUTHENTICATION
============================================================================ */
export const loginUser = (username, password) => api.post('/token/', { username, password });
export const registerUser = (userData) => api.post('/register/', userData);
export const requestPasswordReset = (email) => api.post('/password_reset/', { email });
export const confirmPasswordReset = (token, password) => api.post('/password_reset/confirm/', { token, password });

/* ============================================================================
   PROFILE MANAGEMENT
============================================================================ */
export const getUserProfile = () => api.get('/users/me/');
export const updateUserProfile = (userData) => api.patch('/users/me/', userData);
export const changePassword = (passwordData) => api.put('/change-password/', passwordData);

/* ============================================================================
   PRODUCTS
============================================================================ */
export const getProducts = (params) => api.get('/products/', { params });
export const createProduct = (product) => api.post('/products/', product);
export const updateProduct = (id, product) => api.put(`/products/${id}/`, product);
export const patchProduct = (id, productData) => api.patch(`/products/${id}/`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);

/* ============================================================================
   SUPPLIERS
============================================================================ */
export const getSuppliers = (params) => api.get('/suppliers/', { params });
export const createSupplier = (supplier) => api.post('/suppliers/', supplier);
export const updateSupplier = (id, supplier) => api.put(`/suppliers/${id}/`, supplier);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}/`);

/* ============================================================================
   PURCHASE ORDERS
============================================================================ */
export const getPurchaseOrders = () => api.get('/purchase-orders/');
export const createPurchaseOrder = (orderData) => api.post('/purchase-orders/', orderData);
export const receivePurchaseOrder = (id) => api.post(`/purchase-orders/${id}/receive/`);

/* ============================================================================
   SALES ORDERS
============================================================================ */
export const getSalesOrders = () => api.get('/sales-orders/');
export const getSalesOrderById = (id) => api.get(`/sales-orders/${id}/`);
export const createSalesOrder = (orderData) => api.post('/sales-orders/', orderData);

/* ============================================================================
   DASHBOARD & REPORTS
============================================================================ */
export const getDashboardStats = () => api.get('/dashboard-stats/');
export const getTransactions = (params) => api.get('/transactions/', { params });
export const getAuditLogs = (params) => api.get('/audit-logs/', { params });

/* ============================================================================
   EXPORT DEFAULT
============================================================================ */
export default api;