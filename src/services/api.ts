import axios from 'axios';

const API_BASE_URL =  'http://localhost:9001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Invoice APIs - only what you need
export const invoiceApi = {
  // Get invoice by invoice number - THIS IS WHAT YOU NEED
  getInvoiceByNumber: (invoiceNo: string) => api.get(`/invoices/number/${invoiceNo}`),
  
  // Create new invoice (if you need to save before printing)
  createInvoice: (invoiceData: any) => api.post('/invoices', invoiceData),
  
  // Print invoice (optional - if you want to track prints)
  printInvoice: (id: string) => api.post(`/invoices/${id}/print`),
};

// Company APIs (for company info in the print)
export const companyApi = {
  getCompanyInfo: () => api.get('/company'),
};

// Interceptors for handling errors
api.interceptors.response.use(
  (response: any) => response,
  (error: { response: { data: any; }; message: any; }) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;