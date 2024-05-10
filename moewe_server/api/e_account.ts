import { ApiDefinition } from "../server/docu";
import { Account, accountType, isAdmin } from "../service/model/m_account";
import { DataService } from "../service/s_data";
import { err } from "../tools/error";



export const routesAccount: ApiDefinition[] = [
  {
    path: "/list",
    description: "get a list of accounts",
    workerAuthed: (_) => DataService.i.listAccounts(null, 1, 100),
  },
  {
    method: "post",
    path: "/:aId?",
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
      const id = DataService.i.setAccount(aId, body);
      return { id: id };
    },
  },
  {
    path: "/:aId",
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
      if (user.id != aId && !adm) throw err.notAllowed("you can only get your own account. " + `You are${adm ? "" : " not"} an admin.`);
      return DataService.i.getAccount(aId);
    },
  },
  {
    method: "delete",
    path: "/:aId",
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
      DataService.i.deleteAccount(aId);
      return { message: "account deleted" };
    },
  },
];
