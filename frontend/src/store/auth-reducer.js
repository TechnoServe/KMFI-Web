import {authLogin, authSetUser, fetchAuthUserThunk, authLogout} from 'store/action-types';
import jwt from 'jwt-decode';

/**
 *
 * @param {*} state
 * @param {*} action
 * @return {*}
 */
function r(state = {authenticated: false}, action) {
  switch (action.type) {
    case authLogin.type:
      sessionStorage.setItem('auth-token', action.payload.token);
      sessionStorage.setItem('auth-user', JSON.stringify(action.payload.user));
      sessionStorage.setItem('auth-cycle', JSON.stringify(action.payload.cycle));
      return {
        ...state,
        authenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        cycle: action.payload.cycle,
      };
    case authLogout.type:
      sessionStorage.removeItem('auth-token');
      sessionStorage.removeItem('auth-user');
      sessionStorage.removeItem('auth-cycle');
      return {
        ...state,
        authenticated: false,
      };
    case fetchAuthUserThunk.fulfilled.type:
    case authSetUser.type:
      sessionStorage.setItem('auth-user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };

    default:
      const token = sessionStorage.getItem('auth-token');
      const user = sessionStorage.getItem('auth-user');
      const cycle = sessionStorage.getItem('auth-cycle');
      if (token) {
        const decoded = jwt(token);
        if (new Date() < new Date(decoded.exp * 1000)) {
          return {
            ...state,
            authenticated: true,
            user: JSON.parse(user),
            cycle: JSON.parse(cycle),
          };
        } else {
          return state;
        }
      } else {
        return state;
      }
  }
}

export default r;
