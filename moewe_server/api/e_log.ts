import { ApiDefinition } from "../server/docu";
import { PushEvent, pushEventType } from "../service/model/m_event";
import { LogService } from "../service/s_log";

export const routesLog: ApiDefinition[] = [
  {
    method: "post",
    path: "/:pId/app/:appId",
    description: "set the data of an event or log",
    parameters: [
      {
        name: "pId",
        in: "path",
        required: true,
        description: "the id of the project",
        type: "string",
      },
      {
        name: "appId",
        in: "path",
        required: true,
        description: "the id of the app. if not set, a new app will be created",
        type: "string",
      }
    ],
    reqBody: {
      description: "event data",
      required: [],
      properties: pushEventType,
    },
    handler: (req, res) => {
      
      let ip = (req as any).socketInfo?.remoteAddress;
      const port = (req as any).socketInfo?.remotePort;
      
      LogService.i.logEvent(req.params.appId as string, req.body as Partial<PushEvent>,{
        ip: Array.isArray(ip) ? ip[0] : ip,
        port: port
       });

       res.json({status: "ok"});
    },
  },
];
