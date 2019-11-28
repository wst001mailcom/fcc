import { Dispatch } from "react";
import { handleLogin } from "../rest/login";

export const ACTION_LOGIN_IN_PROGRESS = "ACTION_LOGIN_IN_PROGRESS";
export const ACTION_LOGIN_FAILED = "ACTION_LOGIN_FAILED";
export const ACTION_LOGIN_SUCCEED = "ACTION_LOGIN_SUCCEED";

export const loginInProgressAction = (email: string, password: string) => async (dispatch: Dispatch<any>) => {
  console.log("ACTION:", ACTION_LOGIN_IN_PROGRESS, email);
  dispatch({
    email,
    password,
    isRequesting: true,
    type: ACTION_LOGIN_IN_PROGRESS,
  });

  try {
    await handleLogin(email, password);
    loginSucceed(dispatch);
  } catch (err) {
    loginFailedAction(err, dispatch);
  }
};

const loginFailedAction = (error: string, dispatch: Dispatch<any>) => {
  console.log("ACTION:", ACTION_LOGIN_FAILED, error);
  dispatch({ error: "Something went wrong", isRequesting: false, type: ACTION_LOGIN_FAILED });
};

const loginSucceed = (dispatch: Dispatch<any>) => {
  console.log("ACTION:", ACTION_LOGIN_SUCCEED);
  dispatch({ isLoggedIn: true, isRequesting: false, type: ACTION_LOGIN_SUCCEED });
};
