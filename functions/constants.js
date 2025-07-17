/**
 * @file Defines and exports constant values used throughout the Firebase backend system.
 * These include Firestore collection names, user roles, scoring indexes, and response mappings.
 */

/**
 * Firestore collection names used in the application.
 * PascalCase and pluralized as per backend naming convention.
 * @constant
 */
module.exports.COLLECTIONS = {
  USERS: 'Users',
  COMPANY_USERS: 'CompanyUsers',
  MFI_ADMINS: 'MfiAdmins',
  PARTICIPATING_COMPANIES: 'ParticipatingCompanies',
  COMPANY_SIZES: 'CompanySizes',
  FOOD_VEHICLES: 'ProductTypes',
  PRODUCT_MICRO_NUTRIENTS: 'ProductMicroNutrient',
  MICRO_NUTRIENTS_SCORES: 'MicroNutrientScores',
  PRODUCT_TESTING: 'ProductTesting',
  MICRO_NUTRIENTS: 'MicroNutrients',
  COMPANY_INVITATIONS: 'CompanyInvitations',
  ADMIN_INVITATIONS: 'AdminInvitations',
  USER_TYPES: 'UserTypes',
  COMPANY_ROLES: 'CompanyRoles',
  ADMIN_ROLES: 'AdminRoles',
  ADMIN_USERS: 'AdminUsers',
  ACTIVITY_LOGS: 'ActivityLogs',
  QUESTION_CATEGORIES: 'QuestionCategories',
  QUESTIONS: 'SAQuestion', // TODO: it should change to plural on firebase
  COMMENTS: 'Comments',
  DOCUMENTS: 'Documents',
  SA_CYCLES: 'SACycles',
  SA_ANSWERS: 'SAAnswers',
  IVC_ANSWERS: 'IVCAnswers',
  QUESTION_TIERS: 'QuestionTiers',
  COMPANY_BRANDS: 'CompanyBrands',
  COMPUTED_ASSESSMENT_SCORES: 'ComputedAssessmentScores',
  ASSESSMENT_SCORES: 'AssessmentScores',
  ALLOTATIONS: 'Allotations',
};

/**
 * Roles available to Participating Company users.
 * @constant
 */
module.exports.PC_ROLES = {
  ADMIN: 'pc_admin',
  USER: 'user',
};

/**
 * Roles available for TNS internal staff and admins.
 * @constant
 */
module.exports.TNS_ROLES = {
  NUCLEAR_ADMIN: 'nuclear_admin',
  ADMIN: 'admin',
  SUPER: 'super',
  BASIC: 'basic',
  IVC_ADMIN: 'ivc_admin',
  IVC: 'ivc',
};

/**
 * Supported user types in the system.
 * @constant
 */
module.exports.USER_TYPES = {
  PARTICIPATING_COMPANY: 'company',
  MFI_INTERNAL_STAKEHOLDER: 'mfi_internal_stakeholder',
  ADMIN: 'admin',
  PUBLIC: 'general_public',
};

/**
 * Actions tracked in the Activity Logs for audit and analytics.
 * @constant
 */
module.exports.ACTIVITY_LOG_ACTIONS = {
  LOGGED_IN: 'logged in',
  INVITED_TEAM_MEMBERS: 'invited team members',
  UPLOADED_EVIDENCE: 'uploaded evidence',
  SENT_SUBMISSION: 'sent submission',
  ADMIN_APPROVE_SAT: 'admin approve sat',
  ADMIN_PUBLISH_IVC: 'admin publish ivc',
  ADMIN_UNPUBLISH_IVC: 'admin unpublish ivc',
  ADMIN_ASSIGN_COMPANY_TO_USER: 'admin assign company to user',
  ADMIN_REMOVE_COMPANY_FROM_ADMIN: 'admin remove company from admin',
  ADMIN_DELETE_USER: 'admin delete user',
};

/**
 * Types that can "own" or be associated with comments or uploads.
 * @constant
 */
module.exports.OWNER_TYPES = {
  QUESTION: 'question',
  CATEGORY: 'category',
};

/**
 * Company tier labels used in scoring and reporting.
 * @constant
 */
module.exports.COMPANY_TIERS = {
  TIER_1: 'TIER_1',
  TIER_3: 'TIER_3',
};

/**
 * SAT possible responses used in scoring logic.
 * @constant
 */
module.exports.SAT_RESPONSES = {
  NOT_MET: 'NOT_MET',
  PARTLY_MET: 'PARTLY_MET',
  MOSTLY_MET: 'MOSTLY_MET',
  FULLY_MET: 'FULLY_MET',
};

/**
 * Firebase Storage bucket paths used for storing assets.
 * @constant
 */
module.exports.BUCKETS = {
  COMPANIES_LOGO: 'companies/logos/'
};

/**
 * Base weights and multipliers used to calculate SAT scores.
 * @constant
 */
module.exports.SAT_SCORING_INDEX = {
  MAX_POINTS: 10,
  TIER_1: 0.60,
  TIER_2: 0.25,
  TIER_3: 0.15,
  NOT_MET: 0.15,
  PARTLY_MET: 0.54,
  MOSTLY_MET: 0.75,
  FULLY_MET: 1.00,
};

/**
 * Normalized SAT scoring values based on company tier and response level.
 * Used in current scoring logic.
 * @constant
 */
module.exports.SAT_SCORES_INNER = {
  TIER_1: {
    NOT_MET: 0.30,
    PARTLY_MET: 1.08,
    MOSTLY_MET: 1.5,
    FULLY_MET: 2.0,
  },
  TIER_2: {
    NOT_MET: 0.13,
    PARTLY_MET: 0.45,
    MOSTLY_MET: 0.63,
    FULLY_MET: 0.83,
  },
  TIER_3: {
    NOT_MET: 0.08,
    PARTLY_MET: 0.27,
    MOSTLY_MET: 0.38,
    FULLY_MET: 0.50,
  },
};

/**
 * Calculated SAT scores using updated multipliers.
 * Used in the current SAT scoring logic.
 * @constant
 */
module.exports.SAT_SCORES = {
  TIER_1: {
    NOT_MET: this.SAT_SCORES_INNER['TIER_1']['NOT_MET'],
    PARTLY_MET: this.SAT_SCORES_INNER['TIER_1']['PARTLY_MET'],
    MOSTLY_MET: this.SAT_SCORES_INNER['TIER_1']['MOSTLY_MET'],
    FULLY_MET: this.SAT_SCORES_INNER['TIER_1']['FULLY_MET'],
  },
  TIER_2: {
    NOT_MET: this.SAT_SCORES_INNER['TIER_2']['NOT_MET'],
    PARTLY_MET: this.SAT_SCORES_INNER['TIER_2']['PARTLY_MET'],
    MOSTLY_MET: this.SAT_SCORES_INNER['TIER_2']['MOSTLY_MET'],
    FULLY_MET: this.SAT_SCORES_INNER['TIER_2']['FULLY_MET'],
  },
  TIER_3: {
    NOT_MET: this.SAT_SCORES_INNER['TIER_3']['NOT_MET'],
    PARTLY_MET: this.SAT_SCORES_INNER['TIER_3']['PARTLY_MET'],
    MOSTLY_MET: this.SAT_SCORES_INNER['TIER_3']['MOSTLY_MET'],
    FULLY_MET: this.SAT_SCORES_INNER['TIER_3']['FULLY_MET'],
  },
};

/**
 * Deprecated SAT score values based on the previous scoring model.
 * Retained for backward compatibility or comparison.
 * @constant
 */
module.exports.SAT_SCORES_OLD = {
  TIER_1: {
    NOT_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_1'] * this.SAT_SCORING_INDEX['NOT_MET'],
    PARTLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_1'] * this.SAT_SCORING_INDEX['NOT_MET'],
    MOSTLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_1'] * this.SAT_SCORING_INDEX['MOSTLY_MET'],
    FULLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_1'] * this.SAT_SCORING_INDEX['FULLY_MET'],
  },
  TIER_2: {
    NOT_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_2'] * this.SAT_SCORING_INDEX['NOT_MET'],
    PARTLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_2'] * this.SAT_SCORING_INDEX['NOT_MET'],
    MOSTLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_2'] * this.SAT_SCORING_INDEX['MOSTLY_MET'],
    FULLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_2'] * this.SAT_SCORING_INDEX['FULLY_MET'],
  },
  TIER_3: {
    NOT_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_3'] * this.SAT_SCORING_INDEX['NOT_MET'],
    PARTLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_3'] * this.SAT_SCORING_INDEX['NOT_MET'],
    MOSTLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_3'] * this.SAT_SCORING_INDEX['MOSTLY_MET'],
    FULLY_MET: this.SAT_SCORING_INDEX['MAX_POINTS'] * this.SAT_SCORING_INDEX['TIER_3'] * this.SAT_SCORING_INDEX['FULLY_MET'],
  },
};
