import {
  ChevronDown,
  ChevronUp,
  Plus,
  Settings2,
  TriangleAlert,
  XIcon,
} from "lucide-react";
import { vizs } from "./d_viz";
import { useSignal } from "@preact/signals";
import { ElbeDialog } from "../../elbe/components";
import { ViewBit } from "../../bit/b_view";
import { ApiEvent, EventsBit } from "../../bit/b_events";

export interface VizViewEntry {
  id: string;
  options?: any;
}

export type ViewFilter = {
  date_from: number;
  //date_to: number;
  [key: string]: any };

export interface ViewConfig {
  filter: ViewFilter;
  _key?: number | null,
  views: {
    [key: string]: {
      vizs: VizViewEntry[];
    };
  };
}

export interface VizOption {
  key: string;
  label: string;
  type: "boolean" | "string" | "number";
}

export interface VizData<T> {
  entries: T[];
  filter: ViewFilter;
}

export interface Visualization<Options> {
  id: string;
  types: ("event" | "log" | "crash")[] | "all";
  label: string;
  icon: any;
  options: VizOption[];
  defaults: Options;
  builder: (data: VizData<ApiEvent>, options: Options, setOption: (key: string, value: any) => any) => any;
}

function _resolveViz<T extends ApiEvent>(viz: VizViewEntry): Visualization<any> {
  return vizs.find((v) => v.id.toLowerCase() === viz.id.toLowerCase());
}

export function VisView({ view }: { view: string; }) {
  const eventsBit = EventsBit.use();
  const viewBit = ViewBit.use();
  return viewBit.map({
    onData: (d) => {
      const viewConf = d.views[view] ?? { filter: null, vizs: [] };

      return (
        <div class="grid">
          {viewConf.vizs.map((viz, i) => {
            const rViz = _resolveViz(viz);
            return (
              <_VizView
                view={view}
                index={{ i: i, max: viewConf.vizs.length ?? 0 }}
                viz={rViz}
                builder={() =>
                  eventsBit.map({
                    onData: (evData) => {
                      const data = {
                        entries: evData.events,
                        filter: d.filter,
                      };
                      return _resolveViz(viz)?.builder(
                        data,
                        { ...rViz.defaults, ...(viz.options ?? {}) },
                        (k,v) => viewBit.ctrl.setOption(view, rViz.id,k,v)
                      );
                    },
                  })
                }
              />
            );
          })}
          <AddVizBtn view={view} />
        </div>
      );
    },
  });
}

function _VizView<O>({
  view,
  index,
  viz,
  builder,
}: {
  view: string;
  index: { i: number; max: number };
  viz?: Visualization<O>;
  builder: () => any;
}) {
  const viewBit = ViewBit.use();
  if (!viz)
    return (
      <div class="card inverse row">
        <TriangleAlert /> unknown Viz
      </div>
    );

  return (
    <div
      class="card column cross-stretch gap-none padding-none viz"
      style="overflow:hidden;"
    >
      <div class="row main-space-between padded">
        <h3 class="margin-none">{viz.label}</h3>

        <div class="row viz-actions">
          {viz.options.length > 0 && <_VizOptionsBtn view={view} viz={viz} />}
          {index.i > 0 && (
            <button
              class="integrated"
              onClick={() => viewBit.ctrl.vizMove(view, viz.id, "up")}
            >
              <ChevronUp />
            </button>
          )}
          {index.i < index.max - 1 && (
            <button
              class="integrated"
              onClick={() => viewBit.ctrl.vizMove(view, viz.id, "down")}
            >
              <ChevronDown />
            </button>
          )}
          <button
            class="integrated"
            onClick={() => viewBit.ctrl.vizRemove(view, viz.id)}
          >
            <XIcon />
          </button>
        </div>
      </div>
      <div
        class="padded"
        style="max-height: 60rem; overflow-y: auto; overflow-x: auto;"
      >
        {builder()}
      </div>
    </div>
  );
}

function _VizOptionsBtn({
  view,
  viz,
}: {
  view: string;
  viz: Visualization<any>;
}) {
  const openSig = useSignal(false);

  return (
    <div>
      <button class="integrated" onClick={() => (openSig.value = true)}>
        <Settings2 />
      </button>
      <ElbeDialog
        _style="visibility: visible"
        title="options"
        open={openSig.value}
        onClose={() => (openSig.value = false)}
      >
        {openSig.value && (
          <div class="column cross-stretch" style="min-width: 20rem">
            {viz.options.map((o) => (
              <OptionView view={view} viz={viz} option={o} />
            ))}
          </div>
        )}
      </ElbeDialog>
    </div>
  );
}

function AddVizBtn({ view }: { view: string }) {
  const viewBit = ViewBit.use();
  const openSig = useSignal(false);

  return viewBit.map({
    onData: (d) => {
      const vs = d.views[view]?.vizs ?? [];
      const avail = vizs.filter((v) => v.types === "all" || v.types.includes(view as any)).filter(
        (v) => !vs.find((vv) => vv.id.toLowerCase() === v.id.toLowerCase())
      );
      return (
        <button
          class="card centered button action"
          onClick={() => (openSig.value = true)}
        >
          <Plus /> add visualization
          <ElbeDialog
            _style="visibility: visible; text-align: start"
            title="add visualization"
            open={openSig.value}
            onClose={() => (openSig.value = false)}
          >
            {openSig.value && (
              <div class="column cross-stretch-fill" style="min-width: 20rem">
                {avail.length < 1 ? (
                  <div class="centered padded">
                    all visualizations are already added
                  </div>
                ) : (
                  avail.map((viz) => {
                    return (
                      <button
                        class="integrated main-start"
                        onClick={(e) => {
                          openSig.value = false;
                          e.stopPropagation();
                          viewBit.ctrl.vizAdd(view, viz.id);
                        }}
                      >
                        {viz.icon}
                        {viz.label}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </ElbeDialog>
        </button>
      );
    },
  });
}

function OptionView({
  view,
  viz,
  option,
}: {
  view: string;
  viz: Visualization<any>;
  option: VizOption;
}) {
  const viewBit = ViewBit.use();

  function onChange(v: any) {
    viewBit.ctrl.setOption(view, viz.id, option.key, v);
  }

  function _onChange(e: any) {
    const value = e.target.value;
    if (option.type === "boolean") {
      onChange(e.target.checked);
    } else if (option.type === "number") {
      onChange(parseFloat(value));
    } else {
      onChange(value);
    }
  }

  return viewBit.map({
    onData: (d) => {
      const vs = d.views[view]?.vizs ?? [];
      const vis = vs.find((v) => v.id.toLowerCase() === viz.id.toLowerCase());
      const v = { ...viz.defaults, ...vis?.options }[option.key] ?? null;
      console.log("OptionView", v);
      return (
        <div class="row main-space-between">
          <div class="column cross-stretch-fill">
            <span class="b">{option.label}</span>
          </div>
          {option.type === "boolean" && (
            <input type="checkbox" checked={v && true} onChange={_onChange} />
          )}
          {option.type === "string" && (
            <input type="text" value={v} onChange={_onChange} />
          )}
          {option.type === "number" && (
            <input type="number" value={v} onChange={_onChange} />
          )}
        </div>
      );
    },
  });
}
