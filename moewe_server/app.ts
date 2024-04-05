import { CorsOptions } from "cors";
import { logger } from "./tools/log";
import { DataService } from "./service/s_data";
import { maybe } from "./tools/util";
import { file } from "bun";
import fs from "fs";
import { DbService } from "./service/s_db";

const corsOptions: CorsOptions = {
  origin: true,
  //origin: "http://localhost:5173",
  credentials: true,
};

export const appInfo = {
  name: "mœwe",
  version: "0.0.1",
  description: "Server for the moewe app",
  server: {
    cors: corsOptions,
    host: "localhost",
    port: process.env.SERVER_PORT ?? "3183",
    locationDb: "./db/dbip.mmdb",
    db: "./data/data.db",
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    admin: {
      email: process.env.AUTH_ADMIN_EMAIL,
      password: process.env.AUTH_ADMIN_PASSWORD,
    }
  },
  docu: {
    info: {
      title: "mœwe API",
      version: "1.0.0",
      description: "the API for the mœwe app",
    },
  },
  config: {
    allowRegistration: process.env.ALLOW_USER_SIGNUP === "true" || false,
  }
};



/**
 * a function to initialize the server with the provided configuration. 
 * If the configuration is invalid, the function will log an error and return false.
 * @returns true if the server was successfully initialized
 */
export function initApp(): boolean {
  if (!appInfo.auth.secret) {
    logger.fatal("no auth secret provided");
    return false;
  }

  if (!appInfo.auth.admin.email || !appInfo.auth.admin.password) {
    logger.fatal("no admin email provided");
    return false;
  }

  // copy the database from the template if it does not exist
  if(!fs.existsSync(appInfo.server.db)) {
    logger.info("copying database from template...");
    fs.copyFileSync("./db/data.db.template", appInfo.server.db);
  }

  DbService.i.init();

  // create the admin account if it does not exist
  const aD = appInfo.auth.admin;
  const admin = maybe(() => DataService.i.getAccountByEmail(aD.email!));
  if (!admin) {
    logger.info(`creating admin account (${appInfo.auth.admin.email})...`);
    DataService.i.setAccount(null, {
      name: "admin",
      email: aD.email,
      password: aD.password,
      verified: true,
      privilege: 100,
    });
  }

  return true;
}