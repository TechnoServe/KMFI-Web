/**
 * Configures and exports the Redux store with combined reducers and middleware.
 * @module store/index
 */
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import authReducer from 'store/auth-reducer';

/**
 * Redux store configured with combined reducers and middleware.
 * @type {Store}
 */
const store = createStore(
  // Combine multiple reducers into a single root reducer; here only auth reducer is used
  combineReducers({auth: authReducer}),
  // Apply Redux Thunk middleware for handling async actions
  applyMiddleware(thunk)
);

/**
 * Exports the configured Redux store.
 * @returns {Store} Configured Redux store instance.
 */
export default store;
