import { DonauRoute, routeAuthed } from "donau";
import { isAdmin } from "../service/model/m_account";
import { AuthUser } from "../service/s_auth";
import { ManageDataService } from "../service/s_manage_data";

export const routesManage: DonauRoute<AuthUser>[] = [
  routeAuthed("/config", {
    description:
      "retrieve the configuration of the server. This is only available to the admins",
    workerAuthed: (user) => {
      isAdmin(user);
      return ManageDataService.i.getServerConfig();
    },
  }),
  routeAuthed("/metrics", {
    description:
      "retrieve different metrics regardning the server. This is only available to the admins",
    workerAuthed: (user) => {
      isAdmin(user);
      return ManageDataService.i.getServerMetrics();
    },
  }),
];
