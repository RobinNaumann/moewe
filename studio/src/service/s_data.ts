import { App } from "../bit/b_apps";
import { ProjectMember, ReadProjectMember } from "../bit/b_members";
import { ApiEvent, ApiFilters } from "../shared";
import { ApiService } from "./s_api";

export type eventType = "event" | "log" | "route" | "failure";

export type TypeSize = {
  type: string;
  count: number;
  bytes: number;
};

export interface Project {
  id: string;
  name: string;
  about: string;
  created_at: string;
  config: any;
  expand?: {
    size: {
      limit: number;
      sizes: TypeSize[];
    };
  };
}

export interface ApiAccount {
  id: string;
  email: string;
  name: string;
  privilege: number;
  password?: string;
}

export class DataService {
  static readonly i = new DataService();

  private constructor() {}

  // get projects
  async listOwnProject(): Promise<Project[]> {
    return ApiService.i.get("/project/list_own");
  }

  // get projects
  async listProject(): Promise<Project[]> {
    return ApiService.i.get("/project/list");
  }

  // get project
  async getProject(
    id: string,
    { expandSize = false }: { expandSize: boolean }
  ): Promise<Project> {
    const d = await ApiService.i.get("/project/:id", {
      path: { id: id },
      query: { expand_size: expandSize },
    });
    return { ...d, config: JSON.parse(d.config) };
  }

  // set project
  async setProject(
    id: string | null,
    changes: Partial<Project>
  ): Promise<void> {
    return ApiService.i.post("/project/:id", {
      path: { id: id },
      body: changes,
    });
  }

  // delete project
  async deleteProject(projectId: string): Promise<void> {
    return await ApiService.i.delete("/project/:project", {
      path: { project: projectId },
    });
  }

  // get events
  async filteredEvent(
    projectId: string,
    type: string,
    filter: ApiFilters
  ): Promise<ApiEvent[]> {
    return ApiService.i.post("/project/:project/event/filtered", {
      path: { project: projectId },
      body: { type, filter: filter ?? [] },
    });
  }

  // delete event
  async deleteEvent(eventId: string): Promise<void> {
    return ApiService.i.delete("/event/:id", { path: { id: eventId } });
  }

  // ================== MEMBERS ==================

  // get members
  async listMembers(projectId: string): Promise<ReadProjectMember[]> {
    return ApiService.i.get("/project/:project/member/list", {
      path: { project: projectId },
    });
  }

  // set member
  async setMember(
    projectId: string,
    memberId: string | null,
    member: Partial<ProjectMember>
  ): Promise<string> {
    return ApiService.i.post("/project/:project/member/:mId", {
      path: { project: projectId, mId: memberId },
      body: member,
    });
  }

  // delete member
  async deleteMember(projectId: string, memberId: string): Promise<void> {
    return ApiService.i.delete("/project/:project/member/:mId", {
      path: { project: projectId, mId: memberId },
    });
  }

  // ================== APPS ==================

  // get apps
  async listApp(projectId: string): Promise<App[]> {
    return ApiService.i.get("/project/:project/app/list", {
      path: { project: projectId },
    });
  }

  async setApp(
    projectId: string,
    appId: string | null,
    app: Partial<App>
  ): Promise<string> {
    return ApiService.i.post("/project/:project/app/:appId", {
      path: { project: projectId, appId: appId },
      body: app,
    });
  }

  async deleteApp(projectId: string, appId: string): Promise<void> {
    ApiService.i.delete("/project/:project/app/:appId", {
      path: { project: projectId, appId: appId },
    });
  }

  // ================== ACCOUNT ==================

  // get accounts
  async listAccount(): Promise<ApiAccount[]> {
    return ApiService.i.get("/account/list");
  }

  // get account
  async getAccount(accountId: string): Promise<ApiAccount> {
    return ApiService.i.get("/account/:id", { path: { id: accountId } });
  }

  // set account
  async setAccount(
    accountId: string | null,
    account: Partial<ApiAccount>
  ): Promise<string> {
    return ApiService.i.post("/account/:id", {
      path: { id: accountId },
      body: account,
    });
  }

  // delete account
  async deleteAccount(accountId: string): Promise<void> {
    return ApiService.i.delete("/account/:id", { path: { id: accountId } });
  }
}
