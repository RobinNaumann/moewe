import { ApiEvent } from "../shared";

export interface ItemGroup<K> {
  key: string;
  items: K[];
}

export type EventGroup = ItemGroup<ApiEvent>;

export function groupBy(
  events: ApiEvent[],
  f: (e: ApiEvent) => string
): EventGroup[] {
  const items = events.reduce((p, ev) => {
    const key = f(ev);
    const item = p.find((s) => s.key === key);
    item ? item.items.push(ev) : p.push({ key: key, items: [ev] });
    return p;
  }, []);
  return items;
}
