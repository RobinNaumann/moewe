import { Eraser, RotateCcw, Trash2 } from "lucide-react";
import { ProjectBit } from "../../bit/b_project";
import { Field, showConfirmDialog } from "../../util";
import { ProjectMembersView } from "./v_members";
import { Project } from "../../service/s_data";
import { appInfo } from "../../app";

export function ProjectSettingsView({}) {
  const projectBit = ProjectBit.use();

  async function resetConfig() {
    const c = await showConfirmDialog({title: "reset config",message: "are you sure you want to reset the project config?"});
    console.log(c);
    if (!c) return;
    await projectBit.ctrl.resetConfig();
  }

  async function deleteProject() {
    const c = await showConfirmDialog({title: "delete project",message: "are you sure you want to delete the project?<br>this action cannot be undone!"});
    console.log(c);
    if (!c) return;
    await projectBit.ctrl.deleteProject();
  }

  return projectBit.onData((project) => {
    return (
      <div class={"base-limited column cross-stretch gap-3"}>
        <div class="column cross-stretch">
          <h3>information</h3>
          <Field label={"name"} value={project.name} onSubmit={(v) => projectBit.ctrl.setName(v)} />
          <Field label={"about"} value={project.about} onSubmit={(v) => projectBit.ctrl.setAbout(v)} />
          <h5>client configuration</h5>
          <_clientInfo project={project} />

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

function _clientInfo({project}: {project: Project}) {
  const data = [
    {label: "host", value: location.host.split(":")[0], mono: true},
    {label: "port", value: 80, mono: true},
    {label: "project", value: project.id, mono: true},
    {label: "appId", value: "set a custom id for different clients ('web', 'mobile', etc.)", mono: false},
  ]
  return (
    <div class="card column cross-stretch gap-half">
      
        {data.map((d) => (
          <div class="row">
         <div style="width: 6rem">{d.label}:</div>

         <div class={"flex-1 " + (d.mono ? "code" : "text")} style={d.mono ? "" : "margin: 0.3rem 0"}>{d.value}</div>
         </div>
        ))}
      </div>
  );
}