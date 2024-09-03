import { err } from "donau";
import { tables } from "../server/tables";
import { ApiEvent } from "../shared";
import { App } from "./model/m_app";
import { DbEvent, parseEvent } from "./model/m_event";
import { Project } from "./model/m_project";
import { AccountService } from "./s_account";
import { DbFilter, DbService } from "./s_db";

export interface PrepParam {
  query: string;
  values: { [key: string]: any };
}

export function paramOr(params: PrepParam[]): PrepParam {
  const q = params.map((p) => `(${p.query})`).join(" OR ");
  const v = params.reduce((p, e) => ({ ...p, ...e.values }), {});
  return { query: q, values: v };
}

export class DataService {
  static readonly i = new DataService();

  private constructor() {}

  // ============== Project ==============

  setProject(userId: string, id: string | null, project: Partial<Project>) {
    project.config = JSON.stringify(project.config);
    // Update an existing project
    if (id) {
      project.created_at = undefined;
      return DbService.i.set(tables.project, id, project);
    }
    // Create a new project and respective membership entry
    else {
      project.created_at = Date.now();
      const newProjectId = DbService.i.set(tables.project, null, project);
      DbService.i.set(tables.role, null, {
        project: newProjectId,
        account: userId,
        role: "owner",
      });
      return newProjectId;
    }
  }

  deleteProject(id: string) {
    // Delete the project
    DbService.i.delete(tables.project, id);

    // Delete the respective role entries
    DbService.i.deleteQuery(tables.role, {
      where: "project = $project",
      params: { $project: id },
    });
  }

  getProject(id: string) {
    return DbService.i.get(tables.project, id);
  }

  listOwnProjects(userId: string, page: number, pageSize: number) {
    return DbService.i.listQuery(
      tables.project,
      {
        where: "id IN (SELECT project FROM role WHERE account = $account)",
        params: { $account: userId },
      },
      page,
      pageSize
    );
  }

  listProjects(filter: any, page: number, pageSize: number) {
    return DbService.i.list(tables.project, filter, page, pageSize);
  }

  // ============== Project ==============

  setApp(id: string | null, app: Partial<App>) {
    return DbService.i.set(tables.app, id, app);
  }

  deleteApp(id: string) {
    DbService.i.delete(tables.app, id);
  }

  getApp(id: string) {
    return DbService.i.get(tables.app, id);
  }

  listApps(projectId: string, page: number, pageSize: number) {
    return DbService.i.list(
      tables.app,
      {
        where: "project = $project",
        params: { $project: projectId },
      },
      page,
      pageSize
    );
  }

  // ============== EVENT ==============

  getEvent(id: string) {
    return parseEvent(DbService.i.get(tables.event, id));
  }

  listEvent(
    projectId: string,
    type: string | null,
    page: number,
    pageSize: number,
    params: PrepParam[] = []
  ): ApiEvent[] {
    const filter: DbFilter = {
      query: `SELECT e.*
      FROM event as e
      JOIN app as a ON e.app = a.id
      WHERE a.project = $project ${type ? "AND type = $type" : ""} ${params
        .map((p) => `AND ${p.query}`)
        .join(" ")}`,
      params: {
        $project: projectId,
        $type: type,
        ...params.reduce((p, e) => ({ ...p, ...e.values }), {}),
      },
    };
    return DbService.i
      .list(tables.event, filter, page, pageSize)
      .map((e: DbEvent) => parseEvent(e));
  }

  deleteEvent(id: string) {
    DbService.i.delete(tables.event, id);
  }

  // ============== PROJECT MEMBER ==============

  getMember(userId: string, projectId: string, memberId: string) {
    return DbService.i.getQuery(tables.role, {
      where: "project = $project AND account = $account",
      params: { $project: projectId, $account: memberId },
    });
  }

  setMember(
    userId: string,
    projectId: string,
    m: Partial<{ account: string; role: string }>
  ) {
    DbService.i.set(tables.role, null, { ...m, project: projectId });
  }

  deleteMember(userId: string, projectId: string, memberId: string) {
    if (memberId == userId)
      throw err.notAllowed("cannot delete yourself from project");

    DbService.i.deleteQuery(tables.role, {
      where: "project = $project AND account = $account",
      params: { $project: projectId, $account: memberId },
    });
  }

  listMembersRich(
    userId: string,
    projectId: string,
    page: number,
    pageSize: number
  ) {
    return DbService.i
      .listQuery(
        tables.role,
        {
          where: "project = $project",
          params: { $project: projectId },
        },
        page,
        pageSize
      )
      .map((m: any) => {
        try {
          const a = AccountService.i.get(m.account);
          return { ...m, account: a };
        } catch (e) {
          return null;
        }
      })
      .filter((m: any) => m);
  }

  listMembers(
    userId: string,
    projectId: string,
    page: number,
    pageSize: number
  ) {
    return DbService.i.listQuery(
      tables.role,
      {
        where: "project = $project",
        params: { $project: projectId },
      },
      page,
      pageSize
    );
  }
}
