import axios from "axios";
import { getAuthHeaders } from "../session";
// import {Item} from "../types/item";

export const getData = async (): Promise<any[]> => {
  console.log("GET DATA REST CALL");
  // const response = await axios.get<Item[]>("/api/items", { headers: getAuthHeaders() });
  const response = await axios.get<any[]>("/api/fcc/all", { headers: getAuthHeaders() });
  console.log("GET DATA REST CALL DONE", response.data);
  return response.data;
};
