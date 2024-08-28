import { ApiParameter, DonauRoute } from "donau";
import { App } from "../service/model/m_app";
import { PushEvent, pushEventType } from "../service/model/m_event";
import { DataService } from "../service/s_data";
import { LogService } from "../service/s_log";

const _appParams: ApiParameter[] = [
  {
    name: "projectId",
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
  },
];

export const routesUse: DonauRoute[] = [
  {
    method: "post",
    path: "/log",
    description: "set the data of an event or log",
    parameters: _appParams,
    reqBody: {
      description: "event data",
      required: [],
      properties: pushEventType,
    },
    handler: (req, res) => {
      let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const port = (req as any).socketInfo?.remotePort;

      LogService.i.logEvent(
        req.params.appId as string,
        req.body as Partial<PushEvent>,
        {
          ip: Array.isArray(ip) ? ip[0] : ip,
          port: port,
        }
      );

      res.json({ status: "ok" });
    },
  },
  {
    method: "get",
    path: "/config",
    description: "get information about the app",
    parameters: _appParams,
    worker: (project, appId) => {
      const app: App = DataService.i.getApp(appId);
      return {
        id: app.id,
        name: app.name,
        config: app.config,
      };
    },
  },
];
