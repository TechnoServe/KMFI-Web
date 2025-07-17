import ComingSoon from 'components/coming-soon';
import CompaniesIndex from 'pages/company/company-index';
import ivcCompanyIndex from 'pages/ivc/company-index';
import AdminCompanyIndex from 'pages/admin/company-list';
import Settings from 'pages/company/settings';
import AdminSettings from 'pages/admin/settings';
import IVCSettings from 'pages/ivc/settings';
import SelfAssessment from 'pages/company/self-assessment';
import AdminSelfAssessment from 'pages/admin/self-assessment';
import axios from 'axios';
import Dashboard from 'pages/company/dashboard';
import AdminDashboard from 'pages/admin/dashboard';
import IvcAssessment from 'pages/ivc/self-assessment';

/**
 * Creates an Axios instance pre-configured for API calls.
 *
 * Adds an Authorization header with a bearer token from sessionStorage if secure mode is enabled.
 * Sets up an interceptor to catch 401 Unauthorized responses for secure requests.
 *
 * @param {boolean} secure - Whether to include Authorization header with bearer token
 * @returns {import('axios').AxiosInstance} Configured Axios instance
 */
export function request(secure = false) {
  // Default headers for all API requests
  let headers = {
    'Accept': 'application/json, text/plain,*/*',
    'Content-Type': 'application/json',
  };

  // If secure is true, include auth token from session storage
  if (secure) {
    headers = {
      ...headers,
      authorization: `Bearer ${sessionStorage.getItem('auth-token')}`,
    };
  }

  // Create an Axios instance with base URL and headers
  const instance = axios.create({
    baseURL: 'https://selfassessment.kmfi-ke.org/api/v1',
    headers,
  });

  // Add response interceptor to handle 401 errors on secure requests
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (secure && err.response.status == 401) {
        // sessionStorage.removeItem('auth-token');
        // sessionStorage.removeItem('auth-token');
      }
      return Promise.reject(err);
    }
  );

  // Return the configured Axios instance
  return instance;
}

/**
 * Route constants used by protected application views
 * @constant
 */
export const PROTECTED_PATHS = {
  COMPANY: '/company',
  ADMIN: '/admin',
  IVC: '/ivc',
  HOME: 'updates',
  DASHBOARD: 'dashboard',
  SELF_ASSESSMENT: 'self-assessment',
  ADMIN_SELF_ASSESSMENT: 'self-assessment',
  HELP: 'help',
  SETTINGS: 'settings',
  COMPANIES_INDEX: 'companies-index',
};

const {HOME, DASHBOARD, SELF_ASSESSMENT, ADMIN_SELF_ASSESSMENT, HELP, SETTINGS, COMPANIES_INDEX} = PROTECTED_PATHS;

/**
 * Route configuration for COMPANY users
 * @type {Array<{path: string, page: React.ComponentType, exact: boolean}>}
 */
export const SUB_ROUTES = [
  {path: DASHBOARD, page: Dashboard, exact: true},
  {path: HOME, page: ComingSoon, exact: true},
  {path: SELF_ASSESSMENT, page: SelfAssessment, exact: true},
  {path: HELP, page: ComingSoon, exact: true},
  {path: SETTINGS, page: Settings, exact: true},
  {path: COMPANIES_INDEX, page: CompaniesIndex, exact: true},
];

/**
 * Route configuration for ADMIN users
 * @type {Array<{path: string, page: React.ComponentType, exact: boolean}>}
 */
export const ADMIN_SUB_ROUTES = [
  {path: DASHBOARD, page: AdminDashboard, exact: true},
  {path: ADMIN_SELF_ASSESSMENT, page: AdminSelfAssessment, exact: true},
  {path: SETTINGS, page: AdminSettings, exact: true},
  {path: COMPANIES_INDEX, page: AdminCompanyIndex, exact: true},
];

/**
 * Route configuration for IVC users
 * @type {Array<{path: string, page: React.ComponentType, exact: boolean}>}
 */
export const IVC_SUB_ROUTES = [
  {path: DASHBOARD, page: ComingSoon, exact: true},
  {path: HOME, page: ComingSoon, exact: true},
  {path: SELF_ASSESSMENT, page: IvcAssessment, exact: true},
  {path: HELP, page: ComingSoon, exact: true},
  {path: SETTINGS, page: IVCSettings, exact: true},
  {path: COMPANIES_INDEX, page: ivcCompanyIndex, exact: true},
];
