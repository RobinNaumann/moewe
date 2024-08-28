import { Trash2 } from "lucide-react";
import { AuthBit } from "../../bit/b_auth";
import { DataService } from "../../service/s_data";
import { ManageDataService } from "../../service/s_data_manage";
import { go, showConfirmDialog, toYAML } from "../../util";
import { SBit } from "../../util/bit/sbit";
import { PrivilegeChip, SetPasswordDialogBtn } from "../account/p_account";
import { CreateAccountButton } from "../account/v_acc_edit";
import { HeaderView } from "../v_header";

export function AdminToolsPage({}) {
  const authBit = AuthBit.use();
  return authBit.onData((d) => (
    <div>
      <HeaderView />
      <div
        class="base-limited column cross-stretch-fill"
        style={{
          marginTop: "3rem",
        }}
      >
        <h2>manage server</h2>
        <MetricsView />
        <ConfigView />
        <AccountsList ownId={d.id} />
        <ProjectsList />
      </div>
    </div>
  ));
}

function AccountsList({ ownId }: { ownId: string }) {
  const accountsBit = SBit(() => DataService.i.listAccount());

  async function deleteAcc(id: string) {
    if (
      !(await showConfirmDialog({
        title: "Delete Account",
        message:
          "Are you sure you want to delete this account?<br><b>This action cannot be undone!</b>",
      }))
    )
      return;
    DataService.i.deleteAccount(id);
    accountsBit.ctrl.reload();
  }

  return accountsBit.onData((d) => (
    <div class="column cross-stretch-fill">
      <h4 style="margin: 0.5rem 0">accounts</h4>
      {d.map((a) => (
        <div class="card row">
          <div style="min-width: 5.5rem">
            <PrivilegeChip p={a.privilege} />
          </div>
          <div class="column cross-stretch flex-1 gap-quarter">
            <b>{a.name}</b>
            <div>{a.email}</div>
          </div>
          {ownId === a.id ? (
            <i class="b">(you)</i>
          ) : (
            <div class="row">
              <SetPasswordDialogBtn
                onSet={async (pw) => {
                  await DataService.i.setAccount(a.id, { password: pw });
                  accountsBit.ctrl.reload();
                }}
              />
              <button class="action" onClick={() => deleteAcc(a.id)}>
                <Trash2 />
              </button>
            </div>
          )}
        </div>
      ))}
      <CreateAccountButton onChanged={() => accountsBit.ctrl.reload()} />
    </div>
  ));
}

function ProjectsList({}) {
  const projectsBit = SBit(() => DataService.i.listProject());

  async function deleteProject(id: string) {
    if (
      !(await showConfirmDialog({
        title: "Delete Project",
        message:
          "Are you sure you want to delete this project?<br><b>This action cannot be undone!</b>",
      }))
    )
      return;
    DataService.i.deleteProject(id);
    await new Promise((r) => setTimeout(r, 1000));
    projectsBit.ctrl.reload();
  }

  return projectsBit.onData((d) => (
    <div class="column cross-stretch-fill">
      <h4 style="margin: 0.5rem 0">projects</h4>
      {d.map((a) => (
        <div class="card row pointer" onClick={go("/project/" + a.id)}>
          <div class="column cross-stretch flex-1 gap-quarter">
            <b>{a.name}</b>
            <div>{a.about}</div>
          </div>
          <div class="row">
            <button
              class="action"
              onClick={(e) => {
                deleteProject(a.id);
                e.stopPropagation();
              }}
            >
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  ));
}

function ConfigView({}) {
  const configBit = SBit(() => ManageDataService.i.getConfig());
  return configBit.onData((d) => (
    <div class="column cross-stretch-fill">
      <h4 style="margin: 0.5rem 0">server configuration</h4>
      <pre class="card inverse mono" style={{ fontFamily: "monospace" }}>
        {toYAML(d)}
      </pre>
    </div>
  ));
}

function MetricsView({}) {
  const metricsBit = SBit<{
    [k: string]: { label: string; value: any; unit?: string };
  }>(() => ManageDataService.i.getMetrics());
  return metricsBit.onData((d) => (
    <div class="column cross-stretch-fill">
      <h4 style="margin: 0.5rem 0">server metrics</h4>
      <div class="row wrap">
        {Object.entries(d).map(([k, v]) => (
          <div class={"card column gap-half"}>
            <div style="font-size: 3rem" class="b action">
              {v?.value ?? "null"}
              {v.unit && (
                <span class="text-s b" style="margin-left: 0.25rem">
                  {v.unit}
                </span>
              )}
            </div>
            <div class="text-small">{v.label}</div>
          </div>
        ))}
      </div>
    </div>
  ));
}
