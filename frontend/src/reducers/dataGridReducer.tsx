import { ACTION_GETDATA_IN_PROGRESS, ACTION_GETDATA_FAILED, ACTION_GETDATA_SUCCEED, ACTION_LOGOUT } from "../actions/data-grid-action";
import { State } from "../types/state";
import { defaultState } from "./mainReducer";

export const dataGridReducer = (state: State = defaultState, action: any) => {
  switch (action.type) {
    case ACTION_GETDATA_IN_PROGRESS:
      return {
        ...state,
        error: action.error,
        isRequesting: action.isRequesting,
      };
    case ACTION_GETDATA_FAILED:
      return {
        ...state,
        error: action.error,
        isRequesting: action.isRequesting,
      };
    case ACTION_GETDATA_SUCCEED:
      console.log("GET DATA SUCCESS", action.fccData);
      return {
        ...state,
        fccData: action.fccData,
        isRequesting: action.isRequesting,
      };
    case ACTION_LOGOUT:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        isRequesting: action.isRequesting,
      };
    default:
      return state;
  }
};
