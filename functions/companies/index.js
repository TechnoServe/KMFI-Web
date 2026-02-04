const {PC_ROLES, USER_TYPES, COMPANY_TIERS, SAT_RESPONSES, SAT_SCORES, BUCKETS} = require('../constants');
const {sendEmail, signJwtToken, uploadHelper} = require('../utils');
const {validate, paginationConstraint, recursiveStringContraints} = require('../utils');
const {ActivityLog} = require('../utils/activity-log');
const guards = require('../guards');

module.exports.getActiveCycle = (store) => async (req, res) => {
  try {
    const cycle = await store.getActiveSATCycle();
    return res.json(cycle);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Unable to get active cycle.'});
  }
};

module.exports.signUp = (store, mailTransport) => async (req, res) => {
  try {
    let user;
    let authUser = await store.getAuthUserByEmail(req.body['company-email']);

    if (authUser) user = await store.getUserByAuthId(authUser.auth_provider_id);
    else authUser = await store.createAuthUser(req.body['company-email']);

    if (user) {
      return res.status(400).json({
        errors: {
          ['company-email']: ['This email is already associated with an existing user.'],
        },
      });
    }

    const userPayload = {
      full_name: req.body['full-name'],
      email: req.body['company-email'],
      auth_provider_id: authUser.uid,
    };

    const companyPayload = {
      company_name: req.body['company-name'],
      company_size: req.body['company-size'],
    };

    user = await store.createCompanyAndUser(userPayload, companyPayload);

    if (
      !(await store.addCompanyBrands(
        user.company_id,
        req.body['brands'].map((brand) => ({
          name: brand['name'],
          product_type: brand['product-type'],
        }))
      ))
    ) {
      return res.status(500).json({message: 'Failed to create company brands'});
    }

    try {
      const token = await signJwtToken(authUser.uid);
      const url = `${process.env.FRONTEND_URL}/verify-token?token=${token}&verify=true`;

      sendEmail(mailTransport, {
        from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
        to: req.body['company-email'],
        subject: 'Verify Email',
        html: `<a href="${url}">Click to verify email: ${url}</a>`,
      }).catch((err) => console.error('Failed to send user sign up email', err));

      return res.json({
        message: `Sign Up Successful. A login Email has been sent to ${req.body['company-email']}`,
      });
    } catch (err) {
      const message = 'Failed to sign JWT.';
      console.error(message, err);
      return res.status(500).json({message});
    }
  } catch (err) {
    const message = 'Registration failed.';
    console.error(message, err);

    return res.status(500).json({message}); // This is a 500 error
  }
};

module.exports.getCompanyActivityLogs = (store) => async (req, res) => {
  try {
    const {page = 1, perPage = 20} = req.query;
    const user = req.user;
    const companyUser = await store.getCompanyUserByUserId(user.id);
    if (!companyUser) {
      return res.status(400).json({error: 'no user to process activity logs for'});
    }
    const data = [];
    const logs = (await store.getCompanyActivityLogs(companyUser.company_id, page, perPage)) || [];
    for (const log of logs) {
      try {
        const item = await new ActivityLog(log).processRawActivityLog(store);
        if (item) data.push(item);
      } catch (e) {
        console.error('getCompanyActivityLogs:error', e.message);
      }
    }
    return res.json(data);
  } catch (e) {
    return res.status(500).json({error: e.message});
  }
};

const getAnswers = (dbHelper) => (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'category-ids': {
        type: 'array',
      },
      'cycle-ids': {
        type: 'string',
      },
    };

    const body = {...req.body, ...req.query};

    const errors = validate(body, constraints);
    if (errors) {
      return res.status(400).json({errors});
    }

    const cycleId = body['cycle-ids']
      ? body['cycle-ids']
      : (await store.getActiveSATCycle()).id;

    if (!(guards.isCompanyMember(store, req.user, body['company-id']) || guards.isMFIAdmin(req.user))) {
      return res
        .status(403)
        .json({message: 'You are not authorized to get SAT responses for this company.'});
    }

    const responses = await store[dbHelper](
      body['company-id'],
      body['category-ids'],
      cycleId,
      body['showUnapproved'],
      body['showUnpublished'],
    );

    return res.json({
      responses,
      message: 'Answer successfully fetched.',
    });
  } catch (err) {
    const message = 'Failed to get SAT response.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

const getPreviousAnswers = (dbHelper) => (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'category-ids': {
        type: 'array',
      }
    };

    const body = {...req.body, ...req.query};

    const errors = validate(body, constraints);
    if (errors) {
      return res.status(400).json({errors});
    }


    if (!(guards.isCompanyMember(store, req.user, body['company-id']) || guards.isMFIAdmin(req.user))) {
      return res
        .status(403)
        .json({message: 'You are not authorized to get SAT responses for this company.'});
    }

    const responses = await store[dbHelper](
      body['company-id'],
      body['category-ids'],
      body['showUnapproved'],
    );

    return res.json({
      responses,
      message: 'Previous answer successfully fetched.',
    });
  } catch (err) {
    const message = 'Failed to get previous SAT response.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

module.exports.getPreviousSATAnswers = getPreviousAnswers('getPreviousSatAnswers');
module.exports.getSATAnswers = getAnswers('getSatAnswers');
module.exports.getIVCAnswers = getAnswers('getIvcAnswers');


const submitAnswers = (dbHelper) => async (req, res) => {
  const constraints = {
    'company-id': {
      type: 'string',
      presence: {allowEmpty: false},
    },
    'category-id': {
      type: 'string',
      presence: {allowEmpty: false},
    },
    'tier': {
      type: 'string',
      presence: {allowEmpty: false},
      inclusion: {
        within: SAT_SCORES,
        message: 'Provide a valid SAT tier.',
      },
    },
    'response': {
      type: 'string',
      presence: {allowEmpty: false},
      inclusion: {
        within: [
          SAT_RESPONSES.NOT_MET,
          SAT_RESPONSES.PARTLY_MET,
          SAT_RESPONSES.MOSTLY_MET,
          SAT_RESPONSES.FULLY_MET,
        ],
        message: 'Provide a valid response.',
      },
    },
  };

  const errors = validate(req.body, constraints);
  if (errors) {
    return res.status(400).json({errors});
  }

  const points = SAT_SCORES[req.body['tier']][req.body['response']];
  // points = points + (req.body['points'] ? req.body['points'] : 0);
  await dbHelper(
    req.user.id,
    req.body['company-id'],
    req.body['category-id'],
    req.body['tier'],
    req.body['response'],
    points,
  );

  return res.json({message: 'Answer successfully submitted.', points: points});
};

module.exports.submitSATAnswer = (store) => async (req, res) => {
  try {
    if (!guards.isCompanyMember(store, req.user, req.body['company-id'])) {
      return res.status(403).json({message: 'You are not authorized to submit SAT responses.'});
    }

    return submitAnswers(store.updateOrCreateSATAnswer)(req, res);
  } catch (err) {
    const message = 'Failed to submit answer.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

module.exports.submitIVCAnswer = (store) => async (req, res) => {
  try {
    return submitAnswers(store.updateOrCreateIVCAnswer)(req, res);
  } catch (err) {
    const message = 'Failed to submit answer.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

module.exports.adminInviteTeamMember = (store, transport) => async (req, res) => {
  try {
    const emailList = req.body.invitationEmailsList;
    const {
      company_user: {company_id: companyId},
    } = req.user;

    // TODO: Validate this
    if (emailList.length <= 0) {
      return res.json({error: 'One or more email is required'});
    }

    for (const {email, from} of emailList) {
      // Check if user exists

      const userExist = await store.getUserByEmail(email);
      if (userExist) {
        // return res.json('User Already exists');
        // res.status(500).json({ error: "User Already exists" });
        // // continue;

        return res.status(400).json({
          errors: {
            invitationId: ['User already exists.'],
          },
        });
      }

      // Check if an invite already exists
      let invite = await store.getTeamMemberInviteByEmail(email);
      console.log('Invite', invite);
      if (invite) {
        return res.status(400).json({
          errors: {
            invitationId: ['Invite already sent'],
          },
        });
        // const url = `${process.env.FRONTEND_URL || 'localhost:5000'}/invite/${invite.id}/${from.full_name}`;
        // await sendEmail(transport, {
        //   from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
        //   to: email,
        //   subject: 'Invitation',
        //   html: `<p>Click to Accept Invitation: </p><br/>${url}`,
        // });
      } else {
        // Create new invite
        invite = await store.createTeamMemberInvite(email, {company_id: companyId});

        const url = `${process.env.FRONTEND_URL || 'localhost:5000'}/invite/${invite.id}/${from.full_name}`;
        await sendEmail(transport, {
          from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
          to: email,
          subject: 'Invitation',
          html: `<p>Click to Accept Invitation: </p><br/>${url}`,
        });
      }
    }

    return res.json({message: 'Invitation sent'});
  } catch (e) {
    console.error('invite team member', e);
    res.status(500).json({error: e.message});
  }
};

module.exports.acceptCompanyInvite = (store, transport) => async (req, res) => {
  try {
    const {fullName, invitationId} = req.body;
    const invite = await store.getTeamMemberInviteById(invitationId);

    if (!invite) {
      return res.status(400).json({
        errors: {
          invitationId: ['Invite does not exist.'],
        },
      });
    }

    if (await store.getAuthUserByEmail(invite.email)) {
      return res.status(400).json({
        errors: {
          invitationId: ['User already exists.'],
        },
      });
    }

    const authUser = await store.createAuthUser(invite.email);
    const {id: userRoleId} = await store.getCompanyRoleByName(PC_ROLES.USER);
    const {id: userTypeId} = await store.getUserTypeByName(USER_TYPES.PARTICIPATING_COMPANY);
    const {id: userId} = await store.createUser({
      full_name: fullName,
      email: invite.email,
      user_type_id: userTypeId,
      auth_provider_id: authUser.uid,
    });

    await store.createCompanyUser({
      company_role_id: userRoleId,
      company_id: invite.company_id,
      user_id: userId,
    });

    const token = await signJwtToken(authUser.uid);
    const url = `${process.env.FRONTEND_URL}/verify-token?token=${token}`;

    sendEmail(transport, {
      from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
      to: invite.email,
      subject: 'Email Login',
      html: `<a href="${url}">Click to Login: ${url}</a>`,
    });

    return res.json({message: 'Sign up successfull.'});
  } catch (e) {
    console.error('handle accept company invite', e);
    return res.status(500).json({error: e.message});
  }
};

module.exports.cancelInvite = (store, transport) => async (req, res) => {
  try {
    // TODO: Write a guard.
    const {invitationId} = req.body;
    const invite = store.getTeamMemberInviteById(invitationId);

    if (!invite) {
      return res.status(400).json({
        errors: {
          invitationId: ['Invite does not exist.'],
        },
      });
    }

    const user = await store.getUserByEmail(invite.email);

    if (user) {
      return res.status(400).json({
        errors: {
          invitationId: ['User already exists.'],
        },
      });
    }

    if (await store.deleteTeamMemberInvite(invite.id)) {
      return res.json({message: 'Invite deleted.'});
    }

    return res.status(400).json({message: 'Failed to delete invite.'});
  } catch (error) {
    console.error('admin delete team member invite', error);
    return res.status(500).json({message: 'Some error occured while deleting invite.'});
  }
};

module.exports.getQuestionCategories = (store) => async (req, res) => {
  try {
    const {parentIds, rootOnly, sorted} = req.body;

    // TODO: Validate input
    // TODO: Trim inputs

    const data = await store.getQuestionCategories(parentIds, Boolean(rootOnly && !sorted));

    if (sorted) {
      const parents = data.filter((category) => !category.parent_id);

      data.forEach((category) => {
        parents.forEach((parent) => {
          if (parent.id != category.parent_id) return;
          if (!parent.children) parent.children = [];
          parent.children.push(category);
        });
      });

      return res.json({data: parents});
    }

    return res.json({data});
  } catch (error) {
    console.error('get question categories', error);
    return res.status(500).json({message: 'Some error occured while fetcing question categories.'});
  }
};

module.exports.getModalCategories = (store) => async (req, res) => {
  try {
    const data = await store.getModalCategories();

    return res.json({data});
  } catch (error) {
    console.error('get question categories', error);
    return res
      .status(500)
      .json({message: 'Some error occured while fetching score modal categories.'});
  }
};

module.exports.editCompanyDetails = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        presence: {allowEmpty: false},
        type: 'string',
      },
      'name': {
        presence: {allowEmpty: false},
        type: 'string',
      },
      'company-size-id': {
        presence: {allowEmpty: false},
        type: 'string',
      },
      'size_category': {
        presence: {allowEmpty: false},
        type: 'string',
        inclusion: {
          within: ['SMALL', 'MEDIUM', 'LARGE'],
          message: 'Provide a valid company size category.',
        },
      },
    };

    const errors = validate(req.body, constraints);
    if (errors) {
      return res.status(400).json({errors});
    }

    if (!guards.isCompanyAdmin(store, req.user, req.body['company-id'])) {
      return res.status(403).json({message: 'You are not allowed to edit company details.'});
    }

    const company = await store.updateCompany(req.body['company-id'], {
      company_name: req.body['name'],
      company_size: req.body['company-size-id'],
      size_category: req.body['size_category'],
    });

    return res.json({data: company});
  } catch (error) {
    const msg = 'Failed to update company info.';
    console.error(msg, error);

    return res.status(500).json(msg);
  }
};

module.exports.getSAQuestions = (store) => async (req, res) => {
  try {
    // TODO: Validate inputs
    const {categoryIds} = req.body;
    const TIER_1 = 'TIER_1';
    const categories = {};
    const tiers = {};
    const {company_id: companyId} = req.query;
    const questions = await store.getQuestions(categoryIds);
    const company = await store.getCompanyById(companyId);
    const isTier1 = company.tier === TIER_1;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!categories[q['category_id']]) {
        categories[q['category_id']] = await store.getQuestionCategoryById(q['category_id']);
      }

      if (!tiers[q['tier_id']]) {
        const tier = await store.getTierById(q['tier_id']);
        if (!isTier1 || tier.tier_constant === TIER_1) tiers[q['tier_id']] = tier;
        else questions.splice(i, 1);
      }
    }

    return res.json({categories, questions, tiers});
  } catch (error) {
    const message = 'Failed to fetch questions.';
    console.error(error, message);
    res.status(500).json({message});
  }
};

module.exports.getSAQuestionsAdmin = (store) => async (req, res) => {
  try {
    // TODO: Validate inputs
    const {categoryIds} = req.body;
    const TIER_1 = 'TIER_1';
    const categories = {};
    const tiers = {};
    const questions = await store.getQuestions(categoryIds);
    const isTier1 = false;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!categories[q['category_id']]) {
        categories[q['category_id']] = await store.getQuestionCategoryById(q['category_id']);
      }

      if (!tiers[q['tier_id']]) {
        const tier = await store.getTierById(q['tier_id']);
        if (!isTier1 || tier.tier_constant === TIER_1) tiers[q['tier_id']] = tier;
        else questions.splice(i, 1);
      }
    }

    return res.json({categories, questions, tiers});
  } catch (error) {
    const message = 'Failed to fetch questions.';
    console.error(error, message);
    res.status(500).json({message});
  }
};

module.exports.setTier = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'tier': {
        type: 'string',
        presence: {allowEmpty: false},
        inclusion: {
          within: [COMPANY_TIERS.TIER_1, COMPANY_TIERS.TIER_3],
          message: 'Provide a valid company tier.',
        },
      },
    };

    const errors = validate(req.body, constraints);

    if (errors) return res.status(400).json({errors});

    const company = await store.getCompanyById(req.body['company-id']);

    if (!guards.isCompanyAdmin(store, req.user, company)) {
      return res.status(403).json({message: 'You are not allowed to set company tier.'});
    }

    await store.setCompanyTier(req.body['company-id'], req.body['tier']);

    return res.json({message: 'Company tier set successfully.'});
  } catch (error) {
    const message = 'Failed to set company SAT tier.';
    console.error(error, message);
    res.status(500).json({message});
  }
};

module.exports.getCompanyDetails = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);
    if (errors) return res.status(400).json({errors});

    if (!guards.isCompanyAdmin(store, req.user, req.query['company-id'])) {
      return res.status(403).json({message: 'You are not allowed to get this company details.'});
    }

    return res.json({
      message: 'Company fetched successfully.',
      company: await store.getCompanyById(req.query['company-id']),
    });
  } catch (err) {
    const message = 'Failed to get company details.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

module.exports.deleteCompanyMember = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'user-ids': {
        type: 'array',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.body, constraints);

    if (errors) return res.status(400).json({errors});

    const company = await store.getCompanyById(req.body['company-id']);

    if (!guards.isCompanyAdmin(store, req.user, company)) {
      return res.status(403).json({message: 'You are not allowed to delete a company user.'});
    }

    if (!(await store.softDeleteCompanyUser(req.body['company-id'], req.body['user-ids']))) {
      return res.status(500).json({message: 'Delete query failed'});
    }

    return res.json({message: 'User deleted successfully.'});
  } catch (error) {
    const message = 'Failed to delete company member.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getSatScores = (store) => async (req, res) => {
  try {
    const constraints = {
      'cycle-id': {
        type: 'string',
      },
      'previous-id': {
        type: 'string',
      },
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    const cycleId = req.query['cycle-id']
      ? req.query['cycle-id']
      : (await store.getActiveSATCycle()).id;
    const company = await store.getCompanyById(req.query['company-id']);

    if (!guards.isCompanyMember(store, req.user, company)) {
      return res.status(403).json({message: 'You are not allowed to get SAT scores.'});
    }
    const data = {
      current: await store.getSatScores(req.query['company-id'], cycleId),
      previous: req.query['previous-id'] ? await store.getSatScores(req.query['company-id'], req.query['previous-id']) : null
    };

    return res.json({
      data: data,
      message: 'Scores successfully fetched.',
    });
  } catch (error) {
    const message = 'Failed to fetch SAT scores.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getBrands = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    const company = await store.getCompanyById(req.query['company-id']);

    if (!guards.isCompanyMember(store, req.user, company)) {
      return res.status(403).json({message: 'You are not allowed to get company brands.'});
    }

    return res.json({
      data: await store.getCompanyBrands(req.query['company-id']),
      message: 'Brands fetched successfully.',
    });
  } catch (error) {
    const message = 'Failed to fetch company brands.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};
module.exports.getBrandsAdmin = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    const company = await store.getCompanyById(req.query['company-id']);

    if (!guards.isCompanyMember(store, req.user, company)) {
      return res.status(403).json({message: 'You are not allowed to get company brands.'});
    }

    return res.json({
      data: await store.getCompanyBrandsAdmin(req.query['company-id']),
      message: 'Brands fetched successfully.',
    });
  } catch (error) {
    const message = 'Failed to fetch company brands.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.updateBrands = (store) => async (req, res) => {
  try {
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'brands-create': {
        type: 'array',
      },
      'brands-update': {
        type: 'array',
      },
      'brands-delete': {
        type: 'array',
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    if (!guards.isCompanyAdmin(store, req.user, req.body['company-id'])) {
      return res.status(403).json({message: 'You are not allowed to edit company brands.'});
    }

    const company = await store.getCompanyById(req.query['company-id']);

    if (req.body['brands-create']) {
      // Create brands
      if (
        !(await store.addCompanyBrands(
          company.id,
          req.body['brands-create'].map((brand) => ({
            name: brand['name'],
            product_type: brand['product-type']
          }))
        ))
      ) {
        return res.status(500).json({message: 'Failed to create new company brands'});
      }
    }

    if (req.body['brands-update']) {
      // Update brands
      const brands = req.body['brands-update'].map((brand) => ({
        id: brand['id'],
        name: brand['name'],
        product_type: brand['product-type'],
        active: brand['active'],
      }));

      await store.updateCompanyBrand(company.id, brands);
    }

    if (req.body['brands-delete']) {
      // Delete brands
      await store.deleteCompanyBrands(company.id, req.body['brands-delete']);
    }

    return res.json({
      message: 'Company brands updated successfully.',
    });
  } catch (error) {
    const message = 'Failed to set company brands.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.updateQuestions = (store) => async (req, res) => {
  try {
    const constraints = {
      'questions-update': {
        type: 'array',
      },
      'questions-add': {
        type: 'object',
      },
      'questions-delete': {
        type: 'string',
      }
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    if (req.body['questions-update']) {
      // Update questions
      const questions = req.body['questions-update'].map((question) => ({
        id: question['id'],
        category_id: question['category-id'],
        sort_order: question['sort-order'],
        tier_id: question['tier-id'],
        value: question['value']
      }));

      await store.updateSATQestions(questions);

      return res.json({
        message: 'Questions updated successfully.',
      });
    }

    if (req.body['questions-add']) {
      // Add question

      const question = {
        category_id: req.body['category-id'],
        sort_order: req.body['sort-order'],
        tier_id: req.body['tier-id'],
        value: req.body['value']
      };

      await store.addSATQestions(question);

      return res.json({
        message: 'Question added successfully.',
      });
    }

    if (req.body['questions-delete']) {
      // Delete question
      await store.deleteSATQestions(req.body['id']);

      return res.json({
        message: 'Question deleted successfully.',
      });
    }
  } catch (error) {
    const message = 'Failed to update questions.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.updateQuestionCategory = (store) => async (req, res) => {
  try {
    const constraints = {
      'weight': {
        type: 'string',
      },
      'sort-order': {
        type: 'string',
      },
      'parent-id': {
        type: 'string',
      },
      'sub-cat-name': {
        type: 'string',
      },
      'sub-title': {
        type: 'string',
      },
      'description': {
        type: 'string',
      }
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    // Update question Categories
    const category = {
      description: (req.body['description'] ? req.body['description'] : ''),
      name: (req.body['sub-cat-name'] ? req.body['sub-cat-name'] : ''),
      parent_id: (req.body['parent-id'] ? req.body['parent-id'] : ''),
      sort_order: req.body['sort-order'],
      sub_title: (req.body['sub-title'] ? req.body['sub-title'] : ''),
      weight: (req.body['weight'] ? req.body['weight'] : 0)
    };

    await store.updateSATQuestionCategory(req.body['id'], category);

    return res.json({
      message: 'Category updated successfully.',
    });
  } catch (error) {
    const message = 'Failed to update category.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.updateParentQuestionCategory = (store) => async (req, res) => {
  try {
    const constraints = {
      'id': {
        type: 'string',
      },
      'weight': {
        type: 'string',
      },
      'name': {
        type: 'name',
      }
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    // Update parent question Category
    const parentCategory = {
      weight: req.body['weight'],
      name: req.body['name'],
      description: req.body['name']
    };

    await store.updateSATQuestionCategory(req.body['id'], parentCategory);

    return res.json({
      message: 'Category updated successfully.',
    });
  } catch (error) {
    const message = 'Failed to update category.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getCompanies = (store) => async (req, res) => {
  try {
    const {
      query,
    } = req;
    const errors = validate(req.query, paginationConstraint);

    if (errors) return res.status(400).json({errors});

    const {before, after, 'page-size': size} = query;

    const data = await store.getCompanies(
      before,
      after,
      +size
    );

    return res.json(data);
  } catch (error) {
    const message = 'Failed to get companies.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};
module.exports.getCompaniesAdmin = (store) => async (req, res) => {
  try {
    const {
      query,
    } = req;
    const errors = validate(req.query, paginationConstraint);

    if (errors) return res.status(400).json({errors});

    const {before, after, 'page-size': size} = query;

    const data = await store.getCompaniesAdmin(
      before,
      after,
      +size
    );

    return res.json(data);
  } catch (error) {
    const message = 'Failed to get companies.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getIvcCompanies = (store) => async (req, res) => {
  try {
    const constraints = {
      'user-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    const data = await store.getIvcCompanies(req.query['user-id']);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get ivc companies.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getActivities = (store) => async (req, res) => {
  try {
    const {query} = req;

    const errors = validate(query, paginationConstraint);

    if (errors) return res.status(400).json({errors});

    const {uid, before, after, 'page-size': size} = query;

    const data = await store.getActivities(uid, before, after, +size);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get activity log.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getAdminIndex = (store) => async (req, res) => {
  try {
    const {query} = req;

    const errors = validate(query, paginationConstraint);

    if (errors) return res.status(400).json({errors});

    const {before, after, 'page-size': size, cycle} = query;

    const data = await store.getAdminIndexV2(before, after, +size, req.query['companies'] ? (req.query['companies'].includes(',') ? req.query['companies'].split(',') : [req.query['companies']]) : [], cycle);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get companies.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getAssignedCompanies = (store) => async (req, res) => {
  try {
    const {
      query,
      user: {id},
    } = req;

    const errors = validate(query, paginationConstraint);

    if (errors) return res.status(400).json({errors});

    const {before, after, 'page-size': size} = query;

    const data = await store.getAssignedCompanies(id, before, after, +size);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get companies assigned to user.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getProductTesting = (store) => async (req, res) => {
  try {
    const constraints = {
      id: {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const {params} = req;

    const errors = validate(params, constraints);

    if (errors) return res.status(400).json({errors});

    const {id} = params;

    const data = await store.getCompanyProductTests(id);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get product testing.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};
module.exports.getProductTestingV2 = (store) => async (req, res) => {
  try {
    const constraints = {
      id: {
        type: 'string',
        presence: {allowEmpty: false},
      },

    };

    const {params} = req;

    const errors = validate(params, constraints);

    if (errors) return res.status(400).json({errors});

    const {id} = params;
    const {'cycle-id': cycleId, 'previous-id': previousId} = req.query;

    const data = await store.getCompanyProductTestsV2(id, cycleId, previousId);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get product testing.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getBrandProductTests = (store) => async (req, res) => {
  try {
    const constraints = {
      'id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'cycle-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    const {id, 'cycle-id': cycleId} = req.query;

    const data = await store.getBrandProductTests(id, cycleId);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get product testing.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getBrandProductType = (store) => async (req, res) => {
  try {
    const constraints = {
      'id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    if (errors) return res.status(400).json({errors});

    const {id} = req.query;

    const data = await store.getProductTypeById(id);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to get product type.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.saveProductTesting = (store) => async (req, res) => {
  try {
    const {
      params: {id},
      body,
    } = req;

    const nutrientScoreContsraint = {
      product_micro_nutrient_id: {
        type: 'string',
        presence: {allowEmpty: false},
      },
      value: {
        numericality: true,
        presence: {allowEmpty: false},
      },
    };

    const baseConstraint = recursiveStringContraints(
      'brand_id',
      'cycle_id',
      'sample_batch_number',
      'sample_collection_location',
      'sample_size',
      'unique_code',
      'company_id',
      'sample_collector_names'
    );

    const constraints = {
      ...baseConstraint
    };

    const payload = {...body, company_id: id};

    // Joi validator would have being more useful in this context
    const itemValidator = (constraints) => (val) => validate(val, constraints);

    const errors = [];
    errors.push(validate(payload, constraints));

    if (!Array.isArray(body.scores)) {
      errors.push('Results must be an array.');
    } else if (!(body.scores.length > 0)) {
      errors.push('Results cannot be empty.');
    } else {
      errors.concat(
        body.scores.map(itemValidator(nutrientScoreContsraint)).filter((err) => err)
      );
    }

    if (errors.filter((err) => err).length > 0) return res.status(400).json({errors});

    const data = await store.saveProductTesting(payload);
    return res.json(data);
  } catch (error) {
    const message = 'Failed to save product testing.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

const getScores = (type) => (store) => async (req, res) => {
  try {
    const constraints = {
      'cycle-id': {
        type: 'string',
      },
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
    };

    const errors = validate(req.query, constraints);

    const {'company-id': companyId, 'cycle-id': cycleId} = req.query;

    if (errors) return res.status(400).json({errors});

    const data = await store.getIEGScores(companyId, type, cycleId, req.user);

    return res.json({data});
  } catch (error) {
    const message = 'Failed to fetch IEG scores.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.getIEGScores = getScores('IEG');

module.exports.getCompanyAggsScore = (store) => async (req, res) => {
  try {
    const {
      params: {id, cid},
    } = req;


    const payload = {'company-id': id, 'cycle-id': cid};

    const {'company-id': companyId, 'cycle-id': cycleId} = payload;

    // if (errors) return res.status(400).json({ errors });

    const data = await store.getCompanyAggsScore(companyId, cycleId, req.user);

    return res.json(data);
  } catch (error) {
    const message = 'Failed to get product testing.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.uploadCompanyLogo = (store, admin) => async (req, res) => {
  try {
    const {
      params: {id: companyId},
    } = req;

    const uploadedDoc = await uploadHelper(admin, req, companyId, BUCKETS.COMPANIES_LOGO);

    const response = await store.updateCompany(companyId, {logo: `${uploadedDoc.selfLink}?alt=media`});
    res.json(response);
  } catch (e) {
    const error = 'Image upload failed.';
    console.error(error, e);
    return res.status(500).json({error});
  }
};
module.exports.activateCompany = (store) => async (req, res) => {
  try {
    const {
      params: {id},
    } = req;

    if (!id) {
      return res.status(400).json({error: 'No company id provided.'});
    }

    if (!guards.isCompanyAdmin(store, req.user, id)) {
      return res.status(403).json({message: 'You are not allowed to activate company.'});
    }

    await store.activateCompany(id);

    return res.json({message: 'Company activated successfully.'});
  } catch (error) {
    const message = 'Failed to activate company.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};

module.exports.deactivateCompany = (store) => async (req, res) => {
  try {
    const {
      params: {id},
    } = req;

    if (!id) {
      return res.status(400).json({error: 'No company id provided.'});
    }

    if (!guards.isCompanyAdmin(store, req.user, id)) {
      return res.status(403).json({message: 'You are not allowed to deactivate company.'});
    }

    await store.deactivateCompany(id);

    return res.json({message: 'Company deactivated successfully.'});
  } catch (error) {
    const message = 'Failed to deactivate company.';
    console.error(message, error);
    return res.status(500).json({message});
  }
};
