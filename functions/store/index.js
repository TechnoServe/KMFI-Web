const {docToObject} = require('../utils');
const {COLLECTIONS, PC_ROLES, USER_TYPES, SAT_SCORES} = require('../constants');
const {firestore} = require('firebase-admin');
const {v4: uuidv4} = require('uuid');
const {CommentStore} = require('./comment.store');
const {DocumentStore} = require('./document.store');
const _ = require('lodash');
const {isCompanyMember, isMFIAdmin} = require('../guards');
const {getFirebaseAdmin} = require('../index.admin');


/* eslint-disable no-async-promise-executor*/

/**
 * Abstracts all calls to the underlaying datastore
 * @param {FirebaseFirestore.Firestore} db
 * @param {import('firebase-admin').auth.Auth} auth
 * @return {*}
 */
module.exports = (db, auth) => {
  const store = {
    /* All database operations relating to comments */
    comments: new CommentStore(db, auth),
    documents: new DocumentStore(db, auth),

    getUserByEmail: async (email) => {
      try {
        const user = await db
          .collection(COLLECTIONS.USERS)
          .where('email', '==', email)
          .limit(1)
          .get();

        if (user.empty) return null;

        return docToObject(user.docs[0]);
      } catch (e) {
        console.error('Fetch user by email', e);
        return null;
      }
    },
    sendInvite: async (email) => {
      try {
        // Check if the user already exists
        // const userSnapshot = await usersCollection.where('email', '==', email).get();
        const user = await db
          .collection(COLLECTIONS.USERS)
          .where('email', '==', email)
          .limit(1)
          .get();
        if (!user.empty) {
          // User already exists
          return 'User already exists in the system';
        }

        // Check if an invitation has already been sent
        // const invitationSnapshot = await invitationsCollection.where('email', '==', email).get();

        // if (!invitationSnapshot.empty) {
        //   // Invitation already sent
        //   return 'Invite already sent to this email';
        // }

        return 'Invitation sent successfully';
      } catch (error) {
        console.error('Error sending invite:', error.message);
        return 'Error sending invite';
      }
    },
    getUserByUid: (uid) =>
      new Promise((resolve, reject) => {
        db.collection(COLLECTIONS.USERS)
          .doc(uid)
          .get()
          .then((user) => {
            if (!user.exists) return resolve(null);
            resolve(docToObject(user));
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }),

    listUsersByUid: (userIds) =>
      new Promise((resolve, reject) => {
        const userRefs = userIds.map((id) => db.collection(COLLECTIONS.USERS).doc(id));
        if (userRefs.length === 0) return resolve([]);
        db.getAll(...userRefs)
          .then((users) => {
            resolve(users.filter((doc) => doc.exists).map((user) => docToObject(user)));
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }),

    listCompaniesByUid: (companyIds) =>
      new Promise((resolve, reject) => {
        const companyRefs = companyIds.map((id) =>
          db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(id)
        );
        if (companyRefs.length === 0) return resolve([]);
        db.getAll(...companyRefs)
          .then((companies) => {
            resolve(companies.map((company) => docToObject(company)));
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }),

    getUserByAuthId: (authId) =>
      new Promise((resolve, reject) => {
        db.collection(COLLECTIONS.USERS)
          .where('auth_provider_id', '==', authId)
          .get()
          .then((user) => {
            if (user.empty) resolve(null);
            else resolve(docToObject(user.docs[0]));
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }),

    getCompanyRoleByName: async (name) => {
      try {
        const roleCollection = await db
          .collection(COLLECTIONS.COMPANY_ROLES)
          .where('value', '==', name)
          .limit(1)
          .get();

        if (roleCollection.empty) return null;

        return docToObject(roleCollection.docs[0]);
      } catch (error) {
        console.error('get role by name', error);
        return null;
      }
    },

    getUserTypeByName: async (name) => {
      try {
        const userTypeCollection = await db
          .collection(COLLECTIONS.USER_TYPES)
          .where('value', '==', name)
          .limit(1)
          .select('id')
          .get();

        if (userTypeCollection.empty) return null;

        return docToObject(userTypeCollection.docs[0]);
      } catch (error) {
        console.error('get user type by name', error);
        return null;
      }
    },

    getUserTypeById: async (id) => {
      try {
        const doc = await db.collection(COLLECTIONS.USER_TYPES).doc(id).get();

        if (!doc.exists) return null;

        return docToObject(doc);
      } catch (error) {
        console.error('get user type by id', error);
        return null;
      }
    },

    createUser: async (data) => {
      const user = await db
        .collection(COLLECTIONS.USERS)
        .add({
          ...data,
          created_at: firestore.FieldValue.serverTimestamp(),
          updated_at: firestore.FieldValue.serverTimestamp(),
        })
        .then((ref) => ref.get());

      return docToObject(user);
    },

    createCompanyUser: async (data) => {
      const companyUser = await db
        .collection(COLLECTIONS.COMPANY_USERS)
        .add({
          ...data,
          created_at: firestore.FieldValue.serverTimestamp(),
          updated_at: firestore.FieldValue.serverTimestamp(),
        })
        .then((ref) => ref.get());

      return docToObject(companyUser.data());
    },

    addCompanyBrands: async (companyId, brands = []) => {
      try {
        const batch = db.batch();

        brands.forEach((brand) => {
          const brandRef = db.collection(COLLECTIONS.COMPANY_BRANDS).doc();
          batch.create(brandRef, {
            ...brand,
            company_id: companyId,
            created_at: firestore.FieldValue.serverTimestamp(),
            updated_at: firestore.FieldValue.serverTimestamp(),
            active: true,
          });
        });

        await batch.commit();

        return true;
      } catch (err) {
        console.error('add company brands', err);
        return false;
      }
    },
    makeAllCompanyBrandsActive: async () => {
      try {
        const brands = await db.collection(COLLECTIONS.COMPANY_BRANDS).get();
        if (brands.empty) return false;

        const batch = db.batch();
        brands.forEach((brand) => {
          batch.update(brand.ref, {active: true});
        });

        await batch.commit();
        return true;
      } catch (err) {
        console.error('make all brands active', err);
        return false;
      }
    },
    makeAllCompaniesLarge: async () => {
      try {
        const companies = await db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).get();
        if (companies.empty) return false;

        const batch = db.batch();
        companies.forEach((company) => {
          batch.update(company.ref, { size_category: 'LARGE' });
        });

        await batch.commit();
        return true;
      } catch (err) {
        console.error('make all companies large', err);
        return false;
      }
    },
    makeAllCommentsTier1: async () => {
      try {
        const comments = await db.collection(COLLECTIONS.COMMENTS).get();
        if (comments.empty) return false;

        const batch = db.batch();
        comments.forEach((comment) => {
          batch.update(comment.ref, {tier: 'TIER_1'});
        });

        await batch.commit();
        return true;
      } catch (err) {
        console.error('make all comments tier 1', err);
        return false;
      }
    },
    makeAllDocumentsTier1: async () => {
      try {
        const documents = await db.collection(COLLECTIONS.DOCUMENTS).get();
        if (documents.empty) return false;

        const batch = db.batch();
        documents.forEach((document) => {
          batch.update(document.ref, {tier: 'TIER_1'});
        });

        await batch.commit();
        return true;
      } catch (err) {
        console.error('make all documents tier 1', err);
        return false;
      }
    },
    updateCompanyBrand: async (companyId, brands = []) => {
      const batch = db.batch();

      brands.forEach((brand) => {
        const ref = db.collection(COLLECTIONS.COMPANY_BRANDS).doc(brand.id);

        const docIsOk = (async () => {
          const doc = await ref.get();
          if (!doc.exists) return false;
          return doc.data().company_id == companyId;
        })();

        delete brand['id']; // Remove brand ID from the data before updating
        if (docIsOk) {
          batch.update(ref, {
            ...brand,
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      await batch.commit();
    },

    deleteCompanyBrands: async (companyId, brandsIds = []) => {
      const batch = db.batch();

      brandsIds.forEach((id) => {
        const ref = db.collection(COLLECTIONS.COMPANY_BRANDS).doc(id);

        const docIsOk = (async () => {
          const doc = await ref.get();
          if (!doc.exists) return false;
          return doc.data().company_id == companyId;
        })();

        if (docIsOk) batch.delete(ref);
      });

      await batch.commit();
    },
    updateSATQestions: async (questions = []) => {
      const batch = db.batch();

      questions.forEach((question) => {
        const ref = db.collection(COLLECTIONS.QUESTIONS).doc(question.id);

        delete question['id']; // Remove question ID from the data before updating
        batch.update(ref, {
          ...question
        });
      });

      await batch.commit();
    },

    updateSATQuestionCategory: async (id, data) => {
      try {
        let questionCategory = await db.collection(COLLECTIONS.QUESTION_CATEGORIES).doc(id).get();
        if (!questionCategory.exists) return false;
        await questionCategory.ref.update(data);
        questionCategory = await questionCategory.ref.get(); // Get updated data

        return docToObject(questionCategory);
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    addSATQestions: async (data) => {
      try {
        await db.collection(COLLECTIONS.QUESTIONS).add(data);

        return true;
      } catch (err) {
        console.error('add new question', err);
        return false;
      }
    },
    deleteSATQestions: async (id) => {
      try {
        await db.collection(COLLECTIONS.QUESTIONS).doc(id).delete();

        return true;
      } catch (err) {
        console.error('add new question', err);
        return false;
      }
    },
    createCompanyAndUser: (user, company) =>
      new Promise((resolve, reject) => {
        const companyDoc = db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc();
        const userDoc = db.collection(COLLECTIONS.USERS).doc();

        // Get IDs user role and user type.
        Promise.all([
          // Get PC user type ID
          db
            .collection(COLLECTIONS.USER_TYPES)
            .where('value', '==', USER_TYPES.PARTICIPATING_COMPANY)
            .limit(1)
            .select('id')
            .get(),

          // Get Company admin role ID
          db
            .collection(COLLECTIONS.COMPANY_ROLES)
            .where('value', '==', PC_ROLES.ADMIN)
            .limit(1)
            .select('id')
            .get(),
        ]).then(([userTypeIds, companyRoleIds]) => {
          // None of the returned data should be empty
          if (userTypeIds.empty || companyRoleIds.empty) {
            const msg = 'Some parameters are empty.';
            console.error(
              msg,
              `userTypeIds: ${userTypeIds.empty}`,
              `companyRoleIds: ${companyRoleIds.empty}`
            );
            return reject(new Error(msg));
          }

          user = {
            ...user,
            user_type_id: userTypeIds.docs[0].id,
            created_at: firestore.FieldValue.serverTimestamp(),
            updated_at: firestore.FieldValue.serverTimestamp(),
          };

          company = {
            ...company,
            ac: false,
            created_at: firestore.FieldValue.serverTimestamp(),
            updated_at: firestore.FieldValue.serverTimestamp(),
            active: true,
          };

          const batch = db.batch();

          // Create company and user
          batch.set(companyDoc, company);
          batch.set(userDoc, user);

          // Create company user
          batch
            .commit()
            .then(() => {
              db.collection(COLLECTIONS.COMPANY_USERS)
                .add({
                  user_id: userDoc.id,
                  company_id: companyDoc.id,
                  company_role_id: companyRoleIds.docs[0].id,
                  created_at: firestore.FieldValue.serverTimestamp(),
                  updated_at: firestore.FieldValue.serverTimestamp(),
                })
                .then((ref) => {
                  ref
                    .get()
                    .then((doc) => resolve(docToObject(doc)))
                    .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
            })
            .catch((err) => reject(err));
        });
      }),

    getProductTypes: () =>
      new Promise((resolve, reject) => {
        db.collection(COLLECTIONS.FOOD_VEHICLES)
          .get()
          .then((res) => {
            const data = [];
            res.forEach((doc) => data.push(docToObject(doc)));
            resolve(data);
          })
          .catch((err) => reject(err));
      }),

    getCompanySizes: () =>
      new Promise((resolve, reject) => {
        db.collection(COLLECTIONS.COMPANY_SIZES)
          .orderBy('order', 'asc')
          .get()
          .then((res) => {
            const data = [];
            res.forEach((doc) => data.push(docToObject(doc)));
            resolve(data);
          })
          .catch((err) => reject(err));
      }),

    saveActivityLog: async (activity = {}) => {
      activity['created_at'] = firestore.FieldValue.serverTimestamp();
      await db.collection(COLLECTIONS.ACTIVITY_LOGS).add(activity);
    },

    /**
     * getCompanyActivityLogs
     * @param {String} companyId
     * @param {Number|String} page
     * @param {Number|String} perPage
     * @return Promise<Object[]>
     */
    getCompanyActivityLogs: async (companyId, page, perPage) => {
      const limit = +perPage && +perPage > 0 && +perPage <= 100 ? +perPage : 20;
      const skip = +page ? (+page - 1) * limit : 0;
      const logs = await db
        .collection(COLLECTIONS.ACTIVITY_LOGS)
        .where('company_id', '==', companyId)
        .limit(limit)
        .offset(skip)
        .get();
      if (logs.empty) return [];
      const data = [];
      logs.forEach((log) => data.push(docToObject(log)));
      return data;
    },
    /**
     * getCompanyActivityLogs
     * @param {String} uid
     * @param {Number|String} page
     * @param {Number|String} perPage
     * @return Promise<Object[]>
     */
    getUserActivityLogs: async (uid, page, perPage) => {
      const limit = +perPage && +perPage > 0 && +perPage <= 100 ? +perPage : 20;
      const skip = +page ? (+page - 1) * limit : 0;
      const logs = await db
        .collection(COLLECTIONS.ACTIVITY_LOGS)
        .where('user_id', '==', uid)
        .limit(limit)
        .offset(skip)
        .get();
      if (logs.empty) return [];
      const data = [];
      logs.forEach((log) => data.push(docToObject(log)));
      return data;
    },

    getQuestionCategoryById: async (id) => {
      try {
        const data = await db.collection(COLLECTIONS.QUESTION_CATEGORIES).doc(id).get();

        if (!data.exists) return null;
        return docToObject(data);
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getProductTypeById: async (id) => {
      try {
        const data = await db.collection(COLLECTIONS.FOOD_VEHICLES).doc(id).get();

        if (!data.exists) return null;
        return docToObject(data);
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getTierById: async (id) => {
      try {
        const data = await db.collection(COLLECTIONS.QUESTION_TIERS).doc(id).get();

        if (!data.exists) return null;
        return docToObject(data);
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getAssessmentAnswers: (collection) => async (companyId, categoryIds = [], cycleId = null, showUnapproved = false, showUnpublished = false) => {
      try {
        let query = db.collection(collection).where('company_id', '==', companyId);

        if (categoryIds.length) query = query.where('category_id', 'in', categoryIds);
        // if (cycleId) query = query.where('cycle_id', '==', cycleId);

        if (collection === COLLECTIONS.SA_ANSWERS) {
          // if (!showUnapproved) query = query.where('approved', '==', true);
          query = query.where('cycle_id', 'in', [cycleId, '']);
        }
        if (collection === COLLECTIONS.IVC_ANSWERS) {
          query = query.where('cycle_id', 'in', [cycleId, '']);
          if (!showUnpublished) query = query.where('published', '==', true);
        }
        query = query.orderBy('updated_at');

        const data = await query.get();

        if (data.empty) return [];

        return data.docs.map((doc) => docToObject(doc));
      } catch (err) {
        console.error('store get SAT answers', err);
        return [];
      }
    },
    getPreviousAssessmentAnswers: (collection) => async (companyId, categoryIds = [], showUnapproved = false) => {
      try {
        let query = db.collection(collection).where('company_id', '==', companyId);
        let previousCycle = await db.collection(COLLECTIONS.SA_CYCLES).where('previous', '==', true).get();
        if (previousCycle.empty) return [];

        previousCycle = docToObject(previousCycle.docs[0]);
        // console.log("previousCycle", previousCycle);
        query = query.where('cycle_id', '==', previousCycle.id);

        if (categoryIds.length) query = query.where('category_id', 'in', categoryIds);
        if (collection === COLLECTIONS.SA_ANSWERS) {
          if (!showUnapproved) query = query.where('approved', '==', true);
        }
        query = query.orderBy('updated_at');

        const data = await query.get();

        if (data.empty) return [];

        return data.docs.map((doc) => docToObject(doc));
      } catch (err) {
        console.error('store get SAT answers', err);
        return [];
      }
    },

    getSatScores: async (companyId, cycleId) => {
      let query = db
        .collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES)
        .where('company_id', '==', companyId);
      query = query.where('cycle_id', '==', cycleId);

      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },

    getComputedScores: async (companyId, cycleId) => {
      let query = db
        .collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES)
        .where('company_id', '==', companyId);
      query = query.where('cycle_id', '==', cycleId);

      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },
    getComputedIEGScore: async (companyId, cycleId) => {
      let query = db
        .collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES)
        .where('company_id', '==', companyId);
      query = query.where('cycle_id', '==', cycleId);
      query = query.where('score_type', '==', "IEG");

      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },
    getComputedIVCScore: async (companyId, cycleId) => {
      let query = db
        .collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES)
        .where('company_id', '==', companyId);
      query = query.where('cycle_id', '==', cycleId);
      query = query.where('score_type', '==', "IVC");

      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },

    setAssessmentScore: async (companyId, cycleId, type, value) => {
      let query = db
        .collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES)
        .where('company_id', '==', companyId);
      // query = query.where('cycle_id', '==', cycleId);
      query = query.where('cycle_id', '==', cycleId);
      query = query.where('score_type', '==', type);

      const querySnapshot = await query.get();

      if (querySnapshot.empty) {
        await db.collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES).add({
          company_id: companyId,
          score_type: type,
          cycle_id: cycleId,
          value,
          created_at: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        const doc = querySnapshot.docs[0];

        await doc.ref.update({
          ...doc.data(),
          value,
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
      }
    },

    getQuestionCategories: async (parentIds = [], rootOnly = false) => {
      try {
        const data = [];
        let query = db.collection(COLLECTIONS.QUESTION_CATEGORIES).orderBy('sort_order', 'asc');

        if (!rootOnly && parentIds && parentIds.length) {
          query = query.where('parent_id', 'in', parentIds);
        }

        const categories = await query.get();

        if (!categories.empty) categories.forEach((category) => data.push(docToObject(category)));

        return rootOnly
          ? data.filter((cat) => !cat.parent_id || (cat.parent_id && !cat.parent_id.length))
          : data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getModalCategories: async () => {
      try {
        const data = [];
        let query = db.collection(COLLECTIONS.QUESTION_CATEGORIES).where('parent_id', '==', '');
        query = query.orderBy('sort_order', 'asc');

        const categories = await query.get();

        if (!categories.empty) categories.forEach((category) => data.push(docToObject(category)));

        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getAdminUserByUserId: async (userId) => {
      try {
        let adminUser = await db
          .collection(COLLECTIONS.ADMIN_USERS)
          .where('user_id', '==', userId)
          .get();

        if (adminUser.empty) return null;
        adminUser = docToObject(adminUser.docs[0]);

        let role = await db
          .collection(COLLECTIONS.ADMIN_ROLES)
          .where('__name__', '==', adminUser.admin_role_id)
          .get();

        if (role.empty) return adminUser;
        role = docToObject(role.docs[0]);

        adminUser.role = role;
        return adminUser;
      } catch (err) {
        console.error('store.getAdminUserByUserId', err);
        return null;
      }
    },

    getCompanyUserByUserId: async (userId) => {
      try {
        let companyUser = await db
          .collection(COLLECTIONS.COMPANY_USERS)
          .where('user_id', '==', userId)
          .get();

        if (companyUser.empty) return null;
        companyUser = docToObject(companyUser.docs[0]);

        let role = await db
          .collection(COLLECTIONS.COMPANY_ROLES)
          .where(firestore.FieldPath.documentId(), '==', companyUser.company_role_id)
          .get();

        if (role.empty) return companyUser;
        role = docToObject(role.docs[0]);

        companyUser.role = role;
        return companyUser;
      } catch (err) {
        console.error('store.getCompanyUserByUserId', err);
        return null;
      }
    },

    getCompanyDataUserByUserId: async (userId, data = null) => {
      try {
        const tdr = data;
        tdr.user_id = userId;

        let companyUser = await db
          .collection(COLLECTIONS.COMPANY_USERS)
          .where('user_id', '==', userId)
          .get();
        if (companyUser.empty) return tdr;
        companyUser = docToObject(companyUser.docs[0]);

        let role = await db
          .collection(COLLECTIONS.COMPANY_ROLES)
          .where(firestore.FieldPath.documentId(), '==', companyUser.company_role_id)
          .get();
        if (role.empty) return companyUser;
        role = docToObject(role.docs[0]);
        companyUser.role = role;

        if (data) {
          let company = await db
            .collection(COLLECTIONS.PARTICIPATING_COMPANIES)
            .where(firestore.FieldPath.documentId(), '==', companyUser.company_id)
            .get();

          if (!company.empty) {
            company = docToObject(company.docs[0]);
          }

          companyUser.company_name = company.company_name;
          companyUser.email = data.email;
          companyUser.full_name = data.full_name;
          companyUser.auth_provider_id = data.auth_provider_id;
        }

        return companyUser;
      } catch (err) {
        console.error('store.getCompanyUserByUserId', err);
        return null;
      }
    },

    getQuestions: async (categoryIds = []) => {
      try {
        const data = [];
        let query = db.collection(COLLECTIONS.QUESTIONS).orderBy('sort_order', 'asc');
        if (categoryIds.length) query = query.where('category_id', 'in', categoryIds);
        const categories = await query.get();

        if (!categories.empty) categories.forEach((category) => data.push(docToObject(category)));

        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    getProductMicroNutrients: async (productTypeId, microNutrientId = null) =>
      await new Promise(async (resolve, reject) => {
        try {
          let query = db
            .collection(COLLECTIONS.PRODUCT_MICRO_NUTRIENTS)
            .where('product_type_id', '==', productTypeId);

          if (microNutrientId) query = query.where('__name__', '==', microNutrientId);

          query = await query.select('micro_nutrient_id').get();

          const refs = query.docs.map((doc) =>
            db.collection(COLLECTIONS.MICRO_NUTRIENTS).doc(doc.data().micro_nutrient_id)
          );
          if (refs.length === 0) return resolve([]);
          const microNutrients = await db.getAll(...refs);

          const data = microNutrients.map((microNutrient) => docToObject(microNutrient));

          resolve(data.length > 1 ? data : data[0]);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }),
    getProductMicroNutrient: async (productTypeId) => {
      const query = db
        .collection(COLLECTIONS.PRODUCT_MICRO_NUTRIENTS)
        .where('product_type_id', '==', productTypeId);
      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },

    getActiveSATCycle: async (id = null) => {
      const cycleCollection = db.collection(COLLECTIONS.SA_CYCLES);
      let cycle;
      if (id) {
        cycle = cycleCollection.where('__name__', '==', id);
      } else {
        //  cycle = cycleCollection.where('active', '==', true).where('end_date', '>=', firestore.Timestamp.fromDate(new Date()));
        cycle = cycleCollection.where('active', '==', true);
      }

      cycle = await cycle.get();

      if (cycle.empty) return null;

      return docToObject(cycle.docs[0]);
    },
    getCycles: async () => {
      try {
        const data = [];
        const query = db.collection(COLLECTIONS.SA_CYCLES).orderBy('start_date', 'asc');
        const cycles = await query.get();
        // console.log(cycles);
        if (!cycles.empty) cycles.forEach((cycle) => data.push(docToObject(cycle)));

        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    updateOrCreateAssessmentAnswersOld: (collection, that) => async (
      userId,
      companyId,
      categoryId,
      tier,
      response,
      points,
    ) => {
      try {
        // Check if an answer exists.
        const {id: cycleId} = await that.getActiveSATCycle();
        let query = db.collection(collection).where('category_id', '==', categoryId);
        query = query.where('company_id', '==', companyId);
        query = query.where('cycle_id', '==', cycleId);
        query = query.where('tier', '==', tier);

        const approved = collection === COLLECTIONS.SA_ANSWERS ? {approved: true} : {published: false};

        const existingAnswer = await query.get();

        // If answer already exists for the specific question, update it.
        if (!existingAnswer.empty) {
          const doc = existingAnswer.docs[0];

          await doc.ref.update({
            ...doc.data(),
            value: response,
            points,
            ...approved,
            submitted_by: userId,
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
        } else {
          // Create a new answer.
          await db.collection(collection).add({
            submitted_by: userId,
            category_id: categoryId,
            company_id: companyId,
            tier,
            value: response,
            points,
            ...approved,
            cycle_id: cycleId,
            created_at: firestore.FieldValue.serverTimestamp(),
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
        }

        return true;
      } catch (err) {
        console.error('Failed to store SAT response', err);
        return false;
      }
    },
    updateOrCreateAssessmentAnswers: (collection, that) => async (
      userId,
      companyId,
      categoryId,
      tier,
      response,
      points,
    ) => {
      try {
        // Check if an answer exists.
        const {id: cycleId} = await that.getActiveSATCycle();
        // const comapnyTier = await db.collection(COLLECTIONS.COMPANY_TIERS).where('company_id', '==', companyId).get();
        // const companyTierObj = docToObject(comapnyTier.docs[0]);
        // const cTier = companyTierObj.tier;

        let query = db.collection(collection).where('category_id', '==', categoryId);
        query = query.where('company_id', '==', companyId);
        query = query.where('cycle_id', '==', cycleId);
        query = query.where('tier', '==', tier);
        const approved = collection === COLLECTIONS.SA_ANSWERS ? {approved: true} : {published: false};
        let previousPoints = 0;


        if (tier == 'TIER_1') {
          // check tier 2 and tier 3
          let tierTwoQuery = db.collection(collection).where('category_id', '==', categoryId);
          tierTwoQuery = tierTwoQuery.where('company_id', '==', companyId);
          tierTwoQuery = tierTwoQuery.where('cycle_id', '==', cycleId);
          tierTwoQuery = tierTwoQuery.where('tier', '==', 'TIER_2');
          const tierTwoAnswerExists = await tierTwoQuery.get();
          let tierTwoPoints = 0;
          if (!tierTwoAnswerExists.empty) {
            const tierTwoDoc = tierTwoAnswerExists.docs[0];
            const tierTwoDocObj = docToObject(tierTwoDoc);
            // tierTwoPoints = tierTwoDocObj.points + points;
            tierTwoPoints = SAT_SCORES[tierTwoDocObj.tier][tierTwoDocObj.value] + points;
            await tierTwoDoc.ref.update({
              ...tierTwoDoc.data(),
              points: tierTwoPoints,
              submitted_by: userId,
              updated_at: firestore.FieldValue.serverTimestamp(),
            });
          }
          let tierThreeQuery = db.collection(collection).where('category_id', '==', categoryId);
          tierThreeQuery = tierThreeQuery.where('company_id', '==', companyId);
          tierThreeQuery = tierThreeQuery.where('cycle_id', '==', cycleId);
          tierThreeQuery = tierThreeQuery.where('tier', '==', 'TIER_3');
          const tierThreeAnswerExists = await tierThreeQuery.get();
          let tierThreePoints = 0;
          if (!tierThreeAnswerExists.empty) {
            const tierThreeDoc = tierThreeAnswerExists.docs[0];
            const tierThreeDocObj = docToObject(tierThreeDoc);
            // tierThreePoints = tierThreeDocObj.points + tierTwoPoints;
            tierThreePoints = SAT_SCORES[tierThreeDocObj.tier][tierThreeDocObj.value] + tierTwoPoints;
            await tierThreeDoc.ref.update({
              ...tierThreeDoc.data(),
              points: tierThreePoints,
              submitted_by: userId,
              updated_at: firestore.FieldValue.serverTimestamp(),
            });
          }
        } else if (tier == 'TIER_2') {
          let tierOneQuery = db.collection(collection).where('category_id', '==', categoryId);
          tierOneQuery = tierOneQuery.where('company_id', '==', companyId);
          tierOneQuery = tierOneQuery.where('cycle_id', '==', cycleId);
          tierOneQuery = tierOneQuery.where('tier', '==', 'TIER_1');
          const tierOneAnswer = await tierOneQuery.get();
          if (!tierOneAnswer.empty) {
            const doc = docToObject(tierOneAnswer.docs[0]);
            previousPoints += doc.points;
          }

          let tierThreeQuery = db.collection(collection).where('category_id', '==', categoryId);
          tierThreeQuery = tierThreeQuery.where('company_id', '==', companyId);
          tierThreeQuery = tierThreeQuery.where('cycle_id', '==', cycleId);
          tierThreeQuery = tierThreeQuery.where('tier', '==', 'TIER_3');
          const tierThreeAnswerExists = await tierThreeQuery.get();
          let tierThreePoints = 0;
          if (!tierThreeAnswerExists.empty) {
            const tierThreeDoc = tierThreeAnswerExists.docs[0];
            const tierThreeDocObj = docToObject(tierThreeDoc);
            // tierThreePoints = tierThreeDocObj.points + points + previousPoints;
            tierThreePoints = SAT_SCORES[tierThreeDocObj.tier][tierThreeDocObj.value] + points + previousPoints;
            await tierThreeDoc.ref.update({
              ...tierThreeDoc.data(),
              points: tierThreePoints,
              submitted_by: userId,
              updated_at: firestore.FieldValue.serverTimestamp(),
            });
          }
        } else if (tier == 'TIER_3') {
          let tierTwoQuery = db.collection(collection).where('category_id', '==', categoryId);
          tierTwoQuery = tierTwoQuery.where('company_id', '==', companyId);
          tierTwoQuery = tierTwoQuery.where('cycle_id', '==', cycleId);
          tierTwoQuery = tierTwoQuery.where('tier', '==', 'TIER_2');
          const tierTwoAnswer = await tierTwoQuery.get();
          if (!tierTwoAnswer.empty) {
            const doc = docToObject(tierTwoAnswer.docs[0]);
            previousPoints = doc.points;
          }
        }

        const existingAnswer = await query.get();

        // If answer already exists for the specific question, update it.
        if (!existingAnswer.empty) {
          const doc = existingAnswer.docs[0];

          await doc.ref.update({
            ...doc.data(),
            value: response,
            points: points + previousPoints,
            ...approved,
            submitted_by: userId,
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
        } else {
          // Create a new answer.
          await db.collection(collection).add({
            submitted_by: userId,
            category_id: categoryId,
            company_id: companyId,
            tier,
            value: response,
            points: points + previousPoints,
            ...approved,
            cycle_id: cycleId,
            created_at: firestore.FieldValue.serverTimestamp(),
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
        }


        return true;
      } catch (err) {
        console.error('Failed to store SAT response', err);
        return false;
      }
    },

    getCompanyById: async (id) => {
      try {
        const company = await db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(id).get();
        if (!company.exists) return null;
        return docToObject(company);
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    getBrandById: async (id) => {
      try {
        const brand = await db.collection(COLLECTIONS.COMPANY_BRANDS).doc(id).get();
        if (!brand.exists) return null;
        return docToObject(brand);
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    updateCompany: async (id, data) => {
      try {
        let company = await db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(id).get();
        if (!company.exists) return false;
        await company.ref.update(data);
        company = await company.ref.get(); // Get updated data

        return docToObject(company);
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    assignRole: async (userId, roleId) => {
      try {
        const user = await db.collection(COLLECTIONS.ADMIN_USERS).where('user_id', '==', userId).get();

        if (user.empty) return false;

        const adminUser = await db.collection(COLLECTIONS.ADMIN_USERS).doc(user.docs[0].id).get();

        await adminUser.ref.update({admin_role_id: roleId});
        return true;
      } catch (err) {
        console.error(err);
      }
    },

    lockSat: async (cycleId, date) => {
      try {
        const cycle = await db.collection(COLLECTIONS.SA_CYCLES).doc(cycleId).get();
        if (!cycle.exists) return false;
        await cycle.ref.update({sat_lock_date: firestore.Timestamp.fromDate(new Date(date))});
      } catch (err) {
        console.error(err);
      }
    },

    updateUserById: async (user, data) => {
      try {
        let documentSnapshot = await db.collection(COLLECTIONS.USERS).doc(user.id).get();
        if (!documentSnapshot.exists) return false;
        await documentSnapshot.ref.update(data);
        documentSnapshot = await documentSnapshot.ref.get();
        const updatedUser = docToObject(documentSnapshot);
        await auth.updateUser(updatedUser.auth_provider_id, {email: user.email, displayName: user.full_name});
        return updatedUser;
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    setCompanyTier: async (companyId, tier) => {
      try {
        const ref = db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(companyId);

        if (!(await ref.get()).exists) return false;
        await ref.update({tier});

        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    softDeleteCompanyUser: async (companyId, userIds) => {
      try {
        const snapshot = await db
          .collection(COLLECTIONS.COMPANY_USERS)
          .where('company_id', '==', companyId)
          .where(firestore.FieldPath.documentId(), 'in', userIds)
          .get();

        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.forEach((doc) =>
            batch.set(doc.ref, {deleted_at: firestore.FieldValue.serverTimestamp()})
          );
          await batch.commit();
        }

        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    createIEGScores: async (scores) => {
      try {
        const upsertCurry = upsertAssessmentScore(db);
        const batchSores = scores.map(upsertCurry);

        await Promise.all(batchSores);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    createSATScores: async (scores, type, companyId, cycleId) => {
      try {
        const upsertCurry = upsertSATAssessmentScore(db, type, companyId, cycleId);
        const batchSores = scores.map(upsertCurry);

        await Promise.all(batchSores);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },

    // Auth methods
    getAuthUserByEmail: async (email) => {
      try {
        const documentSnapshot = await db
          .collection(COLLECTIONS.USERS)
          .where('email', '==', email)
          .get();
        if (documentSnapshot.empty) return false;

        return docToObject(documentSnapshot.docs[0]);
      } catch (err) {
        const message = 'Failed to find auth user by email.';
        console.error(message, err);

        return null;
      }
    },

    getCompanyBrands: async (companyId) => {
      const query = db.collection(COLLECTIONS.COMPANY_BRANDS).where('company_id', '==', companyId).where('active', '==', true);
      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },
    getCompanyBrandsAdmin: async (companyId) => {
      const query = db.collection(COLLECTIONS.COMPANY_BRANDS).where('company_id', '==', companyId);
      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map((doc) => docToObject(doc));
    },

    createAuthUser: async (email, properties = {displayName: undefined}) => {
      const user = await auth.createUser({email, displayName: properties.displayName});
      return user.toJSON();
    },

    getCompanies: async (before, after, size = 15, ids = []) => {
      const query = db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).where('active', '==', true).orderBy('company_name');

      if (ids.length) {
        query.where(firestore.FieldPath.documentId(), 'in', ids);
      }

      const snapshot = await paginateQuery({
        query,
        before,
        after,
        size,
        collection: COLLECTIONS.PARTICIPATING_COMPANIES,
      });

      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => docToObject(doc));
    },
    getCompaniesAdmin: async (before, after, size = 15, ids = []) => {
      const query = db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).orderBy('company_name');

      if (ids.length) {
        query.where(firestore.FieldPath.documentId(), 'in', ids);
      }

      const snapshot = await paginateQuery({
        query,
        before,
        after,
        size,
        collection: COLLECTIONS.PARTICIPATING_COMPANIES,
      });

      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => docToObject(doc));
    },

    getIvcCompanies: async (userId) => {
      const query = db.collection(COLLECTIONS.ALLOTATIONS).where('user_id', '==', userId);
      const snapshot = await query.get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(async (doc) => await this.getCompanyById(doc.company_id));
    },

    approveSAT: async (companyId, cycleId, userId) => {
      const batch = db.batch();

      const query = db
        .collection(COLLECTIONS.SA_ANSWERS)
        .where('company_id', '==', companyId)
        .where('cycle_id', '==', cycleId)
        .where('approved', '==', false);
      const data = await query.get();

      if (data.empty) throw new Error('No record to approve.');

      data.forEach((doc) => {
        batch.update(doc.ref, {
          approved: true,
          approved_by: userId,
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    },
    publishIVC: async (companyId, cycleId, userId) => {
      const batch = db.batch();

      const query = db
        .collection(COLLECTIONS.IVC_ANSWERS)
        .where('company_id', '==', companyId)
        .where('cycle_id', '==', cycleId)
        .where('published', '==', false);
      const data = await query.get();

      if (data.empty) throw new Error('No record to publish.');

      data.forEach((doc) => {
        batch.update(doc.ref, {
          published: true,
          published_by: userId,
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    },
    unpublishIVC: async (companyId, cycleId, userId) => {
      const batch = db.batch();

      const query = db
        .collection(COLLECTIONS.IVC_ANSWERS)
        .where('company_id', '==', companyId)
        .where('cycle_id', '==', cycleId);
      // .where('published', '==', true);
      const data = await query.get();

      if (data.empty) throw new Error('No record to unpublish.');

      data.forEach((doc) => {
        batch.update(doc.ref, {
          published: false,
          published_by: userId,
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    },

    assignCompanyToUser: async (companyId, userId, cycleId) => {
      const user = await store.getAdminUserByUserId(userId);

      if (!user) throw new Error('User does not exist.');

      const allotations = await db.collection(COLLECTIONS.ALLOTATIONS).where('user_id', '==', userId).select('company_id').get();

      if (!allotations.empty) {
        const companyIds = allotations.docs.map((doc) => doc.data().company_id);

        if (companyIds.includes(companyId)) throw new Error('Company already assigned to user.');
      }

      const data = {company_id: companyId, user_id: userId, cycle_id: cycleId, created_at: firestore.FieldValue.serverTimestamp()};
      await db.collection(COLLECTIONS.ALLOTATIONS).add(data);
    },

    getAssessmentScores: async ({companyId, cycleId, type}) => {
      const query = db
        .collection(COLLECTIONS.ASSESSMENT_SCORES)
        .where('company_id', '==', companyId)
        .where('cycle_id', '==', cycleId)
        .where('type', '==', type);

      const data = await query.get();

      if (data.empty) return [];

      return data.docs.map(docToObject);
    },
    /**
     * Retrieves all assessment scores for all companies from Firestore,
     * filtered by cycle and optionally by type, with optional company info
     * and category name enrichment.
     * 
     * @param {string} cycle - The assessment cycle ID (required).
     * @param {string} [type] - Optional type to filter by (e.g., 'IEG', 'SAT', 'IVC').
     * @param {boolean} [includeCompany=true] - Whether to include company info.
     * @returns {Promise<Array<Object>>} Array of score records, each with `category_name` when available.
     */
    getAllAssessmentScores: async (cycle, type, includeCompany = true) => {
      // Base query by cycle (and type, if provided)
      let query = db.collection(COLLECTIONS.ASSESSMENT_SCORES).where('cycle_id', '==', cycle);
      if (type) query = query.where('type', '==', type);

      const snapshot = await query.get();
      const rows = snapshot.docs.map(docToObject);

      if (rows.length === 0) return rows;

      // --- Enrich with category_name ---------------------------------------
      const categoryIds = Array.from(new Set(rows.map((r) => r.category_id).filter(Boolean)));
      let categoriesById = {};
      if (categoryIds.length) {
        try {
          const categories = await store.getQuestionCategoriesByIds(categoryIds);
          categoriesById = (categories || []).reduce((acc, c) => {
            if (c && c.id) acc[c.id] = c;
            return acc;
          }, {});
        } catch (e) {
          console.error('getAllAssessmentScores: failed to load categories', e);
        }
      }

      // If company enrichment is not requested, just attach category_name and return
      if (!includeCompany) {
        return rows.map((r) => ({
          ...r,
          category_name: categoriesById[r.category_id]?.name || null,
        }));
      }

      // --- Enrich with company fields --------------------------------------
      const companyIds = Array.from(new Set(rows.map((r) => r.company_id).filter(Boolean)));
      let companiesById = {};
      if (companyIds.length) {
        const companies = await Promise.all(companyIds.map((id) => store.getCompanyById(id)));
        companiesById = companies.reduce((acc, c) => {
          if (c && c.id) acc[c.id] = c;
          return acc;
        }, {});
      }

      // Attach both company metadata and category_name
      return rows.map((r) => {
        const c = companiesById[r.company_id];
        return {
          ...r,
          company_name: c?.company_name || null,
          tier: c?.tier || null,
          size_category: c?.size_category || null,
          active: c?.active ?? null,
          category_name: categoriesById[r.category_id]?.name || null,
        };
      });
    },
    /**
 * Computes SAT variance per company for a cycle using the
 * ComputedAssessmentScores collection (COMPUTED_ASSESSMENT_SCORES).
 *
 * Expected fields in COMPUTED_ASSESSMENT_SCORES:
 *  - company_id (string)
 *  - cycle_id (string)
 *  - score_type ('SAT' | 'IVC' | ...)
 *  - value (number)
 *
 * Only ACTIVE companies are returned (parity with previous behavior).
 *
 * @param {string} cycleId
 * @returns {Promise<Array<Object>>} records: {
 *   company_id, company_name, tier, company_size, selfScore, validatedScore,
 *   variance, variancePct
 * }
 */
    getSATVarianceByCompany: async (cycleId) => {
      try {
        // Fetch computed SAT & IVC scores for the given cycle
        const snapshot = await db
          .collection(COLLECTIONS.COMPUTED_ASSESSMENT_SCORES)
          .where('cycle_id', '==', cycleId)
          .where('score_type', 'in', ['SAT', 'IVC'])
          .get();

        if (snapshot.empty) return [];

        const rows = snapshot.docs.map((d) => {
          const r = docToObject(d);
          return {
            company_id: r.company_id,
            score_type: String(r.score_type || '').toUpperCase(),
            value: typeof r.value === 'number' ? r.value : Number(r.value) || 0,
          };
        });

        const byCompany = _.groupBy(rows, 'company_id');

        const results = await Promise.all(
          Object.entries(byCompany).map(async ([company_id, items]) => {
            const selfScore = items
              .filter((r) => r.score_type === 'SAT')
              .reduce((s, r) => s + r.value, 0);

            const validatedScore = items
              .filter((r) => r.score_type === 'IVC')
              .reduce((s, r) => s + r.value, 0);

            // Enrich with company metadata
            const company = await store.getCompanyById(company_id);
            if (!company || company.active !== true) return null;

            const variance = Math.round(validatedScore) - Math.round(selfScore);
            const variance2 = Math.abs(Math.round(validatedScore) - Math.round(selfScore));

            return {
              company_id,
              company_name: company.company_name ?? null,
              tier: company.tier ?? null,
              company_size: company.size_category ?? null,
              selfScore,
              validatedScore,
              variance,
              variance2
            };
          })
        );

        return results.filter(Boolean);
      } catch (err) {
        console.error('getSATVarianceByCompany (computed) error:', err);
        return [];
      }
    },
    
    
  };
  

  store.getUserAssignedCompaniesIds = async (userId) => {
    let allotations = await db.collection(COLLECTIONS.ALLOTATIONS).where('user_id', '==', userId).select('company_id').get();
    if (allotations.empty) return null;

    allotations = allotations.docs.map(docToObject);

    return Promise.all(allotations.map(async (allot) => {
      const company = await store.getCompanyById(allot.company_id);
      return {name: company.company_name, company_id: allot.company_id, id: allot.id};
    }));
  };

  store.addMicroNutrientScores = async (scores = []) => {
    try {
      const calcScore = (value, expectedValue) => Math.round((value / expectedValue) * 100);


      const doAdjustedScores = (micronutrient, productType, compliance) => {
        switch (micronutrient) {
          case 'Vitamin A':
            // Special rules for Edible Oils (product type ID: AH6CGJnP5KxdmXRnV1Ez)
            // Edible Oils — Weighted Scores:
            // 100%–200% => 30
            // 80%–99%   => 25
            // 51%–79% OR up to 10% over Max (201%–220%) => 15
            // 31%–50% OR 11%–20% over Max (221%–240%)  => 10
            // Below 31% OR &gt;20% over Max (&gt;240%)  => 0
            if (productType === 'AH6CGJnP5KxdmXRnV1Ez') {
              if (compliance >= 100) return 30;
              if (compliance >= 80)  return 25;
              if (compliance >= 51)  return 15;
              if (compliance >= 31)  return 10;
              return 0;
            }
            // Default logic (e.g., Wheat/Maize Flour product types)
            return compliance >= 451
              ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                ? 0
                : 0
              : compliance >= 414
                ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                  ? 10
                  : 0
                : compliance >= 376
                  ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                    ? 15
                    : 0
                  : compliance >= 241
                    ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                      ? 30
                      : 0
                    : compliance >= 221
                      ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                        ? 30
                        : 10
                      : compliance >= 201
                        ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                          ? 30
                          : 15
                        : compliance >= 100
                          ? 30
                          : compliance >= 80
                            ? 25
                            : compliance >= 51
                              ? 15
                              : compliance >= 31
                                ? 10
                                : 0;
          case 'Vitamin B3 (Niacin)':
            return compliance >= 100
              ? 30
              : compliance >= 80
                ? 25
                : compliance >= 51
                  ? 15
                  : compliance >= 31
                    ? 10
                    : 0;
          case 'Vitamin B (Niacin)':
            return compliance >= 100
              ? 30
              : compliance >= 80
                ? 25
                : compliance >= 51
                  ? 15
                  : compliance >= 31
                    ? 10
                    : 0;
          case 'Iron':
            return compliance >= 100
              ? 30
              : compliance >= 80
                ? 25
                : compliance >= 51
                  ? 15
                  : compliance >= 31
                    ? 10
                    : 0;
          default:
            return 0;
        }
      };

      let savedScores = scores.map(async (score) => {
        const microNutrient = await store.getProductMicroNutrients(score.product_type, score.product_micro_nutrient_id);
        const pc = calcScore(score.value, microNutrient.expected_value) || 0;
        const sc = {
          ..._.omit(score, ['id', 'created_at', 'percentage_compliance', 'mfiScore']),
          percentage_compliance: pc,
          created_at: firestore.FieldValue.serverTimestamp(),
          updated_at: firestore.FieldValue.serverTimestamp(),
          mfiScore: doAdjustedScores(microNutrient.name, score.product_type, pc)
        };


        return db.collection(COLLECTIONS.MICRO_NUTRIENTS_SCORES).add(sc);
      });

      savedScores = await Promise.all(savedScores);

      const persistedScores = await Promise.all(savedScores.map((score) => score.get()));
      return persistedScores.map(docToObject);
    } catch (err) {
      console.error('add micro nutrient scores', err);
      return false;
    }
  };

  store.updateMicroNutrientScores = async (scores = []) => {
    try {
      const calcScore = (value, expectedValue) => Math.round((value / expectedValue) * 100);

      const doAdjustedScores = (micronutrient, productType, compliance) => {
        switch (micronutrient) {
          case 'Vitamin A':
            // Special rules for Edible Oils (product type ID: AH6CGJnP5KxdmXRnV1Ez)
            // Edible Oils — Weighted Scores:
            // 100%–200% => 30
            // 80%–99%   => 25
            // 51%–79% OR up to 10% over Max (201%–220%) => 15
            // 31%–50% OR 11%–20% over Max (221%–240%)  => 10
            // Below 31% OR &gt;20% over Max (&gt;240%)  => 0
            if (productType === 'AH6CGJnP5KxdmXRnV1Ez') {
              if (compliance > 240) return 0;
              if (compliance >= 221) return 10;
              if (compliance >= 201) return 15;
              if (compliance >= 100) return 30;
              if (compliance >= 80)  return 25;
              if (compliance >= 51)  return 15;
              if (compliance >= 31)  return 10;
              return 0;
            }
            // Default logic (e.g., Wheat/Maize Flour product types)
            return compliance >= 451
              ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                ? 0
                : 0
              : compliance >= 414
                ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                  ? 10
                  : 0
                : compliance >= 376
                  ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                    ? 15
                    : 0
                  : compliance >= 241
                    ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                      ? 30
                      : 0
                    : compliance >= 221
                      ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                        ? 30
                        : 10
                      : compliance >= 201
                        ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
                          ? 30
                          : 15
                        : compliance >= 100
                          ? 30
                          : compliance >= 80
                            ? 25
                            : compliance >= 51
                              ? 15
                              : compliance >= 31
                                ? 10
                                : 0;
          case 'Vitamin B3 (Niacin)':
            return compliance >= 100
              ? 30
              : compliance >= 80
                ? 25
                : compliance >= 51
                  ? 15
                  : compliance >= 31
                    ? 10
                    : 0;
          case 'Vitamin B (Niacin)':
            return compliance >= 100
              ? 30
              : compliance >= 80
                ? 25
                : compliance >= 51
                  ? 15
                  : compliance >= 31
                    ? 10
                    : 0;
          case 'Iron':
            return compliance >= 100
              ? 30
              : compliance >= 80
                ? 25
                : compliance >= 51
                  ? 15
                  : compliance >= 31
                    ? 10
                    : 0;
          default:
            return 0;
        }
      };

      let savedScores = scores.map(async (score) => {
        const microNutrient = await store.getProductMicroNutrients(score.product_type, score.product_micro_nutrient_id);
        const pc = calcScore(score.value, microNutrient.expected_value) || 0;
        const sc = {
          ..._.omit(score, ['id', 'created_at', 'percentage_compliance', 'mfiScore']),
          percentage_compliance: pc,
          updated_at: firestore.FieldValue.serverTimestamp(),
          mfiScore: doAdjustedScores(microNutrient.name, score.product_type, pc)
        };

        const query = db.collection(COLLECTIONS.MICRO_NUTRIENTS_SCORES).where('id', '==', score.id);
        const data = await query.get();

        if (data.empty) return false;

        const doc = data.docs[0];
        await doc.ref.update(sc);

        return true;
      });

      savedScores = await Promise.all(savedScores);

      return savedScores;
    } catch (err) {
      console.error('update micro nutrient scores', err);
      return false;
    }
  };

  store.aggregateUsersWithCompaniesByUserIds = async (userIds) => {
    return await new Promise((resolve, reject) => {
      const promises = [];
      // Chunking cos firebase limits us to 10 items when using the "in" operator
      _.chunk(userIds, 10).forEach((arr) => {
        promises.push(db.collection(COLLECTIONS.COMPANY_USERS).where('user_id', 'in', arr).get());
      });
      Promise.all(promises)
        .then((resultsArr) => {
          const companyUsers = _.flatten(resultsArr.map((r) => r.docs)).map(docToObject);
          const companyIds = Array.from(new Set(companyUsers.map((n) => n.company_id)));
          const companyUsersGroupedByUserId = _.keyBy(companyUsers, 'user_id');
          return store.listCompaniesByUid(companyIds).then((companies) => {
            const companiesGroupedById = _.keyBy(companies, 'id');
            return store.listUsersByUid(userIds).then((users) => {
              resolve(
                users.map((u) => {
                  const companyUserPivot = companyUsersGroupedByUserId[u.id] || {};
                  u.company = companiesGroupedById[companyUserPivot.company_id] || null;
                  return u;
                })
              );
            });
          });
        })
        .catch(reject);
    });
  };

  const paginateQuery = async ({query, collection, before, after, size = 15}) => {
    if (after) {
      const snapshot = await db.collection(collection).doc(after).get();
      query.startAfter(snapshot);
    }

    if (before) {
      const snapshot = await db.collection(collection).doc(before).get();
      query.endBefore(snapshot);
    }

    return await query.limit(size).get();
  };

  store.getAdminMembers = async () => {
    const admins = await db
      .collection(COLLECTIONS.ADMIN_USERS)
      .get();
    if (admins.empty) return [];

    const users = await Promise.all(admins.docs.map((doc) => store.getUserByUid(doc.data().user_id)));

    return await Promise.all(users.map(({auth_provider_id: uid}) => store.getUserWithAssociatedData(uid)));
  };

  store.getCompanyMembersAdmin = async () => {
    const users = await db
      .collection(COLLECTIONS.USERS)
      .where('user_type_id', '==', 'bYahB8AVructJMc3nkRW')
      .get();
    if (users.empty) return [];

    return await Promise.all(users.docs.map((doc) => store.getCompanyDataUserByUserId(doc.id, doc.data())));

    // return await Promise.all(companyUsers.map(({auth_provider_id: uid}) => store.getUserWithAssociatedData(uid)));
  };

  store.getUserWithAssociatedData = async (uid) => {
    const user = await store.getUserByAuthId(uid);
    user.user_type = await store.getUserTypeById(user.user_type_id);

    if (user.user_type.value && user.user_type.value.toLowerCase() === USER_TYPES.PARTICIPATING_COMPANY) {
      user.company_user = await store.getCompanyUserByUserId(user.id);
      user.role = user.company_user.role.id;
    } else if (user.user_type.value && user.user_type.value.toLowerCase() === USER_TYPES.ADMIN) {
      user.admin_user = await store.getAdminUserByUserId(user.id);
      user.companies = await store.getUserAssignedCompaniesIds(user.id);
      user.role = user.admin_user.role.id;
    }

    return user;
  };

  store.getAdminRoles = async () => {
    const roles = await db
      .collection(COLLECTIONS.ADMIN_ROLES)
      .get();
    if (roles.empty) return [];

    return roles.docs.map(docToObject);
  };

  store.getCompanyMembers = async (companyId) => {
    const companyUsersSnapshot = await db
      .collection(COLLECTIONS.COMPANY_USERS)
      .where('company_id', '==', companyId)
      .get();
    if (companyUsersSnapshot.empty) return [];
    return store.aggregateUsersWithCompaniesByUserIds(
      companyUsersSnapshot.docs.map((doc) => doc.data().user_id)
    );
  };

  store.getAssignedCompanies = async (userId, before, after, size = 15) => {
    const query = db.collection(COLLECTIONS.ALLOTATIONS).where('user_id', '==', userId);

    const snapshot = await paginateQuery({
      query,
      before,
      after,
      size,
      collection: COLLECTIONS.ALLOTATIONS,
    });

    if (snapshot.empty) return [];

    return await Promise.all(
      snapshot.docs.map(async (doc) => {
        const pivotData = doc.data();
        const companyDetails = await store.getCompanyById(pivotData.company_id);
        const activeCyle = await store.getActiveSATCycle(pivotData.cycle_id);
        const brands = await store.getCompanyBrands(pivotData.company_id);
        const scores = await store.getSatScores(pivotData.company_id, activeCyle.id);

        return {
          ...companyDetails,
          scores,
          brands,
        };
      })
    );
  };

  store.getActivities = async (uid, before, after, size = 15) => {
    const activities = await store.getUserActivityLogs(uid, before, after, size);

    if (activities.length < 1) return [];

    return await Promise.all(
      activities.map(async (doc) => {
        const company = await store.getCompanyById(doc.company_id);
        return {
          ...doc,
          company: company
        };
      })
    );
  };

  store.getAdminIndex = async (before, after, size = 15, ids, cycle) => {
    const companies = await store.getCompanies(before, after, size, ids);

    if (companies.length < 1) return [];

    return await Promise.all(
      companies.map(async (doc) => {
        return store.getCompanyAggsScore(doc.id, cycle, null, true);
      })
    );
  };

  store.getAdminIndexV2 = async (before, after, size = 15, ids, cycle) => {
    const companies = await store.getCompanies(before, after, size, ids);

    if (companies.length < 1) return [];

    return await Promise.all(
      companies.map(async (doc) => {
        return store.getCompanyAggsScoreV2(doc.id, cycle, null, true);
      })
    );
  };

  store.getBrandsAssociatedDocuments = async (brandId) => {
    // const brands = await store.getBrandById(brandId);
  };

  store.rankingList = async (before, after, size = 15, cycleId=0) => {
    console.log('Firestore project:', db._settings.projectId);
    console.log('Firestore database:', db._settings.databaseId);
    const companies = await store.getCompanies(before, after, size);
    // const activeCyle = await store.getActiveSATCycle();
    const cid = (cycleId !=0)
      ? cycleId
      : (await store.getActiveSATCycle()).id;

    // console.log('ACC', activeCyle);
    if (companies.length < 1) return [];

    return Promise.all(
      companies.map(async (doc) => {
        return store.getCompanyAggsScore(doc.id, cid, null, true);
      })
    );
  };

  /**
   * Retrieves a ranking list of companies with aggregate scores for a cycle.
   * @param {string|null} before - Document ID to end before.
   * @param {string|null} after - Document ID to start after.
   * @param {number} size - Page size.
   * @param {string|number} cycle_id - Cycle ID or 0 for active.
   * @returns {Promise<Object[]>} Array of company aggregate score objects.
   */
  store.indexRankingList = async (before, after, size = 15, cycle_id = 0) => {
    const companies = await store.getCompanies(before, after, size);
    //const activeCyle = await store.getActiveSATCycle();
    const cycleId = (cycle_id != 0)
      ? cycle_id
      : (await store.getActiveSATCycle()).id;

    if (companies.length < 1) return [];

    let data = [];
    // Fetch all company aggregate scores in parallel and then push to data array
    await Promise.all(
      companies.map(async (doc) => {
        const score = await store.getCompanyAggsScoreV3(doc.id, cycleId);
        data.push(...score);
      })
    );
    return data;
  };

  store.getQuestionCategoriesByIds = async (categoryIds = []) => {
    try {
      if (!(categoryIds && categoryIds.length)) return [];

      const refs = categoryIds.map((id) => db.collection(COLLECTIONS.QUESTION_CATEGORIES).doc(id));

      let categories = await db.getAll(...refs);

      if (categories.empty) return [];

      categories = categories.filter((c) => c.data());

      return categories.map(docToObject);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // write a function to get the child categories of a parent category. The function should return the child category ids of the parent category
  store.getQuestionChildCategories = async (parentId) => {
    try {
      const query = await db.collection(COLLECTIONS.QUESTION_CATEGORIES).where('parent_id', '==', parentId).get();
      if (query.empty) return [];

      const child = await Promise.all(query.docs.map(async (doc) => {
        const children = docToObject(doc);
        return children.id;
      }));

      if (child.empty) return [];
      return child; // child.map(({ id }) => id);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  store.getQuestionParentCategories = async (categoryIds = [], rootOnly = false) => {
    try {
      const catIds = _.uniq(categoryIds);
      const categories = await store.getQuestionCategoriesByIds(catIds);

      if (!(categories && categories.length)) return [];

      const parentIds = _.uniq(categories.map(({parent_id: id}) => id));

      const parents = await store.getQuestionCategoriesByIds(parentIds);
      const toReturn = await Promise.all(parents.map(async (parent) => await store.getQuestionChildCategories(parent.id).then((children) => ({...parent, children}))));
      return toReturn;
      // if(rootOnly){
      //   //get the children of the parents and return the parents with the children by calling getQuestionChildCategories
      //   let toReturn = await Promise.all(parents.map(async (parent) => await store.getQuestionChildCategories(parent.id).then((children) => ({ ...parent, children }))));
      //   return toReturn;
      //   //let toReturn = parents.map(async (parent) => await store.getQuestionChildCategories(parent.id).then((children) => ({ ...parent, children })));
      //   //console.log("toReturn", toReturn);

      //   //return categories.map(({ parent_id: id }) => store.getQuestionChildCategories(id).then((children) => ({ id, children })));

      // }
      // else{
      //   return parents.map((parent) => {
      //     const children = categories
      //       .filter(({ parent_id: par }) => par == parent.id)
      //       .map(({ id }) => id);

      //     return { ...parent, children };
      //   });
      // }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  // Write a function to get the number of questions based on the category_id of the answers. The answers are in SAAnswers collection and the questions are in the QuestionsCategories collection. The function should return the count of questions for each category_id. in the QuestionsCategories collection the _id is the category_id and the parent_id is the parent category_id
  store.getQuestionCategoryQuestionsCount = async (categoryIds = []) => {
    try {
      const catIds = _.uniq(categoryIds);
      const categories = await store.getQuestionCategoriesByIds(catIds);

      if (!(categories && categories.length)) return [];

      const parentChildren = await store.getQuestionParentCategories(catIds);

      const parentChildrenIds = _.flatten(parentChildren.map(({children}) => children));

      const questions = await store.getQuestions(parentChildrenIds);

      const questionCount = parentChildren.map(({id}) => {
        const count = questions.filter(({category_id: catID}) => catID == id).length;
        return {id, count};
      });

      return questionCount;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  store.getProductMicroNutrientScores = async (scoreIds, productId) =>
    await new Promise(async (resolve, reject) => {
      try {
        if (scoreIds && scoreIds.length === 0) return resolve([]);

        const refs = scoreIds.map((id) => db.collection(COLLECTIONS.MICRO_NUTRIENTS_SCORES).doc(id));

        if (refs.length === 0) return resolve([]);

        let query = await db.getAll(...refs);

        query = query.filter((doc) => doc.exists);

        if (query.length < 1) resolve([]);

        const values = query.map((doc) => docToObject(doc));

        resolve(await Promise.all(
          values.map(async (score) => {
            const microNutrient = await store.getProductMicroNutrients(
              productId,
              score.product_micro_nutrient_id
            );

            return {
              ...score,
              microNutrient,
            };
          })
        )
        );
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });

  store.getCompanyProductTests = async (companyId, cycleId = null) => {
    let query = db
      .collection(COLLECTIONS.PRODUCT_TESTING)
      .where('company_id', '==', companyId);

    if (cycleId) query = query.where('cycle_id', '==', cycleId);

    query = await query.get();

    if (query.empty) return [];

    return await Promise.all(
      query.docs.map(async (doc) => {
        const data = docToObject(doc);
        const results = await store.getProductMicroNutrientScores(
          data.micro_nutrients_results,
          data.product_type
        );

        const productType = await store.getProductTypeById(data.product_type);

        return {
          ..._.omit(data, ['micro_nutrients_results', 'product_type']),
          productType,
          results,
        };
      })
    );
  };
  store.getCompanyProductTestsV2 = async (companyId, cycleId = null, previousId = null) => {
    let currentQuery = db
      .collection(COLLECTIONS.PRODUCT_TESTING)
      .where('company_id', '==', companyId);

    if (cycleId) currentQuery = currentQuery.where('cycle_id', '==', cycleId);

    currentQuery = await currentQuery.get();
    const current = !currentQuery.empty? await Promise.all(
      currentQuery.docs.map(async (doc) => {
        const data = docToObject(doc);
        const results = await store.getProductMicroNutrientScores(
          data.micro_nutrients_results,
          data.product_type
        );

        const productType = await store.getProductTypeById(data.product_type);

        return {
          ..._.omit(data, ['micro_nutrients_results', 'product_type']),
          productType,
          results,
        };
      })
    ):[];

    let previousQuery = db
      .collection(COLLECTIONS.PRODUCT_TESTING)
      .where('company_id', '==', companyId);

    if (previousId) previousQuery = previousQuery.where('cycle_id', '==', previousId);

    previousQuery = await previousQuery.get();

    const previous = !previousQuery.empty? await Promise.all(
      previousQuery.docs.map(async (doc) => {
        const data = docToObject(doc);
        const results = await store.getProductMicroNutrientScores(
          data.micro_nutrients_results,
          data.product_type
        );

        const productType = await store.getProductTypeById(data.product_type);

        return {
          ..._.omit(data, ['micro_nutrients_results', 'product_type']),
          productType,
          results,
        };
      })
    ):[];
    return {current, previous};
  };

  store.getBrandProductTests = async (brandId, cycleId) => {
    let query = db
      .collection(COLLECTIONS.PRODUCT_TESTING)
      .where('brand_id', '==', brandId);

    if (cycleId) query = query.where('cycle_id', '==', cycleId);

    query = await query.get();

    if (query.empty) return [];

    return await Promise.all(
      query.docs.map(async (doc) => {
        const data = docToObject(doc);
        const results = await store.getProductMicroNutrientScores(
          data.micro_nutrients_results,
          data.product_type
        );
        const productType = await store.getProductTypeById(data.product_type);

        return {
          ..._.omit(data, ['micro_nutrients_results', 'product_type', 'cycle_id']),
          productType,
          results,
        };
      })
    );
  };

/**
 * Retrieve all product testing entries for a given cycle, enriched with
 * company, brand, product type, and micronutrient result details.
 * Also computes an Overall MFI Fortification Result (Average) per entry.
 *
 * Collections & fields (per your data):
 *  - PRODUCT_TESTING: brand_id, company_id, cycle_id, product_type, micro_nutrients_results (array or JSON string), fortification
 *  - COMPANY_BRANDS: name (brand name), product_type
 *  - PRODUCT_TYPES: name, value, aflatoxin, aflatoxin_max_permitted
 *  - MICRO_NUTRIENTS_SCORES: mfiScore, percentage_compliance, product_micro_nutrient_id, product_type, company_id, cycle_id
 *
 * @param {string|null} cycleId - Optional cycle ID to filter by. If null, returns all.
 * @returns {Promise<Array<Object>>}
 */
store.getAllProductTests = async (cycleId = null) => {
  try {
    let query = db.collection(COLLECTIONS.PRODUCT_TESTING);
    if (cycleId) query = query.where('cycle_id', '==', cycleId);

    const snapshot = await query.get();
    if (snapshot.empty) return [];

    const rows = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = docToObject(doc);

        // micro_nutrients_results may be stored as an array or a JSON string
        let scoreIds = data.micro_nutrients_results;
        if (typeof scoreIds === 'string') {
          try { scoreIds = JSON.parse(scoreIds); } catch (_) { scoreIds = []; }
        }
        if (!Array.isArray(scoreIds)) scoreIds = [];

        const [company, brand, productType, results] = await Promise.all([
          store.getCompanyById(data.company_id),
          store.getBrandById(data.brand_id),
          store.getProductTypeById(data.product_type),
          store.getProductMicroNutrientScores(scoreIds, data.product_type),
        ]);

        // Compute average MFI (0–30 each) across resolved micronutrient scores
        const mfiScores = Array.isArray(results) ? results.map((r) => Number(r.mfiScore) || 0) : [];
        const overall = mfiScores.length
          ? +(mfiScores.reduce((s, n) => s + n, 0) / mfiScores.length).toFixed(2)
          : 0;

        const productTypeName = (productType?.name || productType?.value || '').replace(/^\"|\"$/g, '');

        return {
          ..._.omit(data, ['micro_nutrients_results']),
          id: data.id || doc.id,
          company_name: company?.company_name ?? null,
          company_size: company?.size_category ?? null, // COMPANY.company_size
          brand_name: brand?.name ?? null, // COMPANY_BRANDS.name
          brand_active: brand?.active ?? null, // COMPANY_BRANDS.status
          product_type_id: data.product_type || null,
          product_type_name: productTypeName,
          results,
          overall_mfi_average: overall,
        };
      })
    );

    return rows;
  } catch (err) {
    console.error('store.getAllProductTests error:', err);
    return [];
  }
};

  store.getCompanyAggsScore = async (companyId, cycleId = null, user = null, showUnpublished = false) => {
    const company = await store.getCompanyById(companyId);

    if (!company) return company;

    let brands = await store.getCompanyBrands(companyId);

    brands = await Promise.all(
      brands.map(async (brand) => ({
        ..._.omit(brand, ['product_type', 'created_at', 'updated_at']),
        productTests: await store.getBrandProductTests(brand.id, cycleId),
        productType: await store.getProductTypeById(brand.product_type)
      }))
    );

    const iegScores = await store.getIEGScores(companyId, 'IEG', cycleId, user, !cycleId);
    const satScores = await store.getCompanySatScores(companyId, cycleId, user, !cycleId);
    const ivcScores = await store.getCompanyIvcScores(companyId, cycleId, user, false, showUnpublished);
    // const productTests = await store.getCompanyProductTests(companyId, cycleId);

    const satTotal = satScores.reduce((accum, {score}) => accum + score, 0);
    const iegTotal = iegScores.reduce((accum, {value}) => accum + value, 0);
    const ivcTotal = ivcScores.reduce((accum, {score}) => accum + score, 0);

    // if (company.tier == COMPANY_TIERS.TIER_1) {
    //   satTotal = ivcScores ? satTotal * 0.4 : satTotal * 0.2;
    // } else {
    //   satTotal = ivcScores ? satTotal * 0.6 : satTotal * 0.3;
    // }

    // const ptResults = productTests.reduce((accum, {fortification}) => [...accum, fortification], []);
    // const ptTotals = ptResults.reduce((accum, {score}) => accum + score, 0) * 0.2;
    // const overallweightedscore = satTotal + iegTotal;// + ptTotals;

    return {
      ...company,
      brands,
      ivcScores,
      iegScores,
      satScores,
      // productTests,
      ivcTotal,
      satTotal,
      iegTotal,
      // overallweightedscore
    };
  };
  store.getCompanyAggsScoreV2 = async (companyId, cycleId = null, user = null, showUnpublished = false) => {
    const company = await store.getCompanyById(companyId);

    if (!company) return company;

    const brands = await store.getCompanyBrands(companyId);
    const computedScores = await store.getComputedScores(companyId, cycleId);

    return {
      ...company,
      brands,
      computedScores
    };
  };
  /**
   * Retrieves aggregate scores for a company for a cycle (and optionally user).
   * @param {string} companyId - Company ID.
   * @param {string|null} cycleId - Cycle ID.
   * @param {Object|null} user - Optional user object.
   * @returns {Promise<Object>} Aggregate score object for the company.
   */
  store.getCompanyAggsScoreV3 = async (companyId, cycleId = null, user = null) => {
    const company = await store.getCompanyById(companyId);

    if (!company) return company;

    const computedIEGScore = await store.getComputedIEGScore(companyId, cycleId, user);
    console.log('Computed IEG Score', computedIEGScore);
    const computedIVCScore = await store.getComputedIVCScore(companyId, cycleId, user);
    console.log('Computed IVC Score', computedIVCScore);

    const iegTotal = computedIEGScore.reduce((accum, {value}) => accum + value, 0) * 0.2;
    const ivcTotal = computedIVCScore.reduce((accum, {value}) => accum + value, 0) * 0.5;

    let brands = await store.getCompanyBrands(companyId);

    brands = await Promise.all(
      brands.map(async (brand) => ({
        ..._.omit(company, ['company_size', 'created_at', 'updated_at']),
        ..._.omit(brand, ['product_type', 'created_at', 'updated_at']),
        productTests: await store.getBrandProductTests(brand.id, cycleId),
        productType: await store.getProductTypeById(brand.product_type),
        ieg: iegTotal,
        ivc: ivcTotal
      }))
    );



    return brands;
  };

  store.saveProductTesting = async (payload) => {
    let {scores, company_id: companyId, cycle_id: cycleId} = payload;
    const validators = await Promise.all([
      store.getCompanyById(companyId),
      store.getBrandById(payload.brand_id),
      store.getActiveSATCycle(cycleId),
      ...scores.map(({product_micro_nutrient_id: id}) => getProductMicroNutrientById(id)),
    ]);

    if (validators.some((doc) => !doc)) {
      throw new Error('One of the item does not exist in the DB.');
    }

    const brand = await store.getBrandById(payload.brand_id);
    const productType = await store.getProductTypeById(brand.product_type);
    const aflatoxin = {
      value: parseFloat(payload.aflatoxinValue),
      aflatoxin_max_permitted: productType.aflatoxin_max_permitted
    };

    scores = scores.map((doc) => ({...doc, value: parseFloat(doc.value), company_id: companyId, cycle_id: cycleId, product_type: brand.product_type}));
    // const microNutrientScores = await (payload.update ? store.updateMicroNutrientScores(scores) : store.addMicroNutrientScores(scores));
    const microNutrientScores = await store.addMicroNutrientScores(scores);
    if (!microNutrientScores) throw new Error('Error saving testing scores.');

    let fortification = {
      message: null,
      score: 0
    };


    // const adjustedScores = microNutrientScores.map(({percentage_compliance: compliance, product_type: productType, name: micronutrient, ...others}) => ({...others, mfiScore: doAdjustedScores(micronutrient, productType, compliance)}));

    // console.log('ADJ', microNutrientScores);

    let overallScore = microNutrientScores.reduce((accum, {mfiScore}) => accum + mfiScore, 0);

    if (productType.name === 'Wheat Flour' || productType.name === 'Maize Flour') overallScore = overallScore / 3;

    fortification = {score: overallScore, message: overallScore >= 30 ? 'Fully Fortified' : overallScore >= 25 ? 'Mostly Fortified' : overallScore >= 15 ? 'Partly Fortified' : overallScore >= 10 ? 'Poorly Fortified' : 'Not Fortified'};

    const productTest = {
      ..._.omit(payload, 'scores', 'update', 'update_id'),
      product_type: brand.product_type,
      aflatoxinValue: parseFloat(payload.aflatoxinValue),
      fortification,
      micro_nutrients_results: microNutrientScores.map(({id}) => id),
    };

    if (productType.aflatoxin) {
      const aflatoxinPercentOfMax = productTest.aflatoxinValue / aflatoxin.aflatoxin_max_permitted;
      const aflatoxinKMfiScore = aflatoxinPercentOfMax >= 101 ? 20 : aflatoxinPercentOfMax >= 121 ? 10 : aflatoxinPercentOfMax >= 151 ? 5 : aflatoxinPercentOfMax >= 201 ? 0 : 30;
      productTest.aflatoxin_max_permitted = aflatoxin.aflatoxin_max_permitted;
      productTest.aflatoxin_percent_of_max = aflatoxinPercentOfMax;
      productTest.aflatoxinScore = aflatoxinKMfiScore;
      productTest.fortification.overallKMFIWeightedScore = ((overallScore / 0.3) * 1) * 0.2 + ((aflatoxinKMfiScore / 0.3) * 1) * 0.1;
    }

    const test = payload.update ? await db.collection(COLLECTIONS.PRODUCT_TESTING).doc(payload.update_id).update(productTest) : await db.collection(COLLECTIONS.PRODUCT_TESTING).add(productTest);
    // const test = await db.collection(COLLECTIONS.PRODUCT_TESTING).add(productTest);

    return payload.update ? docToObject(test) : docToObject(await test.get());
  };

  const getProductMicroNutrientById = async (id) => {
    try {
      const data = await db.collection(COLLECTIONS.PRODUCT_MICRO_NUTRIENTS).doc(id).get();

      if (!data.exists) return null;
      return docToObject(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getInviteByEmail = (collection) => async (email) => {
    const invite = await db
      .collection(collection)
      .where('email', '==', email)
      .get();

    console.log('EmailGet:-', invite);

    if (invite.empty) return null;
    return docToObject(invite.docs[0]);
  };


  const getInviteByEmail1 = (collection) => async (email) => {
    const invite = await db
      .collection(collection)
      .where('email', '==', email)
      .get();

    if (invite.empty) return null;
    return docToObject(invite.docs[0]);
  };
  const createInvite = (collection) => async (email, opts = {}) => {
    const body = {
      uuid: uuidv4(), email, accepted: false, ...opts
    };

    const invite = await db.collection(collection).add({
      ...body,
      created_at: firestore.FieldValue.serverTimestamp(),
      updated_at: firestore.FieldValue.serverTimestamp(),
    });

    return docToObject(await invite.get());
  };

  const deleteInvite = (collection) => async (id) => {
    try {
      await db.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      console.error('store: delete team member invite', error);
      return false;
    }
  };

  store.deleteAssignedCompany = async (id) => {
    try {
      await db.collection(COLLECTIONS.ALLOTATIONS).doc(id).delete();
      return true;
    } catch (error) {
      console.error('store: assigned company delete failed.', error);
      return false;
    }
  };

  store.deleteUser = async (id, authId) => {
    try {
      await db.collection(COLLECTIONS.USERS).doc(id).delete();
      await auth.deleteUser(authId);
      return true;
    } catch (error) {
      console.error('store:user delete failed.', error);
      return false;
    }
  };
  store.deleteMicroNutrientScore = async (ptid) => {
    try {
      const pt = await db.collection(COLLECTIONS.PRODUCT_TESTING).doc(ptid).get();
      if (!pt.exists) return true;
      const ptData = docToObject(pt);
      const microids = ptData.micro_nutrients_results;
      if (!microids || microids.length === 0) return true;
      microids.forEach(async (microid) => {
        await db.collection(COLLECTIONS.MICRO_NUTRIENTS_SCORES).doc(microid).delete();
      }
      );
      await db.collection(COLLECTIONS.PRODUCT_TESTING).doc(ptid).delete();
      return true;
    } catch (error) {
      console.error('store: deleteMicroNutrientScore delete failed.', error);
      return false;
    }
  };
  store.deleteCompanyData = async (id) => {
    const batch = db.batch();

    try {
      const assessmentScoresQuery = db.collection(COLLECTIONS.ASSESSMENT_SCORES).where('company_id', '==', id);
      const assessmentScoresData = await assessmentScoresQuery.get();
      assessmentScoresData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const commentsQuery = db.collection(COLLECTIONS.COMMENTS).where('company_id', '==', id);
      const commentsData = await commentsQuery.get();
      commentsData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const brandsQuery = db.collection(COLLECTIONS.COMPANY_BRANDS).where('company_id', '==', id);
      const brandsData = await brandsQuery.get();
      brandsData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const microNScoresQuery = db.collection(COLLECTIONS.MICRO_NUTRIENTS_SCORES).where('company_id', '==', id);
      const microNScoresData = await microNScoresQuery.get();
      microNScoresData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const productTestingQuery = db.collection(COLLECTIONS.PRODUCT_TESTING).where('company_id', '==', id);
      const productTestingData = await productTestingQuery.get();
      productTestingData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const saAnswersQuery = db.collection(COLLECTIONS.SA_ANSWERS).where('company_id', '==', id);
      const saAnswersData = await saAnswersQuery.get();
      saAnswersData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const ivcAnswersQuery = db.collection(COLLECTIONS.IVC_ANSWERS).where('company_id', '==', id);
      const ivcAnswersData = await ivcAnswersQuery.get();
      ivcAnswersData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const allotationsQuery = db.collection(COLLECTIONS.ALLOTATIONS).where('company_id', '==', id);
      const allotationsData = await allotationsQuery.get();
      allotationsData.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const companyUsersQuery = db.collection(COLLECTIONS.COMPANY_USERS).where('company_id', '==', id);
      const companyUsersData = await companyUsersQuery.get();
      companyUsersData.forEach(async (doc) => {
        batch.delete(doc.ref);
      });

      const documentsQuery = db.collection(COLLECTIONS.DOCUMENTS).where('company_id', '==', id);
      const documentsData = await documentsQuery.get();
      const admin = getFirebaseAdmin();
      const bucket = admin.storage().bucket();
      documentsData.forEach((doc) => {
        const mDoc = docToObject(doc);
        bucket.file(mDoc.file_name).delete();
        batch.delete(doc.ref);
      });

      const ParticipatingCompaniesRef = await db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(id);
      const ParticipatingCompaniesDocIsOk = (async () => {
        const doc = await ParticipatingCompaniesRef.get();
        if (!doc.exists) return false;
        return doc.data().id == id;
      })();
      if (ParticipatingCompaniesDocIsOk) batch.delete(ParticipatingCompaniesRef);

      await batch.commit();
    } catch (err) {
      console.error('DELETE ERROR', err);
    }
  };

  const getInviteById = (collection) => async (id) => {
    const invite = await db.collection(collection).doc(id).get();

    if (!invite.exists) return null;
    return docToObject(invite);
  };

  const createUser = (collection) => async (data) => {
    const user = await db
      .collection(collection)
      .add({
        ...data,
        created_at: firestore.FieldValue.serverTimestamp(),
        updated_at: firestore.FieldValue.serverTimestamp(),
      })
      .then((ref) => ref.get());

    return docToObject(user.data());
  };

  store.createCompanyUser = createUser(COLLECTIONS.COMPANY_USERS);
  store.createAdminUser = createUser(COLLECTIONS.ADMIN_USERS);

  store.deleteTeamMemberInvite = deleteInvite(COLLECTIONS.COMPANY_INVITATIONS);
  store.deleteAdminTeamMemberInvite = deleteInvite(COLLECTIONS.ADMIN_INVITATIONS);

  store.getTeamMemberInviteById = getInviteById(COLLECTIONS.COMPANY_INVITATIONS);
  store.getAdminTeamMemberInviteById = getInviteById(COLLECTIONS.ADMIN_INVITATIONS);

  store.createTeamMemberInvite = createInvite(COLLECTIONS.COMPANY_INVITATIONS);
  store.createAdminTeamMemberInvite = createInvite(COLLECTIONS.ADMIN_INVITATIONS);

  store.getTeamMemberInviteByEmail = getInviteByEmail(COLLECTIONS.COMPANY_INVITATIONS);
  store.getTeamMemberInviteByEmail1 = getInviteByEmail1(COLLECTIONS.COMPANY_INVITATIONS);
  store.getAdminTeamMemberInviteByEmail = getInviteByEmail(COLLECTIONS.ADMIN_INVITATIONS);
  store.getAdminTeamMemberInviteByEmail1 = getInviteByEmail1(COLLECTIONS.ADMIN_INVITATIONS);

  store.getSatAnswers = store.getAssessmentAnswers(COLLECTIONS.SA_ANSWERS);
  store.getPreviousSatAnswers = store.getPreviousAssessmentAnswers(COLLECTIONS.SA_ANSWERS);
  store.getIvcAnswers = store.getAssessmentAnswers(COLLECTIONS.IVC_ANSWERS);

  store.getIEGScores = async (companyId, type, cycleId = null, user = null, showUnapproved = false) => {
    if (user && !((await isCompanyMember(store, user, companyId) || isMFIAdmin(user)))) {
      return 'You are not allowed to get IEG scores.';
    }

    let query = db
      .collection(COLLECTIONS.ASSESSMENT_SCORES)
      .where('company_id', '==', companyId)
      .where('type', '==', type);

    if (!showUnapproved && type == 'SAT') query = query.where('approved', '==', true);
    if (cycleId) query = query.where('cycle_id', '==', cycleId);

    const data = await query.get();

    if (data.empty) return [];

    const docs = data.docs.map(docToObject);
    const categories = await store.getQuestionCategoriesByIds(docs.map(({category_id: id}) => id));

    return docs.map((doc) => ({
      ..._.omit(doc, 'category_id'),
      category: categories.find((c) => c.id == doc.category_id)
    }));
  };

  store.getCompanyAssessmentScores = (assesstUtil) => async (companyId, cycleId, user = null, showUnapproved = false, showUnpublished = false) => {
    if (user && !((await isCompanyMember(store, user, companyId) || isMFIAdmin(user)))) {
      return 'You are not allowed to get SAT scores.';
    }

    const satScores = await assesstUtil(companyId, [], cycleId, showUnapproved, showUnpublished);
    const questionIds = satScores.map(({category_id: cat}) => cat);
    // console.log('questionIds', questionIds);
    const fullVersion = satScores.some(({tier}) => tier != 'TIER_1');

    const categories = await store.getQuestionParentCategories(questionIds);
    // const categoriesV2 = await store.getQuestionCategoryQuestionsCount(questionIds);

    return categories.map((category) => {
      // const cycleScores = satScores.filter(({ cycle_id: cycle }) => cycle == "vJqDawZlrKNHsMIW9G2s");
      const scores = satScores.filter(({category_id: cat}) => category.children.includes(cat));
      let newScores = scores.filter(({tier}) => tier == 'TIER_3');
      if (newScores.length == 0) {
        newScores = scores.filter(({tier}) => tier == 'TIER_2');
        if (newScores.length == 0) {
          newScores = scores.filter(({tier}) => tier == 'TIER_1');
        }
      }
      const finalScores = newScores.reduce((accum, sat) => accum + satCalc(fullVersion)(sat), 0);

      // let newScore = score * (category.weight / 100);
      // let newScore = (score / category.children.length);
      const theScore = (finalScores/category.children.length) * 100;
      const boniScore = theScore * (category.weight / 100);
      // if(companyId == "z3NkCihZ6CUqIcFvsh18"){
      // console.log('questionIds', questionIds);
      // console.log('CATEGO', category);
      // console.log('CATEGOV2', categoriesV2);
      // console.log('theScore', theScore);
      // console.log('finalScores', finalScores);
      // console.log('theScore', theScore);
      // console.log('boniScore', boniScore);
      // console.log('newScore', newScores);
      // console.log('category.weight', category.weight);


      // }


      return {name: category.name, score: boniScore, value: theScore, answersLength: scores.length, weight: category.weight, category_id: category.id};
    });
  };

  store.getCompanyAssessmentScoresOld = (assesstUtil) => async (companyId, cycleId, user = null, showUnapproved = false, showUnpublished = false) => {
    if (user && !((await isCompanyMember(store, user, companyId) || isMFIAdmin(user)))) {
      return 'You are not allowed to get SAT scores.';
    }

    const satScores = await assesstUtil(companyId, [], cycleId, showUnapproved, showUnpublished);
    const questionIds = satScores.map(({category_id: cat}) => cat);
    const fullVersion = satScores.some(({tier}) => tier != 'TIER_1');

    const categories = await store.getQuestionParentCategories(questionIds);

    return categories.map((category) => {
      const cycleScores = satScores.filter(({cycle_id: cycle}) => cycle == 'vJqDawZlrKNHsMIW9G2s');
      const scores = cycleScores.filter(({category_id: cat}) => category.children.includes(cat));
      let score = scores.reduce((accum, sat) => accum + satCalc(fullVersion)(sat), 0);

      score = (score / category.children.length) * (category.weight / 100);

      return {name: category.name, score};
    });
  };

  store.updateOrCreateSATAnswer = store.updateOrCreateAssessmentAnswers(COLLECTIONS.SA_ANSWERS, store);
  store.updateOrCreateIVCAnswer = store.updateOrCreateAssessmentAnswers(COLLECTIONS.IVC_ANSWERS, store);

  store.getCompanySatScores = store.getCompanyAssessmentScores(store.getSatAnswers);
  store.getCompanyIvcScores = store.getCompanyAssessmentScores(store.getIvcAnswers);

  store.activateCompany = async (companyId) => {
    try {
      const ref = db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(companyId);

      if (!(await ref.get()).exists) return false;
      await ref.update({active: true});
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  store.deactivateCompany = async (companyId) => {
    try {
      const ref = db.collection(COLLECTIONS.PARTICIPATING_COMPANIES).doc(companyId);

      if (!(await ref.get()).exists) return false;
      await ref.update({active: false});
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  store.satExport = async (cycleId, companyId) => {
    try {
      const functions = require('firebase-functions');
      const {google} = require('googleapis');

      const auth = new google.auth.GoogleAuth({
        credentials: functions.config().google.credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
        ],
      });

      const sheets = google.sheets({version: 'v4', auth});
      const drive = google.drive({version: 'v3', auth});

      // === Fetch Company & Cycle Data ===
      const companyDoc = await db.collection('ParticipatingCompanies').doc(companyId).get();
      if (!companyDoc.exists) return {message: 'Company not found'};

      const cycleDoc = await db.collection('SACycles').doc(cycleId).get();
      if (!cycleDoc.exists) return {message: 'Cycle not found'};

      const company = companyDoc.data();
      const cycle = cycleDoc.data();
      const sheetTitle = `${cycle.name} - ${company.company_name}`.substring(0, 60);

      // === Create Google Sheet ===
      const {data: spreadsheet} = await sheets.spreadsheets.create({
        resource: {properties: {title: sheetTitle}},
      });

      const spreadsheetId = spreadsheet.spreadsheetId;
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      const email = 'tdurotoye@tns.org';

      // === Grant Access to Email ===
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {role: 'writer', type: 'user', emailAddress: email},
      });

      // === Get First Sheet ID ===
      const {data: sheetMetadata} = await sheets.spreadsheets.get({spreadsheetId});
      const firstSheetId = sheetMetadata.sheets[0]?.properties?.sheetId || 0;

      // Fetch categories
      const mCategoriesSnapshot = await db.collection('QuestionCategories').where('parent_id', '==', '').orderBy('sort_order', 'asc').get();
      const mCategories = mCategoriesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

      // === Rename First Sheet to First Category Name ===
      if (mCategories.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                updateSheetProperties: {
                  properties: {sheetId: firstSheetId, title: mCategories[0].name.substring(0, 30)},
                  fields: 'title',
                },
              },
            ],
          },
        });
      }

      // === Fetch Firestore Data in Batches ===
      const [
        categoriesSnapshot,
        questionsSnapshot,
        answersSnapshot,
        ivcAnswersSnapshot,
        documentsSnapshot,
        commentsSnapshot,
        tiersSnapshot,
        usersSnapshot
      ] = await Promise.all([
        db.collection('QuestionCategories').where('parent_id', '==', '').orderBy('sort_order', 'asc').get(),
        db.collection('SAQuestion').orderBy('sort_order', 'asc').get(),
        db.collection('SAAnswers').where('company_id', '==', companyId).where('cycle_id', '==', cycleId).get(),
        db.collection('IVCAnswers').where('company_id', '==', companyId).where('cycle_id', '==', cycleId).get(),
        db.collection('Documents').where('owner_type', '==', 'category').where('company_id', '==', companyId).get(),
        db.collection('Comments').where('owner_type', '==', 'category').where('company_id', '==', companyId).get(),
        db.collection('QuestionTiers').orderBy('sort_order', 'asc').get(),
        db.collection('Users').get()
      ]);

      // === Convert Firestore Snapshots to Lookup Objects ===
      const categories = categoriesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      const questions = questionsSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      const answers = Object.fromEntries(answersSnapshot.docs.map((doc) => [doc.data().category_id, doc.data().value]));
      const ivcAnswers = Object.fromEntries(ivcAnswersSnapshot.docs.map((doc) => [doc.data().category_id, doc.data().value]));
      let tiers = tiersSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      const users = Object.fromEntries(usersSnapshot.docs.map((doc) => [doc.id, doc.data()]));
      if (company.tier == 'TIER_1') {
        tiers = tiers.filter((tier) => tier.tier_constant == 'TIER_1');
      }
      // Preprocess documents & comments
      const documents = {};
      documentsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!documents[data.owner_id]) documents[data.owner_id] = [];
        documents[data.owner_id].push(`- https://www.googleapis.com/download/storage/v1/b/kmfi-945ef.appspot.com/o/${data.file_name}?generation=${data.storage_id.toString().split('/').pop()}&alt=media`);
      });

      const comments = {};
      commentsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!comments[data.owner_id]) comments[data.owner_id] = [];
        const user = users[data.user_id] || {full_name: 'Unknown'};
        comments[data.owner_id].push(`- ${user.full_name} (${data.created_at.toDate().toLocaleDateString()}): ${data.content}`);
      });

      let batchRequests = [];
      const sheetIdMap = {[categories[0].id]: firstSheetId};

      // === Create New Sheets for Remaining Categories ===
      for (let i = 1; i < categories.length; i++) {
        batchRequests.push({addSheet: {properties: {title: categories[i].name.substring(0, 30)}}});
      }

      // === Batch Create Sheets ===
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({spreadsheetId, resource: {requests: batchRequests}});

      // === Assign Sheet IDs ===
      let requestIndex = 0;
      for (let i = 1; i < categories.length; i++) {
        if (addSheetResponse.data.replies[requestIndex]?.addSheet) {
          sheetIdMap[categories[i].id] = addSheetResponse.data.replies[requestIndex].addSheet.properties.sheetId;
        }
        requestIndex++;
      }

      batchRequests = [];

      // === Insert Data into Sheets ===
      for (const category of categories) {
        const sheetId = sheetIdMap[category.id];
        const values = [['Section', 'Objective', 'Level', 'Evidence Descriptor', 'Answer', 'IVC Answer', 'Documents', 'Comments']];

        const subCategoriesSnapshot = await db.collection('QuestionCategories').where('parent_id', '==', category.id).orderBy('sort_order', 'asc').get();
        const subCategories = subCategoriesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

        for (const subCategory of subCategories) {
          for (const tier of tiers) {
            const subCategoryQuestions = questions.filter((q) => q.category_id === subCategory.id && q.tier_id === tier.id);
            const evidenceDescriptor = subCategoryQuestions.map((q) => `- ${q.value}`).join('\n');

            values.push([
              subCategory.name,
              subCategory.description,
              tier.name,
              evidenceDescriptor,
              answers[subCategory.id] || '',
              ivcAnswers[subCategory.id] || '',
              (documents[subCategory.id] || []).join('\n'),
              (comments[subCategory.id] || []).join('\n'),
            ]);
          }
        }

        batchRequests.push({
          updateCells: {
            rows: values.map((row) => ({values: row.map((cell) => ({userEnteredValue: {stringValue: cell}}))})),
            fields: 'userEnteredValue',
            start: {sheetId: sheetId, rowIndex: 0, columnIndex: 0},
          },
        });
      }

      // === Batch Insert Data into Sheets ===
      await sheets.spreadsheets.batchUpdate({spreadsheetId, resource: {requests: batchRequests}});

      console.log('Sheet created:', spreadsheetUrl);
      return {message: 'Sheet created', sheetId: spreadsheetId};
    } catch (error) {
      console.error('Error creating sheet:', error);
      return {message: 'Error creating sheet', error: error.message};
    }
  };
  return store;
};

/* eslint-disable no-fallthrough */

const satCalc
  = (version) =>
    ({value, tier, points}) => {
      switch (value) {
        case 'FULLY_MET':
          switch (tier) {
            case 'TIER_1':
              return version ? (points / 3.33) : (points / 2);
            case 'TIER_2':
              return (points / 3.33);
            case 'TIER_3':
              return (points / 3.33);
            default:
              return 0;
          }
        case 'MOSTLY_MET':
          switch (tier) {
            case 'TIER_1':
              return version ? points / 3.33 : (points / 2);
            case 'TIER_2':
              return (points / 3.33);
            case 'TIER_3':
              return (points / 3.33);
            default:
              return 0;
          }
        case 'PARTLY_MET':
          switch (tier) {
            case 'TIER_1':
              return version ? (points / 3.33) : (points / 2);
            case 'TIER_2':
              return (points / 3.33);
            case 'TIER_3':
              return (points / 3.33);
            default:
              return 0;
          }
        case 'NOT_MET':
          switch (tier) {
            case 'TIER_1':
              return version ? (points / 3.33) : (points / 2);
            case 'TIER_2':
              return (points / 3.33);
            case 'TIER_3':
              return (points / 3.33);
            default:
              return 0;
          }
      }
    };

// Manual upsert implementation for firestore
const upsertAssessmentScore = (db) => async (originalScore) => {
  const calcScore = ({value, weight}) => Math.round((value * weight) / 100);

  const score = {...originalScore, score: calcScore(originalScore)};

  const {company_id: companyId, cycle_id: cycleId, category_id: catId, type} = score;
  const scoreDoc = await db.collection(COLLECTIONS.ASSESSMENT_SCORES).where('company_id', '==', companyId).where('cycle_id', '==', cycleId).where('category_id', '==', catId).where('type', '==', type).get();

  if (scoreDoc.empty) {
    return db.collection(COLLECTIONS.ASSESSMENT_SCORES).add({...score, created_at: firestore.FieldValue.serverTimestamp()});
  } else {
    const scoreDocRef = scoreDoc.docs[0].ref;
    return scoreDocRef.update({...score, updated_at: firestore.FieldValue.serverTimestamp()});
  }
};

const upsertSATAssessmentScore = (db, type, companyId, cycleId) => async (originalScore) => {
  const score = {...originalScore, type};

  const {category_id: catId} = score;
  const scoreDoc = await db.collection(COLLECTIONS.ASSESSMENT_SCORES).where('company_id', '==', companyId).where('cycle_id', '==', cycleId).where('category_id', '==', catId).where('type', '==', type).get();

  if (scoreDoc.empty) {
    return db.collection(COLLECTIONS.ASSESSMENT_SCORES).add({...score, company_id: companyId, cycle_id: cycleId, created_at: firestore.FieldValue.serverTimestamp()});
  } else {
    const scoreDocRef = scoreDoc.docs[0].ref;
    return scoreDocRef.update({...score, updated_at: firestore.FieldValue.serverTimestamp()});
  }
};
