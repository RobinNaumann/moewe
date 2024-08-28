import { initApp } from "./app";
import { run } from "./server/s_server";

// initialize the server
if (!initApp()) process.exit(1);

run();
