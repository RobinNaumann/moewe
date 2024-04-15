import { ApiDefinition, ApiParameter } from "../server/docu";
import { DataService } from "../service/s_data";
import { admin, guard, projectMember } from "../tools/guard";
import { logger } from "../tools/log";

const _projectParam: ApiParameter = {
  name: "pId",
  in: "path",
  required: true,
  description: "the id of the project",
  type: "string",
};

export const routesEvent: ApiDefinition[] = [
  {
    path: "/list",
    description: "get a list of all events of a project",
    parameters: [
      _projectParam,
      {
        name: "type",
        in: "query",
        required: false,
        description: "the type of the event",
        type: "string",
      },
      {
        name: "date_from",
        in: "query",
        required: false,
        description: "the start of the date range (UnixMS)",
        type: "integer",
      },
      {
        name: "date_end",
        in: "query",
        required: false,
        description: "the end of the date range (UnixMS)",
        type: "integer",
      },
    ],
    workerAuthed: (user, project, type, dateFrom, dateEnd) => {
      guard(user, admin);
      const filters = [];
      if (dateFrom) filters.push({query: "created_at > $date_from",values: {$date_from: dateFrom}});
      if (dateFrom) filters.push({query: "created_at <= $date_to",values: {$date_to: dateFrom}});

      return DataService.i.listEvent(project, type, 1, 1000, filters);
    },
  },
  {
    path: "/:eId",
    description: "get a single event",
    parameters: [
      _projectParam,
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
  },
];
