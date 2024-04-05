import { X } from "lucide-react";

export function Box({ children }) {
  return <div class="padded">{children}</div>;
}

export function Card({ children, style = null }) {
  return (
    <div style={style} class="card">
      {children}
    </div>
  );
}

export function Spaced({ amount = 1 }) {
  return <div style={{ width: amount + "rem", height: amount + "rem" }}></div>;
}

export function ElbeDialog({
  title,
  open,
  onClose,
  children,
  _style
}: {
  _style?: string;
  title: string;
  open: boolean;
  onClose: () => void;
  children: any;
}) {
  return (
    <dialog
    onClick={(e) => e.stopPropagation()}
    open={open} style={"text-align: start" +  (_style ?? "")}>
      <div
        class=" card plain-opaque padding-none"
        style="max-width: 40rem; min-width: 10rem"
      >
        <div class="row cross-start padded">
          <div class="flex-1 b" style="margin-top: 0.6rem; font-size: 1.2rem">
            {title}
          </div>
          <button class="integrated" style="width: 3rem" onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}>
            <X />
          </button>
        </div>
        <Spaced amount={0.5} />
        <div class="padded" style="max-height: 80vh; overflow: auto">
        {children}
        </div>
      </div>
    </dialog>
  );
}

export function Separator({}) {
  return (
    <div
      class="plain"
      style="border-width: inherit; border-bottom-width: 0; border-left-width: 0; border-right_width: 0; border-style: solid"
    ></div>
  );
}
