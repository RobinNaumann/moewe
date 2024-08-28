import { DonauRoute, err, routeAuthed } from "donau";
import { Account, accountType, isAdmin } from "../service/model/m_account";
import { AccountService } from "../service/s_account";
import { AuthUser } from "../service/s_auth";

export const routesAccount: DonauRoute<AuthUser>[] = [
  routeAuthed("/list", {
    description: "get a list of accounts",
    workerAuthed: (_) => AccountService.i.list(null, 1, 100),
  }),

  routeAuthed("/{aId}?", {
    method: "post",
    description: "set a account model",
    parameters: [
      {
        name: "aId",
        in: "path",
        required: false,
        description: "the id of the user",
        type: "string",
      },
    ],
    reqBody: {
      description: "user data",
      required: [],
      properties: accountType,
    },
    workerAuthed: (user, body: Partial<Account>, aId) => {
      if (aId && user.id != aId && !isAdmin(user))
        throw err.notAllowed("you can only set your own account");
      const id = AccountService.i.set(aId, body);
      return { id: id };
    },
  }),
  routeAuthed("/{aId}", {
    description: "get a single account",
    parameters: [
      {
        name: "aId",
        in: "path",
        required: true,
        description: "the id of the account",
        type: "string",
      },
    ],
    workerAuthed: (user, aId) => {
      const adm = isAdmin(user);
      if (user.id != aId && !adm)
        throw err.notAllowed(
          "you can only get your own account. " +
            `You are${adm ? "" : " not"} an admin.`
        );
      return AccountService.i.get(aId);
    },
  }),
  routeAuthed("/{aId}", {
    method: "delete",
    description: "delete a single account",
    parameters: [
      {
        name: "aId",
        in: "path",
        required: true,
        description: "the id of the account",
        type: "string",
      },
    ],
    workerAuthed: (user, aId) => {
      if (user.id != aId && !isAdmin(user))
        throw err.notAllowed("you can only delete your own account");
      AccountService.i.delete(aId);
      return { message: "account deleted" };
    },
  }),
];
