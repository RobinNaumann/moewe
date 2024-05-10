import { PreactContext, createContext } from "preact";
import { useContext, useState } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import logger from "pino";
import { log } from "../../util";
import { Loader2 } from "lucide-react";
import { ErrorView } from "./sbit";

export interface BitUseInterface<C, T> {
  signal: Signal<BitState<T>>;
  ctrl: C;
  map: <D>(m: TriMap<T, D>) => D | preact.JSX.Element;
  onData: (f: (d: T) => any) => any;

}

interface BitData<C, T> {
  ctrl: C;
  state: Signal<BitState<T>>;
}

export interface BitState<T> {
  loading?: boolean;
  error?: any;
  data?: T;
}

export function Spinner() {
  return (
    <div style="margin: 5rem 0" class="centered padded">
      {" "}
      <div class="rotate-box">
        <Loader2 />
      </div>
    </div>
  );
}

export type BitContext<T, C> = PreactContext<BitData<T, C>>;

export interface TriMap<T, D> {
  onLoading?: () => D;
  onError?: (e: string) => D;
  onData?: (value: T) => D;
}

export interface TWParams<T> {
  emit: (t: T) => void;
  emitLoading: () => void;
  emitError: (e: any) => void;
  map: <D>(m: TriMap<T, D>) => D;
  signal: Signal<BitState<T>>;
}

export function makeBit<C, T>(name: string): BitContext<C, T> {
  const c = createContext<BitData<C, T>>(null);
  c.displayName = name;
  return c;
}

export function ProvideBit<I, C, T>(
  context: BitContext<C, T>,
  parameters: I,
  worker: (p: I, d: TWParams<T>, ctrl: C) => void,
  ctrl: (p: I, d: TWParams<T>) => C,
  children: any
) {
  const s = useSignal<BitState<T>>({ loading: true });

  const _set = (n: BitState<T>) => {
    if (JSON.stringify(n) === JSON.stringify(s.peek())) return;
    s.value = n;
  };

  const emit = (data: T) => _set({ data });
  const emitLoading = () => _set({ loading: true });
  const emitError = (error: any) => {
    log.warn(`BIT: ${context.displayName} emitted ERROR`, error);
    return _set({ error });
  };

  function map<D>(m: TriMap<T, D>) {
    const st = s.value;
    if (st.loading) return m.onLoading?.();
    if (st.error) return m.onError?.(st.error);
    return m.onData(st.data);
  }

  const c = ctrl(parameters, { emit, emitLoading, emitError, map, signal: s });
  worker(parameters, { emit, emitLoading, emitError, map, signal: s }, c);

  return (
    <context.Provider value={{ ctrl: c, state: s }}>
      {children}
    </context.Provider>
  );
}

export function useBit<C, T>(context: PreactContext<BitData<C, T>>): BitUseInterface<C, T>{
  try {
    const { ctrl, state } = useContext(context);
    const v = state.value;

    function map<D>(m: TriMap<T, D>) {
      if (v.loading)
        return (m.onLoading || (() => <Spinner />))() || <Spinner />;
      if (v.error)
        return (m.onError || ((e) => <ErrorView error={e} retry={(ctrl as any).reload ?? null}/>))(v.error);
      return m.onData(v.data);
    }

    return {
      signal: state,
      ctrl,
      map,
      /**
       * this is a quality of life function that allows
       * you to chain the map function with the onData function
       * @param f the builder function
       * @returns the built component
       */
      onData: (f: (d: T) => void) => map({ onData: f }),
    };
  } catch (e) {
    const err = `BIT ERROR: NO ${context.displayName} PROVIDED`;
    log.error(err, e);
    return { map: (_: any) => <div>{err}</div>, ctrl: null, signal: null, onData: () => <div>{err}</div>};
  }
}
