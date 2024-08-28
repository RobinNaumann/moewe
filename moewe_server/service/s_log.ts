import { err } from "donau";
import maxmind, { CityResponse, Reader } from "maxmind";
import { appInfo } from "../app";
import { tables } from "../server/tables";
import { PushEvent } from "./model/m_event";
import { AuthService } from "./s_auth";
import { DbService } from "./s_db";

export type ReqMeta = {
  ip?: string;
  port?: number;
};

interface _projectCache {
  lastEvent: number;
  sessionSalt: string;
  //  eventCount: number;
}

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

  public _getLocation(reqMeta: ReqMeta): any {
    if (!reqMeta.ip) return null;
    const d = this._locationLookup?.get(reqMeta.ip);
    if (!d) return null;
    return {
      city: d.city?.names?.en,
      country: d.country?.iso_code,
      location: { lat: d.location?.latitude, lon: d.location?.longitude },
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
    if (cache && cache.lastEvent + appInfo.config.sessionTTL > now) {
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

  logEvent(appId: string, event: Partial<PushEvent>, reqMeta: ReqMeta) {
    const now = Date.now();
    const location = this._getLocation(reqMeta);
    const sessionHash = this._generateSessionHash(now, appId, event, reqMeta);

    const eventData = {
      app: appId,
      type: event.type,
      key: event.key,
      created_at: now,
      meta: {
        platform: event.meta?.platform,
        device: event.meta?.device,
        session: sessionHash,
        ...location,
      },
      data: event.data,
    };

    this._guardSize(eventData, appInfo.config.eventMaxSize);

    return DbService.i.set(tables.event, null, eventData);
  }

  private _guardSize(d: object, maxKiloByte: number) {
    if (JSON.stringify(d).length > maxKiloByte * 500) {
      throw err.badRequest(
        `the event you logged is too large (max ${maxKiloByte}kb)`
      );
    }
  }
}
