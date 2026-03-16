const { protocol, host } = window.location, api = `${protocol}//${host}/api/`;
// const api = "https://pukalfoods.erpsmt.in/api/";
// const api="http://localhost:9001/api/"
// // const api = "http://192.168.3.113:9001/api/";

// const api = 'https://erpsmt.in/api/';
// // const api = 'https://pukaltechnologies.in/api/';
// // const api = "http://shrifoods.erpsmt.in/api/";


export default api;


// API.js

// const getCompanyId = () => {
//   if (typeof window === 'undefined') return '1';
//   const params = new URLSearchParams(window.location.search);
//   return params.get('CompanyId') || '1';
// };


// // 🔹 API URLs for different companies
// const API = {
//   '1': 'http://erpsmt.in/api/',
//   '2': 'http://erp.pukaltechnologies.in/api/',
//   '3': 'http://shrifoods.erpsmt.in/api/',

//   'auto': (() => {
//     const { protocol, host } = window.location;
//     return `${protocol}//${host}/api/`;
//   })()
// };

// // 🔹 Get current API URL based on CompanyId
// const getCurrentAPI = () => {
//   const companyId = getCompanyId();
//   return API[companyId] || API['1'];
// };

// // Export both the API object and current API URL
// export { getCompanyId, API, getCurrentAPI };

// // Default export is the current API URL
// export default getCurrentAPI();