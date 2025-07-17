// export const AUTH_LOGIN = 'AUTH_LOGIN';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {request} from 'common';

/**
 * Action creator for logging out the user.
 * @returns {Object} Redux action object.
 */
export const authLogout = createAction('auth/logout');

/**
 * Action creator for logging in the user.
 * @param {Object} user - The user object.
 * @param {string} token - JWT or session token.
 * @param {Object} cycle - Cycle-related metadata for the session.
 * @returns {Object} Redux action object with payload.
 */
export const authLogin = createAction('auth/login', (user, token, cycle) => {
  // TODO: Add user to local storage first
  return {
    payload: {
      user,
      token,
      cycle
    },
  };
});

/**
 * Action creator to set the user object in Redux state.
 * @param {Object} user - The user object to store.
 * @returns {Object} Redux action with user payload.
 */
export const authSetUser = createAction('auth/setUser', (user) => {
  return {
    payload: user,
  };
});

// https://redux-toolkit.js.org/api/createAsyncThunk
/**
 * Async thunk to fetch authenticated user data and associated company details.
 * @async
 * @returns {Promise<Object>} Resolves with the enriched user object including company info.
 */
export const fetchAuthUserThunk = createAsyncThunk('auth/fetchAuthUserThunk', async () => {
  // Fetch current authenticated user's basic info
  const {data: user} = await request(true).get('me');
  // Fetch detailed company info using user's company ID
  const {
    data: {company},
  } = await request(true).get('company/details', {
    params: {'company-id': user.company_user.company_id},
  });
  // Attach company info to user object before returning
  user.company = company;
  return user;
});
