import { ApiDefinition, grouped } from "../server/docu";
import { routesAccount } from "./e_account";
import { routesAuth } from "./e_auth";
import { routesLog } from "./e_log";
import { routesProject } from "./e_project";
import { routesManage } from "./e_manage";

export const apiRoutes: ApiDefinition[] = [
  {
    method: "get",
    path: "/",
    tags: ["root"],
    description: "a welcome message",
    handler: (req,res) => {
      const ip = (req as any).socketInfo?.remoteAddress;
      res.send(welcome);
    },
  },
  ...grouped( routesAuth, {prefix: "/auth",tags:["auth"]}),
  ...grouped( routesAccount, {prefix:"/account",tags:["account"]}),
  ...grouped( routesProject, {prefix:"/project",tags:["project"]}),
  ...grouped(routesLog, {prefix:"/log",tags:["log"]}),
  ...grouped(routesManage, {prefix:"/manage",tags:["manage"]}),
  

];

// welcome message for root path
const welcome = `
<!DOCTYPE html>
<html>
<head>
  <title>moewe server</title>
</head>
<body style="font-family: sans-serif; padding: 3rem; display: flex; flex-direction: column; align-items: center">
  <div> welcome to the moewe server <b>API</b></div>
  <a style="text-decoration: none; font-weight: bold; display: block; margin-top: 1rem; padding: 1rem; border-radius: 0.5rem; background-color: #33333310" href="/docs">documentation</a>
  </body>
</html>
`;
