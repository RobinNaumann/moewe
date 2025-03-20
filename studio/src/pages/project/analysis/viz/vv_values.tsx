import { BracesIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "preact/hooks";
import { ApiEvent } from "../../../../shared";
import { Visualization, VizContext } from "../../../../util/viz/v_viz";

interface _ValueGroup {
  key: any;
  count?: number;
  sub?: _ValueGroup[];
}

const defaultOptions = {};

export const valuesViz: Visualization<typeof defaultOptions> = {
  id: "values",
  types: ["event"],
  label: "Data Values",
  icon: <BracesIcon />,
  options: [],
  defaults: defaultOptions,
  builder: (c) => <_Viz c={c} />,
};

function _Viz({ c }: { c: VizContext<ApiEvent, typeof defaultOptions> }) {
  const keys = Array.from(new Set(c.events.flatMap((e) => e.key)));
  const [key, setKey] = useState<string | null>(keys[0] ?? null);
  return keys.length === 0 ? (
    <div>no data available</div>
  ) : (
    <div class="column cross-stretch">
      <_KeySelector keys={keys} setKey={(k) => setKey(k)} />
      {key && (
        <_DataViewer events={c.events.filter((e) => e.key === key)} key={key} />
      )}
    </div>
  );
}

function _extractData(e: ApiEvent[]): { [key: string]: any[] } {
  const keys = Array.from(new Set(e.flatMap((e) => Object.keys(e.data))));
  const res = {} as { [key: string]: any[] };
  for (const key of keys) {
    res[key] = e.map((e) => e.data[key]);
  }
  return res;
}

function _group(values: any[]) {
  const res: _ValueGroup[] = [];
  for (const v of values) {
    const k = [null, undefined, ""].includes(v) ? null : v;
    const i = res.findIndex((e) => e.key === k);
    if (i === -1) res.push({ key: k, count: 1 });
    else res[i].count++;
  }

  return _nestSameDomain(res.sort((a, b) => b.count - a.count));
}

function _nestSameDomain(groups: _ValueGroup[]) {
  try {
    const res: _ValueGroup[] = [];
    for (const g of groups) {
      if (typeof g.key !== "string" || !g.key.startsWith("http")) {
        res.push(g);
        continue;
      }

      const domain = new URL(g.key).hostname;
      const i = res.findIndex((e) => e.key === domain);
      if (i === -1) {
        res.push({
          key: domain,
          count: g.count,
          sub: [{ key: g.key, count: g.count }],
        });
        continue;
      }

      // add to children
      res[i].sub.push(g);
      res[i].count += g.count;
    }
    return res;
  } catch (e) {
    console.error(e);
    return groups;
  }
}

function _KeySelector({
  keys,
  setKey,
}: {
  keys: string[];
  setKey: (key: string) => void;
}) {
  return (
    <select onChange={(e) => setKey(e.currentTarget.value)}>
      {keys.map((k) => (
        <option value={k}>{k}</option>
      ))}
    </select>
  );
}

function _DataViewer({ events, key }: { events: ApiEvent[]; key: string }) {
  const d = _extractData(events);
  const vals: _ValueGroup[] = [];
  for (const key in d) {
    vals.push({
      key,
      sub: _group(d[key]),
    });
  }
  const max = (g: _ValueGroup) =>
    g.sub?.reduce((m, g) => Math.max(m, g.count), 0) ?? 0;

  return (
    <div class="column cross-stretch">
      {Object.keys(vals).map((k) => (
        <_ValueBar group={vals[k]} max={max(vals[k])} />
      ))}
    </div>
  );
}

function _ValueBar({ group, max }: { group: _ValueGroup; max: number }) {
  const [open, setOpen] = useState(false);
  const width = Math.min(100, Math.max(5, (group.count / max) * 100));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "0.5rem",
      }}
    >
      <div
        class="row"
        style={{
          height: "3rem",
          gap: "1rem",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              borderRadius: "0.3rem",
              position: "absolute",
              width: `${width}%`,
              height: "2rem",
              left: 0,
              opacity: 0.4,
              backgroundColor: "var(--c-accent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              paddingLeft: "0.5rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textWrap: "nowrap",
              fontWeight: group.count ? "normal" : "bold",
            }}
          >
            {group.count && (
              <b style={{ marginRight: ".5rem" }}>{group.count}</b>
            )}
            {group.key ?? <i style={{ opacity: 0.5 }}>no value</i>}
          </div>
        </div>
        {group.sub ? (
          <button
            class="action"
            onClick={() => setOpen(!open)}
            style={{ width: "3rem" }}
          >
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
        ) : (
          <div style={{ width: "3rem" }} />
        )}
      </div>
      {group.sub && open && (
        <div
          class="column"
          style={{
            alignItems: "stretch",
            marginLeft: "1rem",
            gap: ".5rem",
          }}
        >
          {group.sub.map((g) => (
            <_ValueBar group={g} max={max} />
          ))}
        </div>
      )}
    </div>
  );
}
