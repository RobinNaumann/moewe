import { Signal } from "@preact/signals";
import {
  BitContext,
  BitState,
  BitUseInterface,
  ProvideBit,
  TWParams,
  TriMap,
  makeBit as mb,
  useBit,
} from "./bit";
import { JSX } from "preact/jsx-runtime";
import { useEffect } from "preact/hooks";

abstract class BitControl<I, DT> {
  p: I;
  bit: TWParams<DT>;

  constructor(p: I, bit: TWParams<DT>) {
    this.bit = bit;
    this.p = p;
  }

  act(fn: (b: DT) => Promise<void>) {
    this.bit.map({
      onData: async (d) => {
        try {
          await fn(d);
        } catch (e) {
          if (e.code && e.message)
            console.error(`[BitERROR] act: ${e.code} (${e.message})`);
          else console.error("[BitERROR] act: ", e);
        }
      },
    });
  }

  /**
   * Clean up resources. This is called once
   * the element is removed from the DOM.
   */
  dispose() {}
}

export abstract class WorkerControl<I, DT> extends BitControl<I, DT> {
  reload: () => Promise<void> = null;

  abstract worker(): Promise<DT>;
}

export abstract class StreamControl<I, DT, Stream> extends BitControl<I, DT> {
  protected stream: Stream;
  abstract listen(): Stream;

  dispose(): void {
    this.disposeStream(this.stream);
  }
  abstract disposeStream(stream: Stream): void;
}

function make<I, DT, C extends BitControl<I, DT>>(
  name: string
): BitContext<C, DT> {
  return mb<C, DT>(name);
}

function use<I, DT, C extends BitControl<I, DT>>(
  b: BitContext<C, DT>
): BitUseInterface<C, DT> {
  return useBit<C, DT>(b);
}

export function CtrlBit<I, DT, C extends BitControl<I, DT>>(
  ctrl: (p: I, d: TWParams<DT>) => C,
  name?: string
): {
  Provide: (props: I & { children: React.ReactNode }) => JSX.Element;
  use: () => BitUseInterface<C, DT>;
} {
  const context = make<I, DT, C>((name || "Unknown") + "Bit");

  function Provide({ children, ...p }: { children: React.ReactNode } & I) {
    return ProvideBit(
      context,
      p,
      async (p, b, c) => {
        b.emitLoading();

        try {
          if (c instanceof WorkerControl) {
            await c.reload();
          }
          if (c instanceof StreamControl) {
            (c as any).stream = c.listen();
          }
        } catch (e) {
          b.emitError(e);
        }
      },

      (p, b) => {
        const c = ctrl(p as I, b);
        // clean up on unmount
        useEffect(() => () => c.dispose(), []);
        if (c instanceof WorkerControl) {
          c.reload = async () => {
            b.emitLoading();
            try {
              b.emit(await c.worker());
            } catch (e) {
              b.emitError(e);
            }
          };
        }
        return c;
      },
      children
    );
  }
  return { Provide: Provide, use: () => use<I, DT, C>(context) };
}
