import { REGISTER_SUCCESS, REGISTER_FAIL } from '../types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter(alert => alert.id !== payload);
    default:
      return state;
  }
}