export interface DbEvent {
    id: string;
    app: string;
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
    app: string;
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
      app: e.app,
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
  