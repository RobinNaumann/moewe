import { CorsOptions } from "cors";
import { logger } from "donau";
import { AccountService } from "./service/s_account";
import { DbService } from "./service/s_db";
import { maybe } from "./tools/util";

const corsOptions: CorsOptions = {
  origin: true,
  credentials: true,
};

function _isDocker(): boolean {
  console.log("docker", process.env.DOCKER);
  return process.env.DOCKER === "true";
}

function _env<T>(
  name: string,
  fallback: T | null,
  transformer: (v: string) => T | null
): T {
  const v = process.env[name];
  if (!v) return fallback!;
  const t = transformer(v);
  if (t === null) return fallback!;
  return t;
}

function _envString(name: string, fallback?: string): string {
  return _env(name, fallback ?? null, (v) => v.trim());
}

function _envBool(name: string, fallback?: boolean): boolean {
  return _env(name, fallback ?? null, (v) => {
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  });
}

function _envInt(name: string, fallback?: number): number {
  return _env(name, fallback ?? null, (v) => {
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
    port: _isDocker() ? 80 : _envInt("SERVER_PORT", 3183),
    locationDb: "./db/dbip.mmdb",
    db: "./data/data.db",
    pathStudio: _isDocker() ? "./studio/dist" : "../studio/dist",
  },
  auth: {
    secret: _envString("AUTH_SECRET"),
    admin: {
      email: _envString("AUTH_ADMIN_EMAIL"),
      password: _envString("AUTH_ADMIN_PASSWORD"),
    },
  },
  docu: {
    host: _envString("SERVER_HOST", "localhost"),
    info: {
      title: "mœwe API",
      version: "1.2.0",
      description: "the API for the mœwe app",
    },
  },
  email: {
    host: _envString("EMAIL_HOST"),
    address: _envString("EMAIL_ADDRESS"),
    password: _envString("EMAIL_PASSWORD"),
  },
  config: {
    allowRegistration: process.env.ALLOW_USER_SIGNUP === "true" || false,
    eventMaxSize: _envInt("EVENT_MAX_SIZE", 1000),
    projectMaxSize: _envInt("PROJECT_MAX_SIZE", 1000 * 1000 * 50),
    sessionTTL: _envInt("SESSION_TTL", 1000 * 60 * 60 * 1),
  },
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

  DbService.i.init();

  // create the admin account if it does not exist
  const aD = appInfo.auth.admin;
  const admin = maybe(() => AccountService.i.getByEmail(aD.email!));
  if (!admin) {
    logger.info(`creating admin account (${appInfo.auth.admin.email})...`);
    AccountService.i.set(null, {
      name: "admin",
      email: aD.email,
      password: aD.password,
      privilege: 100,
    });
  }

  return true;
}
