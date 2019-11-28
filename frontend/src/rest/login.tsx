import axios from "axios";
import { setSession, clearSession } from "../session";

export const handleLogin = async (email: string, password: string): Promise<void> => {
  console.log("LOGIN RESTFUL CALL ");
  const response = await axios.post<{ token: string; expiry: string }>("/api/users/login", { email, password });
  console.log("LOGIN RESTFUL CALL DONE", response);
  const { token, expiry } = response.data;
  setSession(token, expiry);
  console.log("SET SESSION DONE", response);
  return;
};

export const handleLogout = async (): Promise<void> => {
  console.log("logging out");
  clearSession();
};
