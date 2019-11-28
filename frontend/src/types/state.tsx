import { Item } from "./item";

export interface State {
  email: string;
  password: string;
  isRequesting: boolean;
  isLoggedIn: boolean;
  error: string;
  data: Item[];
  fccData: any[];
}
