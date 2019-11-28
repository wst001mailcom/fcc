import { Item } from "../types/item";
import { State } from "../types/state";
import { combineReducers } from "redux";
import { loginReducer } from "./loginReducer";
import { dataGridReducer } from "./dataGridReducer";

export const defaultState: State = {
  email: "",
  password: "",
  isRequesting: false,
  isLoggedIn: false,
  error: "",
  data: [] as Item[],
  fccData: [] as any[],
};

export default combineReducers({
  login: loginReducer,
  dataGrid: dataGridReducer,
});
