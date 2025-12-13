import axios from 'axios';

const API_BASE_URL =  'http://localhost:9001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const invoiceApi = {

  getInvoiceByNumber: (invoiceNo: string) => api.get(`/sales/invoicesNumber?So_Inv_No=${invoiceNo}`),
  
 
  createInvoice: (invoiceData: any) => api.post('/invoices', invoiceData),
  
 
  printInvoice: (id: string) => api.post(`/invoices/${id}/print`),
};


export const companyApi = {
  getCompanyInfo: () => api.get('/company'),
};


api.interceptors.response.use(
  (response: any) => response,
  (error: { response: { data: any; }; message: any; }) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;