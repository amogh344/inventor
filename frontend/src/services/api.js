// import axios from 'axios';

// const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });

// // --- Auth ---
// export const loginUser = (username, password) => api.post('/token/', { username, password });
// export const registerUser = (userData) => api.post('/register/', userData);

// // --- Products ---
// export const getProducts = () => api.get('/products/');
// export const createProduct = (product) => api.post('/products/', product);
// export const updateProduct = (id, product) => api.put(`/products/${id}/`, product);
// export const deleteProduct = (id) => api.delete(`/products/${id}/`);

// // --- Suppliers ---
// export const getSuppliers = () => api.get('/suppliers/');
// export const createSupplier = (supplier) => api.post('/suppliers/', supplier);
// export const updateSupplier = (id, supplier) => api.put(`/suppliers/${id}/`, supplier);
// export const deleteSupplier = (id) => api.delete(`/suppliers/${id}/`);

// // --- Purchase Orders ---
// export const getPurchaseOrders = () => api.get('/purchase-orders/');
// export const createPurchaseOrder = (orderData) => api.post('/purchase-orders/', orderData);
// export const receivePurchaseOrder = (id) => api.post(`/purchase-orders/${id}/receive/`);

// // --- Sales Orders ---
// export const getSalesOrders = () => api.get('/sales-orders/');
// export const createSalesOrder = (orderData) => api.post('/sales-orders/', orderData);

// // --- Transactions & Dashboard ---
// export const getTransactions = (params) => api.get('/transactions/', { params });
// export const getDashboardStats = () => api.get('/dashboard-stats/');

// // Add this function to fetch the barcode image data
// export const getBarcode = (sku) => {
//     return api.get(`/products/${sku}/barcode/`, {
//         responseType: 'blob', // Important: we expect image data, not JSON
//     });
// };

// export default api;

// src/api/index.js
import axios from 'axios';

// Create a new Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Use an interceptor to automatically add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const authTokens = localStorage.getItem('authTokens');
    if (authTokens) {
      const token = JSON.parse(authTokens).access;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth ---
export const loginUser = (username, password) => api.post('/token/', { username, password });
export const registerUser = (userData) => api.post('/register/', userData);

// --- Profile Management ---
export const getUserProfile = () => api.get('/users/me/');
export const updateUserProfile = (userData) => api.patch('/users/me/', userData);
export const changePassword = (passwordData) => api.put('/change-password/', passwordData);

// --- Products ---
export const getProducts = () => api.get('/products/');
export const createProduct = (product) => api.post('/products/', product);
export const updateProduct = (id, product) => api.put(`/products/${id}/`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);
export const getBarcode = (sku) => api.get(`/products/${sku}/barcode/`, { responseType: 'blob' });

// --- Suppliers ---
export const getSuppliers = () => api.get('/suppliers/');
export const createSupplier = (supplier) => api.post('/suppliers/', supplier);
export const updateSupplier = (id, supplier) => api.put(`/suppliers/${id}/`, supplier);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}/`);

// --- Purchase Orders ---
export const getPurchaseOrders = () => api.get('/purchase-orders/');
export const createPurchaseOrder = (orderData) => api.post('/purchase-orders/', orderData);
export const receivePurchaseOrder = (id) => api.post(`/purchase-orders/${id}/receive/`);

// --- Sales Orders ---
export const getSalesOrders = () => api.get('/sales-orders/');
export const createSalesOrder = (orderData) => api.post('/sales-orders/', orderData);

// --- Dashboard & Reports ---
export const getDashboardStats = () => api.get('/dashboard-stats/');
export const getTransactions = (params) => api.get('/transactions/', { params });


export const getQRCode = (sku) => api.get(`/products/${sku}/qrcode/`, { responseType: 'blob' });


export const requestPasswordReset = (email) => api.post('/password_reset/', { email });
export const confirmPasswordReset = (token, password) => api.post('/password_reset/confirm/', { token, password });



export default api;