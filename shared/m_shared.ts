export interface ApiFilterItem {
  local: boolean;
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=";
  value: any;
}

export interface ApiFilterJoin {
  method: "and" | "or";
  filters: ApiFilterItem[];
}

export interface ApiFilterOR extends ApiFilterJoin {
  method: "or";
  filters: ApiFilterItem[];
}

export type ApiFilters = (ApiFilterJoin | ApiFilterItem)[];

interface _ApiEvent<T> {
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
      version: string | null;
    };
    location: {
      city: string | null;
      country: string | null;
      lat: number | null;
      lon: number | null;
    };
  };
  data: T;
}

export interface FilterField {
  field: string;
  type: "string" | "number" | "date" | "boolean";
}

export const filterFields: FilterField[] = [
  { field: "app", type: "string" },
  { field: "key", type: "string" },
  { field: "meta.created_at", type: "date" },
  { field: "meta.session", type: "string" },
  { field: "meta.device.platform", type: "string" },
  { field: "meta.device.device", type: "string" },
  { field: "meta.device.version", type: "string" },
  { field: "meta.location.city", type: "string" },
  { field: "meta.location.country", type: "string" },
  { field: "meta.location.lat", type: "number" },
  { field: "meta.location.lon", type: "number" },
];

export interface ApiEvent extends _ApiEvent<any> {}
