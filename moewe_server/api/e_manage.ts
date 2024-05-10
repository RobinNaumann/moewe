import { ApiDefinition } from "../server/docu";
import { isAdmin } from "../service/model/m_account";
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
