import { tables } from "../server/tables";
import { isAdmin } from "../service/m_data";
import { AuthUser } from "../service/s_auth";
import { DbService } from "../service/s_db";
import { err } from "./error";

export function guard(user: AuthUser, ...items: GuardItem[]) {
  if (!user) throw err.notAllowed("user not logged in");
  const res = _or(user, items);
  if (res) throw err.notAllowed(res.message);
}

function _or(
  user: AuthUser,
  a: GuardItem[] | GuardItem
): { message: string } | null {
  const arr = Array.isArray(a) ? a : [a];
  let msg = { message: "unknown" };
  for (const item of arr) {
    const res = item(user);
    if (res == null) return null;
    if (!msg) msg = res;
  }
  return msg;
}

export function and(
  a: GuardItem[] | GuardItem,
  b: GuardItem[] | GuardItem
): GuardItem {
  return (user) => {
    const resA = _or(user, a);
    return resA ? resA : _or(user, b);
  };
}

export type GuardItem = (user: AuthUser) => { message: string } | null;

// pre-defined guard items

export const admin: GuardItem = (user) =>
  isAdmin(user) ? null : { message: `user '${user.id}' is not an admin` };

export function isNull(id: string): GuardItem {
  return (_) => id != null ? { message: `id not expected` } : null;
}

export function projectMember(id: string): GuardItem {
  
  return (user) => {
    if (!id) return { message: `project id not set` };
    const res = DbService.i.getQuery(tables.role, {
      where: "project = $project AND account = $account",
      params: { $project: id, $account: user.id },
    });
    if (!res) {
      return {
        message: `user '${user.id}' is not a member of the project '${id}'`,
      };
    }
    return null;
  };
}
