import { DonauRoute, grouped } from "donau";
import { AuthUser } from "../service/s_auth";
import { routesAccount } from "./e_account";
import { routesAuth } from "./e_auth";
import { routesLegal } from "./e_legal";
import { routesManage } from "./e_manage";
import { routesProject } from "./e_project";
import { routesUse } from "./e_use";

export const apiRoutes: DonauRoute<AuthUser>[] = [
  {
    method: "get",
    path: "/",
    tags: ["root"],
    description: "a welcome message",
    handler: (req, res) => {
      const ip = (req as any).socketInfo?.remoteAddress;
      res.send(welcome);
    },
  },
  ...grouped(routesAuth, { prefix: "/auth", tags: ["auth"] }),
  ...grouped(routesAccount, { prefix: "/account", tags: ["account"] }),
  ...grouped(routesProject, { prefix: "/project", tags: ["project"] }),
  ...grouped(routesUse, { prefix: "/use/:projectId/:appId", tags: ["log"] }),
  ...grouped(routesManage, { prefix: "/manage", tags: ["manage"] }),
  ...grouped(routesLegal, { prefix: "/legal", tags: ["legal"] }),
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
