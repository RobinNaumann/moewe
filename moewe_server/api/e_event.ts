import { DonauRoute, routeAuthed } from "donau";
import { AuthUser } from "../service/s_auth";
import { DataService } from "../service/s_data";
import { FilteredService } from "../service/s_filtered";
import { admin, guard, projectMember } from "../tools/guard";
import { projectPathParam } from "./e_app";

export const routesEvent: DonauRoute<AuthUser>[] = [
  routeAuthed("/filtered", {
    method: "post",
    description: "get a list of all events of a project",
    parameters: [projectPathParam],
    reqBody: {
      description: "project data",
      required: [],
      properties: {
        type: "string",
        filter: "object",
      },
    },
    workerAuthed: (user, body, project) => {
      guard(user, admin, projectMember(project));
      return FilteredService.i.events(project, body.type, body.filter);
    },
  }),

  routeAuthed("/{eId}", {
    description: "get a single event",
    parameters: [
      projectPathParam,
      {
        name: "eId",
        in: "path",
        required: true,
        description: "the id of the event",
        type: "string",
      },
    ],
    workerAuthed: (user, pId, id) => {
      guard(user, admin, projectMember(pId));
      return DataService.i.getEvent(id);
    },
  }),
];
