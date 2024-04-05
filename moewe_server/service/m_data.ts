import e from "cors";
import { err } from "../tools/error";
import { AuthUser, userPrivileges } from "./s_auth";

export interface Account {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  privilege: number;

  // private elements:
  password?: string;
  pw_hash?: string;
  pw_salt?: string;
}

export const isAdmin = (a: Account | AuthUser) => a?.privilege ?? 0 >= userPrivileges.admin.id;
export const guardAdmin = (a: Account | AuthUser) => {
  if (!isAdmin(a)) throw err.notAuthorized("not an admin");
};

export const accountType = {
  id: "string",
  email: "string",
  name: "string",
  verified: "boolean",
};

export interface Project {
  id: string;
  name: string;
  about: string;
  created_at: number;
  config: any;
}

export const memberPublicType = {
  account: "string",
  role: "string",
};

export const projectType = {
  id: "string",
  name: "string",
  about: "string",
  created_at: "number",
  config: "object",
};

export interface PushEvent {
  type: string;
  key: string;
  meta: PushMeta;
  data: any;
}

export const pushEventType = {
  project: "string",
  type: "string",
  meta: "object",
  data: "object",
};

export interface PushMeta {
  platform: string;
  device: string;
}

export interface EventMeta extends PushMeta {
  session: string;
  location: string;
}

export interface DbEvent {
  id: string;
  project: string;
  type: string;
  key: string;
  created_at: number;
  meta: {
    platform: string;
    device: string;
    session: string;
    city: string;
    country: string;
    location: {
      lat: number;
      lon: number;
    };
  };
  data: any;
}

export interface ApiEvent {
  id: string;
  project: string;
  type: string;
  key: string | null;
  meta: {
    created_at: number;
    session: string | null;
    device: {
      platform: string | null;
      device: string | null;
    };
    location: {
      city: string | null;
      country: string | null;
      lat: number | null;
      lon: number | null;
    };
  };
  data: any;
}

export function parseEvent(e: DbEvent): ApiEvent {
  return {
    id: e.id,
    project: e.project,
    type: e.type,
    key: e.key,
    meta: {
      created_at: e.created_at,
      session: e.meta?.session,
      device: {
        platform: e.meta?.platform,
        device: e.meta?.device,
      },
      location: {
        city: e.meta?.city,
        country: e.meta?.country,
        lat: e.meta?.location?.lat,
        lon: e.meta?.location?.lon,
      },
    },
    data: e.data,
  }
}
