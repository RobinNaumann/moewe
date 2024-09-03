import { logger } from "donau";
import { ApiEvent, ApiFilterItem, ApiFilters } from "../shared";
import { DataService, PrepParam } from "./s_data";

function mapField(field: string): string {
  switch (field) {
    case "meta.created_at":
      return "created_at";
    case "meta.location.city":
      return "meta.city";
    case "meta.location.country":
      return "meta.country";
    default:
      return field;
  }
}

export class FilteredService {
  static readonly i = new FilteredService();

  private constructor() {}

  events(projectId: string, type: string, filter: ApiFilters): ApiEvent[] {
    let params: PrepParam[] = [];

    for (let i = 0; i < filter.length; i++) {
      const e = filter[i];

      if ((e as any).method != null) {
        logger.warning(`skipping join filter`);
        continue;
      }
      const item = e as any as ApiFilterItem;
      item.field = mapField(item.field);

      //sanitize field to only allow alphanumeric characters, _, and .
      const field = item.field.replace(/[^a-zA-Z0-9_.]/g, "").split(".");
      const operator = item.operator.replace(/[^=<>!]/g, "");

      // field is a json field
      if (field.length >= 2) {
        params.push({
          query: `meta->>'$.${field
            .slice(1)
            .join(".")}' ${operator} $value_${i}`,
          values: { [`$value_${i}`]: item.value },
        });
      }
      // field is a normal field
      else {
        params.push({
          query: `${field[0]} ${operator} $value_${i}`,
          values: { [`$value_${i}`]: item.value },
        });
      }
    }

    return DataService.i.listEvent(projectId, type, 1, 1000000, params);
  }
}
