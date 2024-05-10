import express from "express";
import swaggerUi from "swagger-ui-express";
import { appInfo } from "../app";
import { AuthUser } from "../service/s_auth";
import { logger } from "../tools/log";
import { err, sendError } from "../tools/error";
import cookieParser from "cookie-parser";
import cors from "cors";

export interface ApiParameter {
  name: string;
  in?: "query" | "path" | "header";
  description: string;
  required: boolean;
  type: string;
}

export interface ApiResponse {
  description: string;
  content: any;
}

export interface ApiRequestBody {
  description: string;
  required?: string[];
  properties: { [key: string]: string };
  examples?: { [key: string]: any };
}

function _toSwaggerBody(body: ApiRequestBody) {
  const props: any = {};
  for (const k in body.properties) {
    props[k] = { type: body.properties[k] };
  }

  const examples: any = {};
  for (const k in body.examples) {
    examples[k] = {
      value: body.examples[k],
    };
  }

  return {
    description: body.description,
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: body.required ?? Object.keys(body.properties),
          properties: props,
        },
        examples: examples,
      },
    },
  };
}

export interface ApiDefinition {
  path: string;
  method?: "get" | "post" | "delete";
  summary?: string;
  description: string;
  tags?: string[];
  parameters?: ApiParameter[];
  reqBody?: ApiRequestBody;
  responses?: { [key: string]: ApiResponse };
  handler?: (req: express.Request, res: express.Response) => void;
  handlerAuthed?: (
    user: AuthUser,
    req: express.Request,
    res: express.Response
  ) => void;
  worker?: (...args:any[]) => any;
  workerAuthed?: (user: AuthUser, ...args: any[]) => any;
}

const _noHandler = (req: express.Request, res: express.Response) => {
  res.send("No handler");
};

var options = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "moewe API docs",
  customfavIcon: "/assets/favicon.ico",
};

const definition = {
  openapi: "3.0.0",
  info: appInfo.docu.info,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  servers: [
    { url: `http://${appInfo.docu.host}:${appInfo.server.port}/api` },
  ],
};

export function docuApi({
  routes,
  auth,
}: {
  routes: ApiDefinition[];
  auth: any;
}) {
  return (e: express.Express) => _docuApi({ e, routes, auth });
}

function _docuApi({
  e,
  routes,
  auth,
}: {
  e: express.Express;
  routes: ApiDefinition[];
  auth: any;
}) {
  const docuRoutes: any = {};
  
  const _api = express.Router({ mergeParams: true });
  e.use((req, res, next) => {
    (req as any).socketInfo = {
      remoteAddress: req.socket.remoteAddress,
      remotePort: req.socket.remotePort,
    };
    next();
  });
  e.use("/api", _api);
  _api.use(cookieParser());
  _api.use(express.json());
  _api.use(cors(appInfo.server.cors));

  for (const a of routes) {

    const authed = a.handlerAuthed != null || a.workerAuthed != null;
    
    const d = {
      [a.method ?? "get"]: {
        ...a,
        parameters: a.parameters?.map((p) => ({ ...p, in: p.in ?? "query" })) ?? [],
        requestBody: a.reqBody ? _toSwaggerBody(a.reqBody) : undefined,
        responses: a.responses ?? { "200": { description: "OK" } },
        security: authed ? [{ bearerAuth: [] }] : undefined,
        worker: undefined,
        workerAuthed: undefined,
        handler: undefined,
        handlerAuthed: undefined,
      },
    };

    docuRoutes[a.path] = {...docuRoutes[a.path], ...d}
   
    const _w = _makeWorker(a, authed);
    authed 
      ? _api[a.method ?? "get"](a.path, auth, _w) 
      : _api[a.method ?? "get"](a.path, _w);
  }

  e.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup({ ...definition, paths: docuRoutes }, options)
  );
}

export function grouped(
  defs: ApiDefinition[],
  { tags, prefix }: { prefix?: string; tags?: string[] }
): any {
  return defs.map((d) => ({
    ...d,
    path: (prefix ?? "") + d.path,
    tags: [...(d.tags ?? []), ...(tags ?? [])],
  }));
}

function _makeWorker(def: ApiDefinition, auth: boolean) {
  return (req: express.Request, res: express.Response) => {
    try {
      const ps:any[] = [];
      if(def.reqBody) ps.push(req.body);

      for (const p of def.parameters ?? []) {
        if (p.in === "path") ps.push(req.params[p.name]);
        if (p.in === "query") ps.push(req.query[p.name]);
      }

      if(auth){
        const user = (req as any).user;
        if(!user) throw err.notAuthorized("no user found in request");
        if(def.workerAuthed){
          const r = def.workerAuthed?.(user, ...ps);
          r instanceof Object ? res.json(r) : res.send(r);
          return;
        }
        def.handlerAuthed?.(user, req, res) ?? _noHandler(req, res);
        return;
      }

      if(def.worker){
          const r = def.worker?.(...ps);
          r instanceof Object ? res.json(r) : res.send(r);
          return;
        }
        def.handler?.(req, res) ?? _noHandler(req, res);

    } catch (e) {
      sendError(res, e);
    }
  };
}