import { ApiDefinition, grouped } from "../server/docu";
import { Account,  guardAdmin,  isAdmin,  projectType } from "../service/m_data";
import { DataService } from "../service/s_data";
import { admin, guard, isNull, projectMember } from "../tools/guard";
import { logger } from "../tools/log";
import { routesEvent } from "./e_event";
import { routesMember } from "./e_member";

export const routesProject: ApiDefinition[] = [
  {
    path: "/list_own",
    description: "get a list of all projects of the user",
    workerAuthed: (user) =>  DataService.i.listOwnProjects(user.id, 1, 100),
  },
  {
    path: "/list",
    description: "get a list of all projects",
    workerAuthed: (user) => {
      guardAdmin(user);
      return DataService.i.listProjects(null, 1, 100);}
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
    ],
    workerAuthed:(user,id) => {
      guard(user,admin, projectMember(id));
      return DataService.i.getProject(user.id,id);
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
        description: "the id of the project. if not set, a new project will be created",
        type: "string",
      },
    ],
    reqBody: {
      description: "project data",
      required: [],
      properties: projectType,
    },
    workerAuthed: (user, body: Partial<Account>, id) => {
      guard(user,admin, isNull(id), projectMember(id));
      logger.debug("set project", user.id, id, body);
        return { id: DataService.i.setProject(user.id,id ? id : null, body)};
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
    workerAuthed:(user,id) => {
      guard(user,admin, projectMember(id));
      return DataService.i.deleteProject(user.id,id);
    },
  },
  ...grouped(routesEvent, {prefix:"/:pId/event",tags:["event"]}),
  ...grouped(routesMember, {prefix:"/:pId/member",tags:["member"]}),
];
