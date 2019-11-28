import { Dispatch } from "react";
import { getData } from "../rest/data-grid";
// import {Item} from "../types/item";
import { handleLogout } from "../rest/login";

export const ACTION_GETDATA_IN_PROGRESS = "ACTION_GETDATA_IN_PROGRESS";
export const ACTION_GETDATA_FAILED = "ACTION_GETDATA_FAILED";
export const ACTION_GETDATA_SUCCEED = "ACTION_GETDATA_SUCCEED";
export const ACTION_LOGOUT = "ACTION_LOGOUT";

export const getDataAction = () => async (dispatch: Dispatch<any>) => {
  dispatch({
    error: "",
    isRequesting: true,
    type: ACTION_GETDATA_IN_PROGRESS,
  });

  try {
    const resp = await getData();
    getFccDataSuccessAction(resp, dispatch);
  } catch (err) {
    getDataFailedAction(err, dispatch);
  }
};

const getDataFailedAction = (error: string, dispatch: Dispatch<any>) => {
  dispatch({ error: "Something went wrong getting data", isRequesting: false, type: ACTION_GETDATA_FAILED });
};

/*
const getDataSuccessAction = (responseData: Item [], dispatch: Dispatch<any>) => {
    dispatch({ data: responseData, isRequesting: false, type: ACTION_GETDATA_SUCCEED})
}
*/

const getFccDataSuccessAction = (responseData: any[], dispatch: Dispatch<any>) => {
  dispatch({ fccData: responseData, isRequesting: false, type: ACTION_GETDATA_SUCCEED });
};

export const logoutAction = () => async (dispatch: Dispatch<any>) => {
  await handleLogout();
  dispatch({ isLoggedIn: false, isRequesting: false, type: ACTION_LOGOUT });
};
