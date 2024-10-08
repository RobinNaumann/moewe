import { DonauRoute, grouped, logger } from "donau";
import { appInfo } from "../app";
import { guardAdmin } from "../service/model/m_account";
import { Project, projectType } from "../service/model/m_project";
import { DataService } from "../service/s_data";
import { ManageDataService } from "../service/s_manage_data";
import { admin, guard, isNull, projectMember } from "../tools/guard";
import { routesApp } from "./e_app";
import { routesEvent } from "./e_event";
import { routesMember } from "./e_member";

export const routesProject: DonauRoute[] = [
  {
    path: "/list_own",
    description: "get a list of all projects of the user",
    workerAuthed: (user) => DataService.i.listOwnProjects(user.id, 1, 100),
  },
  {
    path: "/list",
    description: "get a list of all projects",
    workerAuthed: (user) => {
      guardAdmin(user);
      return DataService.i.listProjects(null, 1, 100);
    },
  },
  {
    method: "get",
    path: "/:pId",
    description: "get a project",
    parameters: [
      {
        name: "pId",
        in: "path",
        required: true,
        description: "the id of the project",
        type: "string",
      },
      {
        name: "expand_size",
        in: "query",
        required: false,
        description: "get the size of the project",
        type: "boolean",
      },
    ],
    workerAuthed: (user, id, expandSize) => {
      guard(user, admin, projectMember(id));
      const p = DataService.i.getProject(id);

      if (expandSize) {
        p.expand = {
          size: {
            limit: appInfo.config.projectMaxSize,
            sizes: ManageDataService.i.getProjectSize(id),
          },
        };
      }

      return p;
    },
  },
  {
    method: "post",
    path: "/:pId?",
    description: "set/create the details of a project",
    parameters: [
      {
        name: "pId",
        in: "path",
        required: false,
        description:
          "the id of the project. if not set, a new project will be created",
        type: "string",
      },
    ],
    reqBody: {
      description: "project data",
      required: [],
      properties: projectType,
    },
    workerAuthed: (user, body: Partial<Project>, id) => {
      guard(user, admin, isNull(id), projectMember(id));
      logger.debug(`set project ${id}`, `userId: ${user.id}`);
      return { id: DataService.i.setProject(user.id, id ? id : null, body) };
    },
  },

  {
    method: "delete",
    path: "/:pId",
    description: "delete a project",
    parameters: [
      {
        name: "pId",
        in: "path",
        required: true,
        description: "the id of the project",
        type: "string",
      },
    ],
    workerAuthed: (user, id) => {
      guard(user, admin, projectMember(id));
      return DataService.i.deleteProject(id);
    },
  },
  ...grouped(routesEvent, { prefix: "/:pId/event", tags: ["event"] }),
  ...grouped(routesMember, { prefix: "/:pId/member", tags: ["member"] }),
  ...grouped(routesApp, { prefix: "/:pId/app", tags: ["app"] }),
];
