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

function _isDocker(): boolean {
  return process.env.DOCKER === "true";
}

function _env<T>(name: string,fallback: T | null, transformer: (v:string) => T | null): T {
  const v = process.env[name];
  if (!v) return fallback!;
  const t = transformer(v);
  if (t === null) return fallback!;
  return t;
}

function _envString(name: string, fallback?: string) : string {
  return _env(name, fallback ?? null, v => v.trim());
}

function _envBool(name: string, fallback?: boolean) : boolean {
  return _env(name, fallback ?? null, v => {
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  });
}

function _envInt(name: string, fallback?: number) : number {
  return _env(name, fallback ?? null, v => {
    const i = parseInt(v);
    if (isNaN(i)) return null;
    return i;
  });
}

export const appInfo = {
  name: "mœwe",
  version: "0.0.1",
  description: "Server for the moewe app",
  server: {
    cors: corsOptions,
    port: _isDocker() ? 80 : _envInt("SERVER_PORT",3183),
    locationDb: "./db/dbip.mmdb",
    db: "./data/data.db",
    pathStudio: _isDocker() ? "./studio/dist" : "../studio/dist",
  },
  auth: {
    secret: _envString("AUTH_SECRET"),
    admin: {
      email: _envString("AUTH_ADMIN_EMAIL"),
      password: _envString("AUTH_ADMIN_PASSWORD"),
    }
  },
  docu: {
    host: _envString("SERVER_HOST", "localhost"),
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