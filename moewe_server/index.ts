import { docuApi } from "./server/docu";
import { apiRoutes } from "./api/e_api";
import { runServer } from "./server/s_server";
import { AuthService } from "./service/s_auth";
import { logger } from "./tools/log";
import { DataService } from "./service/s_data";
import { maybe } from "./tools/util";
import { appInfo, initApp } from "./app";

// initialize the server

if (!initApp()) process.exit(1);

runServer(
  docuApi({ routes: apiRoutes, auth: AuthService.i.middleware }),
  "../studio/dist"
);


