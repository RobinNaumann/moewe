import { showToast } from "../util";
import { CtrlBit, WorkerControl } from "../util/bit/ctrl_bit";
import { ViewConfig } from "../util/viz/v_viz";

type Inputs = {
  config: ViewConfig;
  onChange: (v: ViewConfig) => any;
};
type Data = ViewConfig;

export const initial: ViewConfig = {
  filter: {
    date_from: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  views: {
    log: {
      vizs: [{ id: "chartTime" }, { id: "loglist" }],
    },
    crash: {
      vizs: [{ id: "chartTime" }],
    },
    event: {
      vizs: [
        { id: "chartTime", options: {} },
        { id: "keystats" },
        { id: "map" },
      ],
    },
  },
};

function _sameId(v: { id: string }, id: string) {
  return v.id.toLowerCase() === id.toLowerCase();
}

class Ctrl extends WorkerControl<Inputs, Data> {
  async worker(): Promise<ViewConfig> {
    return this._validate(this.p.config);
  }

  private _validate(d: any) {

    if(!Number.isFinite(d.filter.date_from)) d.filter.date_from = null;
    if(!Number.isFinite(d.filter.date_to)) d.filter.date_to = null;

    // validate filter
    if (
      !d.filter.date_from ||
      d.filter.date_from > (d.filter.date_to ?? Date.now())
    ) {
      d.filter.date_from = Date.now() - 30 * 24 * 60 * 60 * 1000;
    }

    

    return d;
  }

  private _emit(d: any) {
    d = this._validate(d);
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

  setFilter(key: string, value: any) {
    this.act(async (d) => {
      const f = { ...d.filter };

      if (value === null) delete f[key];
      else f[key] = value;
      this._emit({ ...d, filter: f });
    });
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
