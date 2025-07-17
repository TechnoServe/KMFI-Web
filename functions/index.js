loadEnv();

const express = require('express');
const cors = require('cors');
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const middlewares = require('./middlewares');
const {updateAuthenticatedUserData} = require('./general');
const {getAuthenticatedUser} = require('./general');
const {dataStoreMiddleware} = require('./middlewares/dataStoreMiddleware');
const {commentRouter} = require('./companies/comment.controller');
const {documentRouter} = require('./companies/document.controller');
const {getFirebaseAdmin} = require('./index.admin');


// Controllers
const companyRoutes = require('./companies');
const generalRoutes = require('./general');
const assessmentsController = require('./assessments');

const {validateLogin} = require('./middlewares/loginMiddleware');
const {canApproveSAT} = require('./policies');
const adminController = require('./admin');

const admin = getFirebaseAdmin();

const smtpConfig = {
  host: process.env.SMTP_ENDPOINT,
  port: 587,
  // secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
};
const mailTransport = nodemailer.createTransport(
  smtpConfig
);

const store = require('./store')(admin.firestore(), admin.auth());

const v1 = new express.Router();
v1.get('/me', [middlewares.authorization(store)], getAuthenticatedUser(store));
v1.put('/me', [middlewares.authorization(store)], updateAuthenticatedUserData(store));
v1.post('/login', validateLogin(), generalRoutes.login(store, mailTransport));
v1.post('/verify-login-token', [middlewares.authorization(store)], generalRoutes.getAuthUserInfo(store));
v1.post('/sign-up', [middlewares.validateSignUp(store)], companyRoutes.signUp(store, mailTransport));
v1.get('/company-size-list', generalRoutes.companySizeList(store));
v1.get('/product-type-list', generalRoutes.productTypeList(store));
v1.get('/product-micro-nutrients', generalRoutes.productMicroNutrients(store));
v1.get('/product-micro-nutrient', generalRoutes.productMicroNutrient(store));
v1.get('/ranking-list', generalRoutes.rankingList(store));

// Assessments routes
const assessments = new express.Router();
assessments.post('/compute-scores', [middlewares.authorization(store)], assessmentsController.computeScore(store));
assessments.post('/ieg', [middlewares.authorization(store)], assessmentsController.persistIEGScores(store));
assessments.post('/sat', [middlewares.authorization(store)], assessmentsController.persistSATScores(store));
v1.use('/assessments', assessments);

// SAT routes
const sat = new express.Router();
sat.post('/get/answers', [middlewares.authorization(store)], companyRoutes.getSATAnswers(store));
sat.post('/get/previous-answers', [middlewares.authorization(store)], companyRoutes.getPreviousSATAnswers(store));
sat.post('/get/ivc/answers', [middlewares.authorization(store)], companyRoutes.getIVCAnswers(store));
sat.post('/answers', [middlewares.authorization(store)], companyRoutes.submitSATAnswer(store));
sat.get('/scores', [middlewares.authorization(store)], companyRoutes.getSatScores(store));
v1.use('/sat', sat);

// Company routes
const company = new express.Router();
company.post('/accept-invite', companyRoutes.acceptCompanyInvite(store, mailTransport));
company.post('/invite-team-member', [middlewares.authorization(store)], companyRoutes.adminInviteTeamMember(store, mailTransport));
company.post('/cancel-invite-pc', [middlewares.authorization(store)], companyRoutes.cancelInvite(store, mailTransport));
company.post('/edit', [middlewares.authorization(store)], companyRoutes.editCompanyDetails(store));
company.get('/activity-logs', [middlewares.authorization(store)], companyRoutes.getCompanyActivityLogs(store));
company.post('/set-tier', [middlewares.authorization(store)], companyRoutes.setTier(store));
company.get('/details', [middlewares.authorization(store)], companyRoutes.getCompanyDetails(store));
company.post('/delete-members', [middlewares.authorization(store)], companyRoutes.deleteCompanyMember(store));
company.get('/:id/members', [middlewares.authorization(store)], generalRoutes.listCompanyMembers(store));
company.get('/brands', [middlewares.authorization(store)], companyRoutes.getBrands(store));
company.get('/brands/product-tests', [middlewares.authorization(store)], companyRoutes.getBrandProductTests(store));
company.get('/brands/product-type', [middlewares.authorization(store)], companyRoutes.getBrandProductType(store));
company.post('/brands', [middlewares.authorization(store)], companyRoutes.updateBrands(store));
company.get('/ieg', [middlewares.authorization(store)], companyRoutes.getIEGScores(store));
company.get('/ivc', [middlewares.authorization(store)], companyRoutes.getIVCAnswers(store));
company.get('/activities', [middlewares.authorization(store)], companyRoutes.getActivities(store));
company.get('/active-cycle', [middlewares.authorization(store)], companyRoutes.getActiveCycle(store));
v1.use('/company', company);

// Companies routes
const companies = new express.Router();
companies.get('/', [middlewares.authorization(store)], companyRoutes.getCompanies(store));
companies.get('/for-ivc', [middlewares.authorization(store)], companyRoutes.getIvcCompanies(store));
companies.get('/assigned', [middlewares.authorization(store)], companyRoutes.getAssignedCompanies(store));
companies.post('/:id/products-tests', [middlewares.authorization(store)], companyRoutes.saveProductTesting(store));
companies.get('/:id/products-tests', [middlewares.authorization(store)], companyRoutes.getProductTesting(store));
companies.get('/:id/products-tests-v2', [middlewares.authorization(store)], companyRoutes.getProductTestingV2(store));
companies.get('/:id/:cid/aggs', [middlewares.authorization(store)], companyRoutes.getCompanyAggsScore(store));
companies.post('/:id/logo', [middlewares.authorization(store), middlewares.isCompanyAdmin(store)], companyRoutes.uploadCompanyLogo(store, admin));
company.get('/cycles', [middlewares.authorization(store)], adminController.getCycles(store));
v1.use('/companies', companies);

// Questions routes
const questions = new express.Router();
questions.post('/', [middlewares.authorization(store)], companyRoutes.getSAQuestions(store));
questions.post('/admin', [middlewares.authorization(store)], companyRoutes.getSAQuestionsAdmin(store));
questions.post('/categories', [middlewares.authorization(store)], companyRoutes.getQuestionCategories(store));
questions.post('/update', [middlewares.authorization(store)], companyRoutes.updateQuestions(store));
questions.get('/categories/modal', [middlewares.authorization(store)], companyRoutes.getModalCategories(store));
questions.post('/category/update', [middlewares.authorization(store)], companyRoutes.updateQuestionCategory(store));
questions.post('/category/parent/update', [middlewares.authorization(store)], companyRoutes.updateParentQuestionCategory(store));
v1.use('/questions', questions);

// Questions routes
const adminRoute = new express.Router();
adminRoute.post('/approve-sat', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.approveSAT(store));
adminRoute.post('/publish-sat', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.publishIVC(store));
adminRoute.post('/unpublish-sat', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.unpublishIVC(store));
adminRoute.post('/invite', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.inviteTeamMember(store, mailTransport));
adminRoute.post('/cancel-invitation', [middlewares.authorization(store)], adminController.cancelInvite(store, mailTransport));
adminRoute.post('/accept-invitation', adminController.acceptInvite(store, mailTransport));
adminRoute.post('/favorite', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.assignCompanyToSelf(store));
adminRoute.post('/assign-company', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.assignCompanyToAdmin(store));
adminRoute.delete('/assign-company/:id', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.removeCompanyFromAdmin(store));
adminRoute.get('/members', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.listMembers(store));
adminRoute.get('/company/members', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.listCompanyMembers(store));
adminRoute.get('/companies', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.getCompanies(store));
adminRoute.get('/companies-admin', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.getCompaniesAdmin(store));
adminRoute.put('/companies-admin/:id/activate', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.activateCompany(store));
adminRoute.put('/companies-admin/:id/deactivate', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.deactivateCompany(store));
adminRoute.get('/brands-admin', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.getBrandsAdmin(store));
adminRoute.get('/roles', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.getAdminRoles(store));
// adminRoute.get('/active-cycle', [middlewares.authorization(store)], adminController.getActiveCycle(store));
adminRoute.get('/active-cycle', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.getActiveCycle(store));
adminRoute.get('/cycles', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.getCycles(store));
adminRoute.put('/assign-role', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.assignRole(store));
adminRoute.put('/lock-sat', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.lockSat(store));
adminRoute.get('/index', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.getAdminIndex(store));
adminRoute.post('/ivc', [middlewares.authorization(store), middlewares.isMFIAdmin], companyRoutes.submitIVCAnswer(store));
adminRoute.get('/assessment-scores', [middlewares.authorization(store), middlewares.isMFIAdmin], assessmentsController.getScores(store));
adminRoute.delete('/company/delete/:id', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.deleteCompanyData(store));
adminRoute.delete('/micronutrient/:ptid', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.deleteMicroNutrientScore(store));
adminRoute.delete('/delete/user/:id/:authId', [middlewares.authorization(store), middlewares.isMFIAdmin, middlewares.isAuthorized(canApproveSAT)], adminController.deleteUser(store));
adminRoute.post('/email', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.emailCompany(store, mailTransport));
adminRoute.put('/brands/activate/all', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.makeAllCompanyBrandsActive(store));
adminRoute.put('/comments/update/all', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.makeAllCommentsTier1(store));
adminRoute.put('/documents/update/all', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.makeAllDocumentsTier1(store));
adminRoute.get('/sat-export/:company/:cycle', [middlewares.authorization(store), middlewares.isMFIAdmin], adminController.satExport(store));
v1.use('/admin', adminRoute);

v1.use('/comments', [dataStoreMiddleware(store), middlewares.authorization(store)], commentRouter);
v1.use('/documents', [dataStoreMiddleware(store), middlewares.authorization(store)], documentRouter);

const app = express();

app.use(cors());
app.use('/api/v1', v1);
app.get('/healthz', (req, res) => res.send('Ok'));

exports.apiV1 = functions.https.onRequest(app);


/**
 * Loads environment variables based on the current NODE_ENV value.
 *
 * - If NODE_ENV is 'DEVELOPMENT', it loads '.env-dev' file.
 * - Otherwise, it loads '.env'.
 *
 * @function
 * @returns {void}
 */
function loadEnv() {
  // Check if the current environment is set to development
  const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'DEVELOPMENT';
  // Load environment variables from the appropriate .env file
  if (isDev) require('dotenv').config({path: require('path').resolve(__dirname, '.env-dev')});
  else require('dotenv').config({path: require('path').resolve(__dirname, '.env')});
}
