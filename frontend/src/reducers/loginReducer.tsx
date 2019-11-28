import { ACTION_LOGIN_IN_PROGRESS, ACTION_LOGIN_FAILED, ACTION_LOGIN_SUCCEED } from "../actions/login-action";
import { State } from "../types/state";
import { defaultState } from "./mainReducer";

export const loginReducer = (state: State = defaultState, action: any) => {
  switch (action.type) {
    case ACTION_LOGIN_IN_PROGRESS:
      console.log("reducer login in progress");
      return {
        ...state,
        email: action.email,
        password: action.password,
        isRequesting: action.isRequesting,
      };
    case ACTION_LOGIN_FAILED:
      return {
        ...state,
        error: action.error,
        isRequesting: action.isRequesting,
      };
    case ACTION_LOGIN_SUCCEED:
      console.log("Login succeed", state.isLoggedIn, action.isLoggedIn);
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        isRequesting: action.isRequesting,
      };
    default:
      return state;
  }
};
