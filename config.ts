export const APP_CONFIG = {
  // Change this to 'SERVER' when you have a backend running with SQLite/Postgres
  storageType: 'BROWSER' as 'BROWSER' | 'SERVER', 
  
  // API Endpoint for the server mode
  apiBaseUrl: 'http://localhost:3000/api',

  // Default branding
  defaultThemeColor: '#2563eb'
};