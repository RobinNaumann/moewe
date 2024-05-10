import { ReadonlySignal, Signal, computed, useSignal } from "@preact/signals";
import { BitState, Spinner, TriMap } from "./bit";
import { useEffect } from "preact/hooks";
import { ApiError, ifApiError } from "../../service/s_api";
import { log } from "../../util";
import { AlertCircle, AlertOctagon, Home, RotateCcw } from "lucide-react";
import { ElbeDialog } from "../../elbe/components";
import { route } from "preact-router";

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
        if (v.loading) return m.onLoading?.() ?? <Spinner />;
        if (v.error)
          return m.onError?.(v.error) ?? <ErrorView error={v.error} retry={() => reload()}/>;
        return m.onData(v.data);
      });
    }
    return map;
  });

  const onData = (f: (d: D) => preact.JSX.Element) =>
    map.value({
      onData: f,
      onLoading: () => <Spinner />,
      onError: (e) => <ErrorView error={e} retry={() => reload()}/>,
    });

  reload();

  return { s, ctrl: { reload }, map: map, onData: onData };
}

export function ErrorView({ error,retry, debug }: { error: any,retry?: () => any, debug?: boolean }) {
  log.warn("error view: ", error);
  const apiError: ApiError = ifApiError(error) ?? {
    code: 0,
    message: "unknown error",
    data: error,
  };
  return !debug ? (
    <_NiceErrorView apiError={apiError} retry={retry} />
  ) : (
    <div class="column padded card inverse cross-stretch">
      <h3 style="margin: 0">ERROR: {apiError.code}</h3>
      <p>{apiError.message}</p>
      <pre>{JSON.stringify(apiError.data, null, 2)}</pre>
    </div>
  );
}

function _NiceErrorView({ apiError, retry }: { apiError: ApiError, retry?: () => any}) {
  const openSig = useSignal(false);
  return (
    <div class="column padded cross-center" style="margin: 1rem 0">
      <AlertOctagon />
      <h3 style="margin: 0">{apiError.code}</h3>
      <span class="pointer" onClick={() => openSig.value = true}>{apiError.message}</span>
      {retry && <button class="action" onClick={() => retry()}><RotateCcw/> retry</button>}
      {apiError.code === 404 && <button class="action" onClick={() => route("/")}><Home/>go home</button>}
      <ElbeDialog title="error details" open={openSig.value} onClose={() => openSig.value = false}>
      <pre class="card inverse">{JSON.stringify(apiError.data, null, 2)}</pre>
      </ElbeDialog>
    </div>
  );
}
