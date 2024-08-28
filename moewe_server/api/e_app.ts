import { ApiParameter, DonauRoute, routeAuthed } from "donau";
import { guardAdmin } from "../service/model/m_account";
import { App, appType } from "../service/model/m_app";
import { AuthUser } from "../service/s_auth";
import { DataService } from "../service/s_data";
import { admin, guard, isNull, projectMember } from "../tools/guard";

export const projectPathParam: ApiParameter = {
  name: "pId",
  in: "path",
  required: true,
  description: "the id of the project",
  type: "string",
};

export const routesApp: DonauRoute<AuthUser>[] = [
  routeAuthed("/list", {
    parameters: [
      projectPathParam,
      {
        name: "project",
        in: "query",
        required: true,
        description: "the id of the project",
        type: "string",
      },
    ],
    description: "get a list of all apps within the project",
    workerAuthed: (user, project) => {
      guardAdmin(user);
      return DataService.i.listApps(project, 1, 100);
    },
  }),
  routeAuthed("/{appId}", {
    description: "get an app by id",
    parameters: [
      projectPathParam,
      {
        name: "appId",
        in: "path",
        required: true,
        description: "the id of the app",
        type: "string",
      },
    ],
    workerAuthed: (user, _, id) => {
      guard(user, admin, projectMember(id));
      return DataService.i.getApp(id);
    },
  }),
  routeAuthed("/{appId}?", {
    method: "post",
    description: "set/create the details of an app",
    parameters: [
      projectPathParam,
      {
        name: "appId",
        in: "path",
        required: false,
        description: "the id of the app. if not set, a new app will be created",
        type: "string",
      },
    ],
    reqBody: {
      description: "app data",
      required: [],
      properties: appType,
    },
    workerAuthed: (user, body: Partial<App>, _, id) => {
      //TODO: check if user is member of project that the app belongs to
      guard(user, admin, isNull(id));
      return { id: DataService.i.setApp(id ? id : null, body) };
    },
  }),

  routeAuthed("/{appId}", {
    method: "delete",
    description: "delete an app by id",
    parameters: [
      projectPathParam,
      {
        name: "appId",
        in: "path",
        required: true,
        description: "the id of the app",
        type: "string",
      },
    ],
    workerAuthed: (user, _, id) => {
      //TODO: check if user is member of project that the app belongs to
      guard(user, admin);
      DataService.i.deleteApp(id);
    },
  }),
];
