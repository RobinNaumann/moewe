import { Eraser, RotateCcw, Trash2 } from "lucide-react";
import { route } from "preact-router";
import { ProjectBit } from "../../bit/b_project";
import { Field, HelpHeader, showConfirmDialog } from "../../util";
import { ProjectMembersView } from "./v_members";

function _formatSize(bytes: number | null): string {
  if (bytes === null) return "unknown";
  if (bytes < 1000) return bytes + " bytes";
  if (bytes < 1000 * 1000) return Math.round(bytes / 1000) + " KB";
  return Math.round(bytes / (1000 * 1000)) + " MB";
}

function _ProjectSizeView({
  size,
}: {
  size: {
    limit: number;
    sizes: { type: string; count: number; bytes: number }[];
  };
}) {
  const colors = ["#ffbc42", "#d81159", "#8f2d56", "#218380", "#73d2de"];
  return (
    <div class="column cross-stretch">
      <HelpHeader
        help={{
          label: "project size",
          body: "there is a maximum size for each project. Should your Project exceed the limit, the oldest Values will automatically be removed to make space for new ones. In case you require more space, feel free to reach out.",
        }}
        level={3}
      >
        Size
      </HelpHeader>
      <div class="row gap-half cross-center">
        <b>{_formatSize(size?.sizes?.reduce((a, c) => a + c.bytes, 0))}</b>
        <div style="opacity: 0.5">/</div>
        <div>{_formatSize(size?.limit)}</div>
      </div>
      <div
        class="row gap-none cross-stretch rounded secondary"
        style="height: 1rem; overflow: hidden"
      >
        {size?.sizes.map((s, i) => (
          <div
            style={{
              width: (s.bytes / size.limit) * 100 + "%",
              background: colors[i % colors.length],
            }}
          />
        ))}
      </div>
      <div class="column cross-stretch gap-half">
        {size?.sizes.map((s, i) => (
          <div class="row cross-center">
            <div
              style={{
                backgroundColor: colors[i % colors.length],
                width: ".75rem",
                height: ".75rem",
                borderRadius: "50%",
              }}
            />
            <div class="column gap-none cross-stretch flex-1">
              <b>{s.type}</b>
              <span>
                {_formatSize(s.bytes)} ({s.count} entries)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectSettingsView({}) {
  const projectBit = ProjectBit.use();

  async function resetConfig() {
    const c = await showConfirmDialog({
      title: "reset config",
      message: "are you sure you want to reset the project config?",
    });
    if (!c) return;
    await projectBit.ctrl.resetConfig();
  }

  async function deleteProject() {
    const c = await showConfirmDialog({
      title: "delete project",
      message:
        "are you sure you want to delete the project?<br>this action cannot be undone!",
    });
    if (!c) return;
    await projectBit.ctrl.deleteProject();
    route("/");
  }

  return projectBit.onData((project) => {
    return (
      <div class={"base-limited column cross-stretch gap-3"}>
        <div class="column cross-stretch">
          <h3>information</h3>
          <Field
            label={"name"}
            value={project.name}
            onSubmit={(v) => projectBit.ctrl.setName(v)}
          />
          <Field
            label={"about"}
            value={project.about}
            onSubmit={(v) => projectBit.ctrl.setAbout(v)}
          />
        </div>
        <div class="column cross-stretch">
          <h3>members</h3>
          <ProjectMembersView pId={project.id} />
        </div>
        <_ProjectSizeView size={project.expand.size} />

        <div class="column cross-stretch">
          <h3>actions</h3>
          <button class="action" onClick={resetConfig}>
            <RotateCcw />
            reset config
          </button>
          <button class="action" disabled>
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
