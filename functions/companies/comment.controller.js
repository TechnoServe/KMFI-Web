const express = require('express');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const {getFirebaseAdmin} = require('../index.admin');
const {sendEmail} = require('../utils');
const { getFirestore } = require('firebase-admin/firestore');

const admin = getFirebaseAdmin();
// Use the KMFI named Firestore database (databaseId: "kmfi")
const kmfiFirestore = getFirestore(admin.app(), 'kmfi');
const globalStore = require('../store')(kmfiFirestore, admin.auth());

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

/**
 * Comment Controller
 */
class CommentController {
  /**
   * Create a new comment and notify mentioned users by email.
   * @param {Object} req - Express request object containing body, store, and user.
   * @param {Object} res - Express response object used to return result.
   * @returns {Promise<void>} Sends JSON response with the created result.
   */
  static async create(req, res) {
    // Extract relevant fields from the request
    const {store, body, user} = req;
    // Add the comment using store service
    const result = await store.comments.addComment(user, {
      mentions: body.ids,
      content: body.content,
      parent: body.parent,
      owner: {id: body.category_id},
      companyId: body.company_id,
      tier: body.tier
    });

    // Loop through mentioned user IDs and send notification emails
    for (let i = 0; i < body.ids?.length; i++) {
      const _id = body.ids[i];
      const user = await globalStore.getUserByUid(_id);

      await sendEmail(mailTransport, {
        from: process.env.TRANSACTIONAL_EMAIL_ADDRESS,
        to: user.email,
        subject: 'KMFI SAT Mention',
        html: '<p>You were mentioned </p>' + body.content + '<p> in a comment</p>' + '<p>Click <a href=\'https://selfassessment.kmfi-ke.org/\'>here</a> to view the comment</p>',
      });
    }
    res.json({result});
  }

  /**
   * Get comments for the currently authenticated user.
   * @param {Object} req - Express request object containing user and store.
   * @param {Object} res - Express response object used to return comments.
   * @returns {Promise<void>} Sends JSON response with user-specific comments.
   */
  static async forAuthUser(req, res) {
    // Fetch comments specific to the authenticated user
    const {store, user} = req;
    const result = await store.comments.getCommentsForUser(user.id);
    res.json({result});
  }

  /**
   * Get comments for a specific category and company.
   * @param {Object} req - Express request object containing params and query.
   * @param {Object} res - Express response object used to return filtered comments.
   * @returns {Promise<void>} Sends JSON response with enriched comments.
   */
  static async forCategory(req, res) {
    // Extract parameters for category and company
    const {
      store,
      params: {id: categoryId},
      query: {company_id: companyId, tier}
    } = req;
    // Fetch matching comments
    const result = await store.comments.getCommentsForCategory(companyId, categoryId, tier);
    // Collect unique user IDs from the comments
    const userIds = Array.from(new Set(result.map((c) => c.user_id)).values());

    // Enrich comments with user info
    const users = await store.aggregateUsersWithCompaniesByUserIds(userIds);
    const usersGroupedById = _.keyBy(users, 'id');

    res.json(result.map((comment) => {
      comment.user = usersGroupedById[comment.user_id] || null;
      return comment;
    }));
  }

  /**
   * Delete a comment if it belongs to the current user.
   * @param {Object} req - Express request object containing user and params.
   * @param {Object} res - Express response object used to send result.
   * @returns {Promise<void>} Sends JSON response indicating success or failure.
   */
  static async delete(req, res) {
    // Fetch the comment by ID
    const {store, params, user} = req;
    const comment = await store.comments.getById(params.id);

    // Check if comment exists and belongs to the current user
    if (!comment) return res.status(404).json({message: 'Resource not found.'});
    if (comment.user_id !== user.id) return res.status(403).json({message: 'Unauthorized'});

    // Remove comment if authorized
    await store.comments.removeComment(user, comment.id);
    res.json({result: 'ok'});
  }
}

const commentRouter = new express.Router();
commentRouter.get('/list/me', CommentController.forAuthUser);
commentRouter.get('/list/category/:id', CommentController.forCategory);
commentRouter.post('/', CommentController.create);
commentRouter.delete('/:id', CommentController.delete);

module.exports.commentRouter = commentRouter;
