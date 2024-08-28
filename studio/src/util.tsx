import { Edit2, HelpCircleIcon, X } from "lucide-react";
import pino from "pino";
import { route } from "preact-router";
import React from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import YAML from "yaml";

const language = navigator.language.substring(0, 2);

export const beeMovie =
  "According to all known laws of aviation, there is no way that a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.";

export const log = pino({ level: "trace" });

export function first<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[0] : null;
}

export function last<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}

export function clone(o: object) {
  return JSON.parse(JSON.stringify(o));
}

export function showDate(timestamp: number | null): string {
  if (timestamp == null) return "-";
  return new Date(timestamp).toLocaleDateString("de-DE");
}

export function showDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("de-DE", {
    month: "2-digit",
    day: "numeric",
  });
}

function hashCode(string: string): number {
  var hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    let chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function pastelColorFromString(string: string): string {
  const hash = hashCode(string);
  const hue = hash % 360;
  return `hsl(${hue}, 30%, 85%)`;
}

export function imsg(languages: L10nMessage): string {
  if (language in languages) {
    return languages[language];
  }
  return languages["en"];
}

type L10nMessage = {
  [key: string]: string;
};

export function listId(): string | null {
  const p = window.location.pathname.replace("/", "");
  if (p.length > 0) {
    return p;
  }
  return null;
}

export function createNewList(): void {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const items = Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  );

  const id = items.slice(0, 4).join("") + "-" + items.slice(4).join("");

  // go the the new list
  window.location.href = "/" + id;
}

export function asString(value: any): string {
  var seen = [];

  return JSON.stringify(value, function (key, val) {
    if (val != null && typeof val == "object") {
      if (seen.indexOf(val) >= 0) {
        return;
      }
      seen.push(val);
    }
    return val;
  });
}

export function go(path: string, replace: boolean = false): () => void {
  return () => route(path, replace);
}

export function Field({
  value = "",
  label,
  placeholder,
  multiline = false,
  classs = "",
  onSubmit,
}: {
  value: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  classs?: string;
  onSubmit: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  function onBlur(e) {
    onSubmit((e.target as HTMLTextAreaElement).value);
    setEditing(false);
  }

  function onEnter(e) {
    if (e.keyCode != 13) return;
    onSubmit((e.target as HTMLTextAreaElement).value);
    setEditing(false);
  }

  return (
    <div class="row cross-center">
      <button class="integrated text-m" onClick={() => setEditing(!editing)}>
        {editing ? <X /> : <Edit2 />}
      </button>
      <div class="flex-1 flex">
        <div class="column cross-stretch gap-none">
          <div
            class={"text-s"}
            style={editing ? "margin-left: 1rem" : "margin-bottom: 0.125rem"}
          >
            {label}
          </div>
          {!editing ? (
            <div
              onClick={() => setEditing(true)}
              class={classs}
              style="white-space: pre-wrap;"
            >
              {value || <i style="opacity: 0.4">{placeholder || label}</i>}
            </div>
          ) : multiline ? (
            <textarea
              autofocus={true}
              style="margin-top: 0.5rem"
              //onKeyPress={onEnter}
              onBlur={onBlur}
              placeholder={placeholder || label}
              type="text"
              class={classs}
            >
              {value}
            </textarea>
          ) : (
            <input
              autofocus={true}
              onKeyPress={onEnter}
              style="margin-top: 0.5rem"
              onBlur={onBlur}
              placeholder={placeholder || label}
              type="text"
              class={classs}
              value={value}
            ></input>
          )}
        </div>
      </div>
    </div>
  );
}

export function difference<T>(a: T[], ...rest: T[][]): T[] {
  return a.filter((x) => !rest.reduce((v, c) => v || c.includes(x), false));
}

export function crop<T>(obj: T, keys: string[], forbiddenKeys: string[]): T {
  const ret: Partial<T> = {};
  for (const k in obj) {
    if (keys.includes(k) && !forbiddenKeys.includes(k)) ret[k] = obj[k];
  }
  return ret as T;
}

export function chooseImageFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/svg+xml";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files[0];
      resolve(file);
    };
    input.click();
  });
}

export function showToast(message: string) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function showConfirmDialog({
  title,
  message,
  okay = false,
}: {
  message: string;
  title: string;
  okay?: boolean;
}): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const dialog = document.createElement("div");
    dialog.classList.add("dialog");
    dialog.innerHTML = `<dialog open>
      <div
        class=" card plain-opaque"
        style="max-width: 30rem; min-width: 10rem"
      >
        <div class="row cross-start">
          <div class="flex-1 b" style="margin-top: 0.47rem; font-size: 1.2rem">
          ${title}
          </div>
          <button class="integrated" style="width: 3rem" onclick="resolve(false)">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x "><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
       <div style="margin-top: 1rem; margin-bottom: 1rem">
        ${message}
        </div>
        <div class="row main-end gap">

      ${
        okay
          ? '<button class="loud" style="padding-left:1rem; padding-right:1rem" onclick="resolve(true)">okay</button>'
          : '<button class="loud minor" style="padding-left:1rem; padding-right:1rem" onclick="resolve(false)">no</button>' +
            '<button class="loud" style="padding-left:1rem; padding-right:1rem" onclick="resolve(true)">yes</button>'
      }
    </div>

      </div>
    </dialog>
  `;
    document.body.appendChild(dialog);
    window["resolve"] = (v) => {
      document.body.removeChild(dialog);
      resolve(v);
    };
  });
}

export function toYAML(jsonObject: any): string {
  const doc = new YAML.Document();
  doc.contents = jsonObject;

  return doc.toString();
}

export function HelpHeader({
  level = 1,
  children,
  help,
}: {
  level: number;
  children: any;
  help: { label: string; body: string };
}) {
  return (
    <div class="row main-space-between">
      {" "}
      {React.createElement(`h${level}`, {
        class: "margin-none flex-1",
        children: children,
      })}
      <button
        class="integrated"
        onClick={() =>
          showConfirmDialog({
            okay: true,
            title: `<b><span style="font-weight: normal">info:</span> ${help.label}</b>`,
            message: help.body,
          })
        }
      >
        <HelpCircleIcon />
      </button>
    </div>
  );
}

export type ResCanvasSize = { width: number; height: number };

function setPadding(
  ctx: CanvasRenderingContext2D,
  size: ResCanvasSize,
  padding: number
): ResCanvasSize {
  padding = padding ?? 0;
  ctx.translate(padding, padding);
  return {
    width: size.width - padding * 2,
    height: size.height - padding * 2,
  };
}

/**
 * a canvas that resizes to its parent element
 */
export function ResCanvas({
  height = 150,
  draw,
  padding = 0,
}: {
  height?: number;
  draw: (ctx: CanvasRenderingContext2D, size: ResCanvasSize) => void;
  padding?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = height ?? 150;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const size = setPadding(
          ctx,
          { width: canvas.width, height: canvas.height },
          padding
        );
        draw(ctx, size);
      }
    }
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}
