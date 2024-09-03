import { ApiFilterItem, ApiFilters } from "../shared";
import { showToast } from "../util";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewConfig } from "../util/viz/v_viz";

function _7daysAgo() {
  return Date.now() - 7 * 24 * 60 * 60 * 1000;
}

type Inputs = {
  config: ViewConfig | null;
  onChange: (v: ViewConfig) => any;
};
type Data = ViewConfig;

export const initial: ViewConfig = {
  filter: [
    {
      local: false,
      field: "meta.created_at",
      operator: ">",
      value: _7daysAgo(),
    },
  ],
  views: {
    log: {
      vizs: [{ id: "chartTime" }, { id: "loglist" }],
    },
    crash: {
      vizs: [{ id: "chartTime" }],
    },
    event: {
      vizs: [
        { id: "overview_graph", options: {} },
        { id: "map" },
        { id: "keystats" },
        { id: "sessions" },
      ],
    },
  },
};

function _sameId(v: { id: string }, id: string) {
  return v.id.toLowerCase() === id.toLowerCase();
}

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker(): Promise<ViewConfig> {
    let c: ViewConfig = initial;
    try {
      c = {
        ...this.p.config,
        filter: [...(this.p.config?.filter ?? initial.filter)],
        views: { ...(this.p.config?.views ?? initial.views) },
      };
    } catch (e) {}

    if (!c.filter.find((f: ApiFilterItem) => f.field === "meta.created_at")) {
      c.filter.push({
        local: false,
        field: "meta.created_at",
        operator: ">",
        value: _7daysAgo(),
      });
    }

    return c;
  }

  private _emit(d: any) {
    this.p.onChange(d);
    this.bit.emit({ ...d, _key: ((d._key ?? 0) + 1) % 1000 });
  }

  vizMove(view: string, vizId: string, dir: "up" | "down") {
    this.act(async (d) => {
      const m = { ...d };
      const vizs = m.views[view].vizs;
      const i = vizs.findIndex((v) => _sameId(v, vizId));
      if (i < 0) return;
      if (dir === "up" && i === 0) return;
      if (dir === "down" && i === vizs.length - 1) return;

      const e = vizs.splice(i, 1)[0];
      vizs.splice(i + (dir === "down" ? 1 : -1), 0, e);
      this._emit(m);
    });
  }

  vizAdd(view: string, vizId: string) {
    this.act(async (d) => {
      const m = { ...d };
      const vizs = m.views[view].vizs;
      if (vizs.find((v) => _sameId(v, vizId))) {
        showToast("Visualization already added");
        return;
      }
      vizs.push({ id: vizId });
      this._emit(m);
    });
  }

  vizRemove(view: string, vizId: string) {
    this.act(async (d) => {
      const m = { ...d };
      const vizs = m.views[view].vizs;
      m.views[view].vizs = vizs.filter((v) => !_sameId(v, vizId));
      this._emit(m);
    });
  }

  setFilter(filter: ApiFilters) {
    this.act(async (d) => {
      this._emit({
        ...d,
        filter: filter.filter((f) => (f as any).value != null),
      });
    });
  }

  addFilter(...items: ApiFilters) {
    this.act(async (d) => this.setFilter([...d.filter, ...items]));
  }

  setOption(
    view: string,
    vizId: string,
    key: string,
    value: string | number | boolean | null
  ) {
    this.act(async (d) => {
      const m = { ...d };
      const vizs = m.views[view].vizs;
      const v = vizs.find((v) => _sameId(v, vizId));
      if (!v) return;
      if (!v.options) v.options = {};
      v.options[key] = value;
      this._emit(m);
    });
  }
}

export const ViewBit = CtrlBit<Inputs, Data, Ctrl>(
  (p, b) => new Ctrl(p, b),
  "View"
);
