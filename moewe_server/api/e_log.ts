import { ApiDefinition } from "../server/docu";
import {  PushEvent,  pushEventType } from "../service/m_data";
import { LogService } from "../service/s_log";
import { logger } from "../tools/log";

export const routesLog: ApiDefinition[] = [
  {
    method: "post",
    path: "/:project",
    description: "set the data of an event or log",
    parameters: [
      {
        name: "project",
        in: "path",
        required: false,
        description: "the id of the project. if not set, a new project will be created",
        type: "string",
      },
    ],
    reqBody: {
      description: "event data",
      required: [],
      properties: pushEventType,
    },
    handler: (req, res) => {
      
      let ip = (req as any).socketInfo?.remoteAddress;
      const port = (req as any).socketInfo?.remotePort;

      res.json({status: "ok"});
      
      LogService.i.logEvent(req.params.project as string, req.body as Partial<PushEvent>,{
        ip: Array.isArray(ip) ? ip[0] : ip,
        port: port
       });
    },
  },
];
