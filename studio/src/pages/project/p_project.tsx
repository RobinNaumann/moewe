import { XIcon } from "lucide-react";
import { ProjectBit } from "../../bit/b_project";
import { Project } from "../../service/s_data";
import { Signal, signal } from "@preact/signals";
import { ViewBit, initial } from "../../bit/b_view";
import { HeaderView } from "../v_header";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { ProjectView, projectViews } from "./v_views";

export function ProjectPage({ id }: { id: string }) {
  return (
    <ProjectBit.Provide _id={id}>
      <_ProjectPage />
    </ProjectBit.Provide>
  );
}

function _ProjectPage() {
  const project = ProjectBit.use();
  return project.map({
    onData: (p) => {
      return (
        <menuState.Provider
          value={{ page: signal("eventView"), open: signal(false) }}
        >
          <div>
            <_Header project={p} />
            <div class="if-narrow">
              <_MenuDialog project={p} />
            </div>
            <div class="row cross-stretch">
              <_WideProjectMenu project={p} />
              <_PagesView />
            </div>
          </div>
        </menuState.Provider>
      );
    },
  });
}

function _Header({ project }: { project: Project }) {
  const openSig = useContext(menuState).open;
  return (
    <HeaderView onMenuClick={() => (openSig.value = !openSig.value)}>
      <span style="font-weight: normal; opacity: 0.4">/</span>
      <span style="font-weight: normal">{project.name}</span>
    </HeaderView>
  );
}

function _MenuDialog({ project }: { project: Project }) {
  const menuSig = useContext(menuState);

  return (
    <div
      class="raised card padding-none column cross-stretch"
      style={`position: fixed; display: ${menuSig.open.value ? "flex" : "none"};
    top: 0; left: 0; bottom: 0; background: white; z-index: 100; width: min(20rem, 100%); border-radius: 0px`}
    >
      <div class="row main-start" style="height: 4rem; padding: 0 1rem">
        <button class="integrated" onClick={() => (menuSig.open.value = false)}>
          <XIcon />
        </button>
        <b class="text-l">menu</b>
      </div>
      <div class="padded" style="height: 100%">
        <_ProjectMenu style="height: 100%; " />
      </div>
    </div>
  );
}

function _PagesView({}) {
  const pBit = ProjectBit.use();
  const page = useContext(menuState).page;

  return pBit.map({
    onData: (p) => {
      console.log(page.value);
      const view = projectViews[page.value as any];
      return (
        <ViewBit.Provide
          config={p?.config?.view ?? initial}
          onChange={(v) => pBit.ctrl.setView(v)}
        >
          {view?.builder?.(view.type) ?? <div>Not implemented</div>}
        </ViewBit.Provide>
      );
    },
  });
}

function _WideProjectMenu({ project }: { project: Project }) {
  const openSig = useContext(menuState).open;

  return (
    <div class="if-wide padded">
      <div
        class="_placeholder"
        style={openSig.value ? "width: 20rem;" : "width: 3rem;"}
      />
      <_ProjectMenu
        style={
          " height: calc(100vh - 5rem); position: fixed; " +
          (openSig.value ? "width: 20rem;" : "width: 3rem;")
        }
      />
    </div>
  );
}

function _ProjectMenu({ style }: { style?: string }) {
  const menuSig = useContext(menuState);

  function _select(id: string) {
    menuSig.page.value = id;
    menuSig.open.value = false;
  }

  return (
    <div
      class="column cross-stretch primary gap-half transed-width"
      style={(style ?? "") + "z-index: 10; padding-bottom: 1rem"}
    >
      {Object.keys(projectViews).map((id) => {
        const view: ProjectView = projectViews[id];
        if (view.bottom) return null;
        return (
          <_MenuItem
            view={view}
            iconOnly={!menuSig.open.value}
            onClick={() => _select(id)}
            selected={id === menuSig.page.value}
          />
        );
      })}
      <div class="flex-1" />
      {Object.keys(projectViews).map((id) => {
        const view: ProjectView = projectViews[id];
        if (!view.bottom) return null;
        return (
          <_MenuItem
            view={view}
            iconOnly={!menuSig.open.value}
            onClick={() => _select(id)}
            selected={id === menuSig.page.value}
          />
        );
      })}
    </div>
  );
}

function _MenuItem({
  view,
  selected,
  iconOnly,
  onClick,
}: {
  view: ProjectView;
  onClick: () => void;
  iconOnly?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      class={
        (selected ? " loud minor " : " integrated ") +
        (iconOnly ? " centered " : " main-start ") +
        (view.builder ? "" : " disabled ")
      }
      style={view.builder ? "" : "opacity: 0.5"}
      onClick={view.builder ? onClick : null}
    >
      <div style={{
        marginTop:  "0.25rem",
        marginLeft: iconOnly ? "0" : "0.125rem",
      }}>{view.icon()}</div>{" "}
      {iconOnly ? null : view.label}
    </button>
  );
}

// PAGES SIGNAL

const menuState = createContext<{
  page: Signal<String>;
  open: Signal<boolean>;
}>(null);
