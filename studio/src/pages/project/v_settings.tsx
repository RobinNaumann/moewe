import { Eraser, RotateCcw, Trash2 } from "lucide-react";
import { ProjectBit } from "../../bit/b_project";
import { Field, showConfirmDialog } from "../../util";
import { ProjectMembersView } from "./v_members";
import { Project } from "../../service/s_data";
import { appInfo } from "../../app";
import { route } from "preact-router";

export function ProjectSettingsView({}) {
  const projectBit = ProjectBit.use();

  async function resetConfig() {
    const c = await showConfirmDialog({title: "reset config",message: "are you sure you want to reset the project config?"});
    if (!c) return;
    await projectBit.ctrl.resetConfig();
  }

  async function deleteProject() {
    const c = await showConfirmDialog({title: "delete project",message: "are you sure you want to delete the project?<br>this action cannot be undone!"});
    if (!c) return;
    await projectBit.ctrl.deleteProject();
    route("/");
  }

  return projectBit.onData((project) => {
    return (
      <div class={"base-limited column cross-stretch gap-3"}>
        <div class="column cross-stretch">
          <h3>information</h3>
          <Field label={"name"} value={project.name} onSubmit={(v) => projectBit.ctrl.setName(v)} />
          <Field label={"about"} value={project.about} onSubmit={(v) => projectBit.ctrl.setAbout(v)} />

        </div>
        <div class="column cross-stretch">
          <h3>members</h3>
          <ProjectMembersView pId={project.id} />
        </div>

        <div class="column cross-stretch">
          <h3>actions</h3>
          <button
            class="action"
           onClick={resetConfig}
          >
            <RotateCcw />
            reset config
          </button>
          <button
            class="action"
            disabled
           
          >
            <Eraser />
            delete all events
          </button>
          <button
            class="action"
            onClick={deleteProject}
            style={{
              color: "var(--c-error)",
            }}
          >
            <Trash2 />
            delete project
          </button>
        </div>
      </div>
    );
  });
}