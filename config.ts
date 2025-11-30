
export const APP_CONFIG = {
  // Change this to 'SERVER' when you have a backend running with SQLite/Postgres
  storageType: 'SERVER' as 'BROWSER' | 'SERVER', 
  
  // API Endpoint for the server mode (Relative path for same-origin deployment)
  apiBaseUrl: '/api',

  // Default branding
  defaultThemeColor: '#2563eb'
};
