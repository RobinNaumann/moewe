import { appInfo } from "../app";
import { tables } from "../server/tables";
import { logger } from "../tools/log";
import { PushEvent } from "./m_data";
import { AuthService } from "./s_auth";
import { DbService } from "./s_db";
import maxmind, { CityResponse, Reader } from 'maxmind';

export type ReqMeta = {
  ip?: string;
  port?: number;
};

interface _projectCache {
  lastEvent: number;
  sessionSalt: string;
  //  eventCount: number;
}


const sessionTTL = 1000 * 60 * 60 * 24;

export class LogService {
  static readonly i = new LogService();
  private projectCache: Record<string, _projectCache> = {};
  private _locationLookup: Reader<CityResponse> | null = null;

  private constructor() {
    this.init();
  }
  private async init() {
    this._locationLookup = await maxmind.open<CityResponse>(
      appInfo.server.locationDb
    );
  }

  private _getLocation(reqMeta: ReqMeta):any {
    if (!reqMeta.ip) return null;
    const d = this._locationLookup?.get("79.215.101.205");
    if(!d) return null;
    return {
      city: d.city?.names?.en,
      country: d.country?.iso_code,
      location: {lat: d.location?.latitude, lon: d.location?.longitude},
    };

  }

  // Fix: Add the missing 'prototype' property to the 'Reader' type


  private _generateSessionHash(
    now: number,
    projectId: string,
    event: Partial<PushEvent>,
    meta: ReqMeta
  ) {
    let cache = this.projectCache[projectId];
    if (cache && cache.lastEvent + sessionTTL > now) {
      cache = {
        ...cache,
        lastEvent: now,
      };
    } else {
      cache = { lastEvent: now, sessionSalt: AuthService.i.generateSalt() };
    }

    this.projectCache[projectId] = cache;
    const key = `${meta.ip}-${event.meta?.platform}-${event.meta?.device}`;
    return AuthService.i.hash(key, cache.sessionSalt);
  }

  logEvent(projectId: string, event: Partial<PushEvent>, reqMeta: ReqMeta) {
    const now = Date.now();
    const location = this._getLocation(reqMeta);
    const sessionHash = this._generateSessionHash(
      now,
      projectId,
      event,
      reqMeta
    );
    return DbService.i.set(tables.event, null, {
      project: projectId,
      type: event.type,
      key: event.key,
      created_at: now,
      meta: {
        platform: event.meta?.platform,
        device: event.meta?.device,
        session: sessionHash,
        ...location
      },
      data: event.data,
    });
  }
}
