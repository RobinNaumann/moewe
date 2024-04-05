import { ApiDefinition, grouped } from "../server/docu";
import { routesAccount } from "./e_account";
import { routesAuth } from "./e_auth";
import { routesLog } from "./e_log";
import { routesProject } from "./e_project";
import { isAdmin } from "../service/m_data";
import { ManageDataService } from "../service/s_manage_data";

export const routesManage: ApiDefinition[] = [
  {
    path: "/config",
    description: "retrieve the configuration of the server. This is only available to the admins",
    workerAuthed: (user) => {
      isAdmin(user);
      return ManageDataService.i.getServerConfig();
    },
  },
  {
    path: "/metrics",
    description: "retrieve different metrics regardning the server. This is only available to the admins",
    workerAuthed: (user) => {
      isAdmin(user);
      return ManageDataService.i.getServerMetrics();
    },
  },
];
