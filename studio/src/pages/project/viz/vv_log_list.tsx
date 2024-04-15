import {
  AlertOctagon,
  AlertTriangle,
  Bug,
  CircleHelp,
  MapIcon,
  Scroll,
  XIcon,
} from "lucide-react";
import { ApiEvent } from "../../../bit/b_events";
import { humanId } from "../../../util/u_hash_to_human";
import { Signal, signal, useSignal } from "@preact/signals";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { ViewBit } from "../../../bit/b_view";
import { Visualization } from "../../../util/viz/v_viz";

const types = {
  debug: {
    color: "#006a89",
    label: "Debug",
    icon: <Bug />,
  },
  info: {
    color: "#1d45a2",
    label: "Info",
    icon: <AlertTriangle />,
  },
  error: {
    color: "#c03940",
    label: "Error",
    icon: <AlertOctagon />,
  },
  warn: {
    color: "#e79400",
    label: "Warning",
    icon: <AlertTriangle />,
  },
  unknown: {
    color: "#30333b",
    label: "unknown",
    icon: <CircleHelp />,
  },
};

const _defaultOpts = {
  showTime: true,
  showSession: true,
  chosenType: null as string,
  chosenSession: null as string
};

export const loglistViz: Visualization<typeof _defaultOpts> = {
  id: "loglist",
  types: ["log"],
  label: "Logs",
  icon: <Scroll />,
  options: [
    {
      key: "showTime",
      label: "show Timestamp",
      type: "boolean",
    },
    {
      key: "showSession",
      label: "show SessionId",
      type: "boolean",
    },
    {
      key: "chosenType",
      label: "selected Type",
      type: "string",
    },
    {
      key: "chosenSession",
      label: "selected Session",
      type: "string",
    },
    
  ],
  defaults: _defaultOpts,
  builder: (data,o,setO) => <_Viz setOption={setO} options={o} events={data.entries} />,
};

function _Viz({
  options,
  events,
  setOption
}: {
  options: typeof _defaultOpts;
  setOption: (key:string, value: any) => any,
  events: ApiEvent[];
}) {
  function filtered() {
    let es = events;
    if (options.chosenType)
      es = es.filter((e) => e.key.toLowerCase() == options.chosenType);
    if (options.chosenSession)
      es = es.filter((e) => e.meta.session == options.chosenSession);
    return es;
  }

  return (
    <div class="column cross-stretch-fill">
      
      {(options.chosenType || options.chosenSession) && <div class="row">
        {options.chosenType && (
          <button onClick={() => setOption("chosenType",null)} class="action">
            <XIcon /> {options.chosenType}
          </button>
        )}
        {options.chosenSession && (
          <button onClick={() => setOption("chosenSession",null)} class="action">
            <XIcon /> {humanId(options.chosenSession)}
          </button>
        )}
      </div>}
      <div class="column cross-stretch-fill gap-quarter">
        {filtered().length == 0 && <div>no logs found</div>}
        {filtered().map((v) => _LogEntry({setOption, options, event: v }))}
      </div>
    </div>
  );
}

function _LogEntry({
  options,
  setOption,
  event,
}: {
  options: typeof _defaultOpts;
  setOption: (key:string, value: any) => any,
  event: ApiEvent;
}) {
  const openSig = useSignal(false);
  return (
    <div
      onClick={() => (openSig.value = !openSig.value)}
      class="row gap-half cross-start pointer"
      style={{
        ...(openSig.value
          ? {
              margin: "0.5rem 0",
              outlineOffset: "0.25rem",
              borderRadius: "0.125rem",
              outline: "1px solid #00000033",
              paddingBottom: "0.125rem"
            }
          : {}),
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOption("chosenType",event.key)
        }}
      >
        <_TypeView type={event.key} />
      </div>
      {options.showTime && <_DateView time={event.meta.created_at} />}

      {options.showSession && (
        <div class="row" style="min-width: 7rem">
          <div
            class="secondary rounded text-s"
            style={{
              padding: "0.2rem 0.3rem",
              marginTop: "0.4rem",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOption("chosenSession",event.meta.session)
            }}
          >
            {humanId(event.meta.session)}
          </div>
        </div>
      )}
      <div
        style={{
          marginTop: "0.3rem",
          width: "100%",
          fontFamily: "monospace",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: openSig.value ? "pre-wrap" : "nowrap",
        }}
       
      >
        {event.data.msg ?? "-"}
      </div>
    </div>
  );
}

function _DateView({ time }: { time: number }) {
  if (!time) return <div />;
  const d = new Date(time).toISOString();
  const sDate = d.split("T")[0];
  const sTime = d.split("T")[1].split(".")[0];

  return (
    <div
      class="column cross-start gap-none text-s"
      style={{
        marginTop: "0.2rem",
        minWidth: "5rem",
      }}
    >
      <div>{sDate}</div>
      <div>{sTime}</div>
    </div>
  );
}

function _TypeView({ type }: { type: string }) {
  let t = types[type.toLowerCase()] ?? null;

  if (t == null) t = types.unknown

  return (
    <div
      class=" b text-s row gap-half tooltipped"
      style={{
        padding: "0.3rem",
        borderRadius: "0.35rem",
        backgroundColor: `${t.color}40`,
        color: `${t.color}`,
      }}
    >
      <div
        class="tooltip"
        style={{
          top: 0,
          overflow: "hidden",
          left: "2.7rem",
          bottom: 0,
          backgroundColor: `white`,
          border: "none",
          padding: 0,
          transform: "unset",
          margin: 0,
          borderRadius: "0.35rem",
        }}
      >
        <div
          class="row cross-center"
          style={{
            height: "100%",
            verticalAlign: "middle",
            padding: "0 0.5rem",
            backgroundColor: `${t.color}40`,
            color: `${t.color}`,
          }}
        >
          {t.label}
        </div>
      </div>
      {t.icon}
      {/* <div class="if-wide">{t.label.toUpperCase()}</div>
       */}
    </div>
  );
}
