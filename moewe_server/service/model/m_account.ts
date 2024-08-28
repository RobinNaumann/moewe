import { err } from "donau";
import { AuthUser, userPrivileges } from "../s_auth";

export interface Account {
  id: string;
  email: string;
  name: string;
  privilege: number;

  // private elements:
  password?: string;
  pw_hash?: string;
  pw_salt?: string;
}

export const isAdmin = (a: Account | AuthUser) =>
  a?.privilege ?? 0 >= userPrivileges.admin.id;
export const guardAdmin = (a: Account | AuthUser) => {
  if (!isAdmin(a)) throw err.notAuthorized("not an admin");
};

export const accountType = {
  id: "string",
  email: "string",
  name: "string",
  verified: "boolean",
};
