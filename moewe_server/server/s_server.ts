import { bearerAuth, donauServerRun } from "donau";
import express from "express";
import path from "path";
import { apiRoutes } from "../api/e_api";
import { appInfo } from "../app";
import { AuthService } from "../service/s_auth";

export function run() {
  donauServerRun(
    appInfo.server.port,
    {
      info: {
        title: `${appInfo.name ?? "mœwe"} API`,
        version: appInfo.version,
        description: appInfo.description,
      },
      securitySchemes: { bearerAuth },
      auth: AuthService.i.middleware,
      routes: apiRoutes,
      cors: appInfo.server.cors,
    },
    [_assetsExtension, _studioExtension, _helloExtension]
  );
}

function _assetsExtension(app: express.Express) {
  app.use("/assets", express.static(appInfo.server.pathStudio + "/assets"));
}

function _studioExtension(app: express.Express) {
  app.get("*", function (_, response) {
    response.sendFile(
      path.resolve(process.cwd(), appInfo.server.pathStudio, "index.html")
    );
  });
}

function _helloExtension(app: express.Express) {
  app.get("/hello", (req, res) => {
    const ip = req?.socket.remoteAddress;
    res.send("welcome " + ip);
  });
}
