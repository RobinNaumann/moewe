import { ReadonlySignal, Signal, computed, useSignal } from "@preact/signals";
import { BitState, Spinner, TriMap } from "./bit";
import { useEffect } from "preact/hooks";
import { ApiError, ifApiError } from "../../service/s_api";
import { log } from "../../util";

interface Ctrl {
  reload(): Promise<void>;
}

type _SBitMap<D, R> = ReadonlySignal<
  (m: {
    onLoading?: () => R;
    onError?: (e: any) => R;
    onData: (d: D) => R;
  }) => any
>;

export function SBit<D>(worker: () => Promise<D>): {
  s: Signal<BitState<D>>;
  ctrl: Ctrl;
  map: _SBitMap<D, preact.JSX.Element>;
  onData: (f: (d: D) => any) => any;
} {
  const s = useSignal<BitState<D>>({ loading: true });

  const reload = async () => {
    //s.value = { loading: true };
    try {
      const v = await worker();
      s.value = { data: v, loading: false };
    } catch (e) {
      console.error(e);
      s.value = { error: e, loading: false };
    }
  };

  const map = computed(() => {
    function map<T>(m: {
      onLoading: () => T;
      onError: (e: any) => T;
      onData: (d: D) => T;
    }) {
      return computed(() => {
        const v = s.value;
        if (v.loading)
          return m.onLoading?.() ?? <Spinner/>;
        if (v.error) return m.onError?.(v.error) ?? <ErrorView error={v.error} />;
        return m.onData(v.data);
      });
    }
    return map;
  });

  const onData = (f: (d: D) => preact.JSX.Element) => map.value({ onData: f , onLoading: () => <Spinner/>, onError: (e) => <ErrorView error={e}/>});

  reload();

  return { s, ctrl: { reload }, map: map, onData:onData };
}


export function ErrorView({error}:{error:any}){
  log.warn("error view: ", error);
  const apiError:ApiError = ifApiError(error) ?? {code: 0, message: "unknown error", data: error};
  return <div class="column padded card inverse cross-stretch">
    <h3 style="margin: 0">ERROR: {apiError.code}</h3>
    <p>{apiError.message}</p>
    <pre>{JSON.stringify(apiError.data, null, 2)}</pre>
  </div>;
}