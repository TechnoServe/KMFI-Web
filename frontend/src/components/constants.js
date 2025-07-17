import settingsClosed from 'assets/images/Settings-Icon.svg';
import dashbaordClosed from 'assets/images/Dashboard.svg';
import satClosed from 'assets/images/Self-Assessment-Icon.svg';
import settings from 'assets/images/settings.svg';
import company from 'assets/images/company.svg';
import dashbaord from 'assets/images/graph.svg';
import {PROTECTED_PATHS} from 'common';
import CompanyIndex from 'assets/images/Companies-Index-Icon.svg';
import asess from 'assets/images/pen.svg';

const {DASHBOARD, SELF_ASSESSMENT, ADMIN_SELF_ASSESSMENT, SETTINGS, COMPANIES_INDEX} = PROTECTED_PATHS;
/**
 * Array of navigation items for company users.
 *
 * @type {Array<{name: string, to: string, icon: string, icon2?: string}>}
 * @returns Navigation links and icons specific to company users
 */
export const companyNavs = [
  // Companies Index navigation item
  {
    name: 'companies-index',
    to: COMPANIES_INDEX,
    icon: company,
  },
  // Dashboard navigation item (with primary and secondary icons)
  {
    name: 'dashboard',
    to: DASHBOARD,
    icon: dashbaord,
    icon2: dashbaordClosed,
  },
  // Self-Assessment navigation item (with primary and secondary icons)
  {
    name: 'self-assessment',
    to: SELF_ASSESSMENT,
    icon: asess,
    icon2: satClosed,
  },
  // Settings navigation item
  {
    name: 'settings',
    to: SETTINGS,
    icon: settingsClosed,
    icon2: settings,
  },
];

/**
 * Array of navigation items for IVC users.
 *
 * @type {Array<{name: string, to: string, icon: string, icon2?: string}>}
 * @returns Navigation links and icons specific to IVC users
 */
export const ivcNavs = [
  // Companies Index navigation item
  {
    name: 'companies-index',
    to: COMPANIES_INDEX,
    icon: company,
  },
  // Settings navigation item
  {
    name: 'settings',
    to: SETTINGS,
    icon: settingsClosed,
    icon2: settings,
  },
];

/**
 * Array of navigation items for admin users.
 *
 * @type {Array<{name: string, to: string, icon: string, icon2?: string}>}
 * @returns Navigation links and icons specific to admin users
 */
export const adminNavs = [
  // Dashboard navigation item (with primary and secondary icons)
  {
    name: 'dashboard',
    to: DASHBOARD,
    icon: dashbaord,
    icon2: dashbaordClosed,
  },
  // Companies Index navigation item (with primary and secondary icons)
  {
    name: 'companies-index',
    to: COMPANIES_INDEX,
    icon: CompanyIndex,
    icon2: company,
  },
  // Self-Assessment navigation item (with primary and secondary icons)
  {
    name: 'self-assessment',
    to: ADMIN_SELF_ASSESSMENT,
    icon: asess,
    icon2: satClosed,
  },
  // Settings navigation item
  {
    name: 'settings',
    to: SETTINGS,
    icon: settingsClosed,
    icon2: settings,
  },
];
