import { DonauRoute, route } from "donau";
import { readFileSync } from "fs";
import { AuthUser } from "../service/s_auth";

function _getLegal(path: string) {
  try {
    return readFileSync(`data/legal/${path}.html`, "utf8");
  } catch (e) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>moewe server</title>
</head>
<body>
  <div>the ${path} policy is not saved on this server</div>
</body>
    `;
  }
}

export const routesLegal: DonauRoute<AuthUser>[] = [
  route("/terms", {
    description: "get the terms of service as html",
    worker: () => _getLegal("terms"),
  }),
  route("/privacy", {
    description: "get the terms of service as html",
    worker: () => _getLegal("privacy"),
  }),
];
