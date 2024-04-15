

import express from "express";
import { appInfo } from "../app";
import { logger } from "../tools/log";
import chalk from "chalk";
import cors from "cors";
import { LogService } from "../service/s_log";

export function runServer(api: (express: express.Express) => void, studioPath: string){
    LogService.i;
    var app = express();
  app.get("/hello", (req, res) => {
    const ip = req?.socket.remoteAddress;
    res.send("welcome " + ip);
  });

    app.use("/", express.static(studioPath));
    api(app);

    try{
        app.listen(appInfo.server.port);
    }
    catch(err){
      return logger.fatal("SERVER: " + err);
      
    }
    logger.success(chalk.bold(appInfo.name) + " server running on port " + chalk.bold(appInfo.server.port));
  }
