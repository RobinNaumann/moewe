import { ApiEvent } from "../../../bit/b_events";

interface _Filter{
    label: string;
    type: "date" | "text" | "number" | "boolean";
    local: boolean;
}

interface RemoteFilter extends _Filter{
    local: false;
    query:{
        field: string;
        operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
    }

}

interface LocalFilter extends _Filter{
    local: true;
    filter:(e: ApiEvent, value: any) => boolean;
}

export type VizFilter = RemoteFilter | LocalFilter;
export type VizFilters = {[key:string]: VizFilter};

export const vizFilters: VizFilters = {
    time_from: {
        label: "from",
        type: "date",
        local: false,
        query:{
            field: "created_at",
            operator: ">"
        }
    },
   
    time_to: {
        label: "to",
        type: "date",
        local: false,
        query:{
            field: "created_at",
            operator: "<="
        }
    },

    key: {
        label: "key",
        type: "text",
        local: true,
        filter: (e,v) => v.key.includes(v)
    },
  }