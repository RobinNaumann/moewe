import { Signal, useSignal } from "@preact/signals";
import { PlusIcon } from "lucide-react";
import { Spinner } from "..";
import { AuthBit } from "../bit/b_auth";
import { ElbeDialog } from "../elbe/components";
import { DataService, Project } from "../service/s_data";
import { go, showDate, showToast } from "../util";
import { SBit } from "../util/bit/sbit";
import { HeaderView } from "./v_header";

export function HomePage({}) {
  const authBit = AuthBit.use();
  return (
    <div>
      <HeaderView />
      {authBit.map({
        onError: (e) => <div>error: {e}</div>,
        onLoading: () => <Spinner />,
        onData: (user) => (user ? <_HomePage /> : <div>unauth</div>),
      })}
    </div>
  );
}

export function _HomePage() {
  const f = async () => await DataService.i.listOwnProject();
  const { map, ctrl } = SBit(f);

  return (
    <div class="base-limited column cross-stretch-fill">
      <h2>my projects</h2>
      {map.value({
        onData: (projects) => (
          <div class="column cross-stretch-fill">
            {projects.map((project) => (
              <ProjectSnippet project={project} reload={ctrl.reload} />
            ))}
            <ProjectCreateBtn onChange={() => ctrl.reload()} />
          </div>
        ),
      })}
    </div>
  );
}

function ProjectSnippet({
  project,
  reload,
}: {
  project: Project;
  reload: () => void;
}) {
  const openSig = useSignal(false);

  return (
    <div>
      <div
        class="card row-resp main-space-between pointer"
        onClick={go("/project/" + project.id)}
      >
        <div class="column cross-stretch-fill">
          <span class="header-5">{project.name}</span>
          <span>{project.about}</span>
        </div>
        <span class="text-s">
          {showDate(Number.parseInt(`${project.created_at}`))}
        </span>
      </div>
    </div>
  );
}

function ProjectCreateBtn({ onChange }: { onChange: () => void }) {
  const sig = useSignal(null);

  const isValid = (signal: Signal) => {
    return signal.value?.name?.length > 0 && signal.value.about?.length > 0;
  };

  return (
    <div class="column cross-stretch">
      <button class="action" onClick={() => (sig.value = {})}>
        <PlusIcon />
        create project
      </button>
      <ElbeDialog
        title="create project"
        open={sig.value != null}
        onClose={() => (sig.value = null)}
      >
        <div class="column cross-stretch">
          <input
            type="text"
            placeholder="project name"
            onInput={(e) => {
              sig.value = { ...sig.value, name: e.currentTarget.value };
            }}
          />
          <input
            type="text"
            placeholder="about"
            onInput={(e) => {
              sig.value = { ...sig.value, about: e.currentTarget.value };
            }}
          />
          <button
            class={isValid(sig) ? "loud minor" : "loud minor disabled"}
            onClick={async () => {
              if (!isValid(sig)) return;
              try {
                await DataService.i.setProject(null, sig.value);
              } catch (e) {
                showToast("error creating project");
              }
              sig.value = null;
              onChange();
            }}
          >
            create
          </button>
        </div>
      </ElbeDialog>
    </div>
  );
}
