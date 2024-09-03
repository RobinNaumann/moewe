import { useSignal } from "@preact/signals";
import { KeyRound, LogOut, Trash2 } from "lucide-react";
import { AccountBit } from "../../bit/b_account";
import { AuthBit } from "../../bit/b_auth";
import { ElbeDialog } from "../../elbe/components";
import { Field, go, showConfirmDialog, showToast } from "../../util";
import { HeaderView } from "../v_header";

export const userPrivileges = {
  unknown: {
    id: -1,
    label: "unknown",
    color: "#777777",
  },
  guest: {
    id: 0,
    label: "guest",
    color: "#40b0ff",
  },
  user: {
    id: 1,
    label: "user",
    color: "#004cff",
  },
  admin: {
    id: 100,
    label: "admin",
    color: "#ff00b9",
  },
};

export function AccountPage({ id }: { id: string }) {
  return (
    <div>
      <HeaderView />
      <div
        class="base-limited column cross-stretch-fill"
        style={{
          marginTop: "6rem",
        }}
      >
        <AccountBit.Provide aId={id}>
          <_View />
        </AccountBit.Provide>
      </div>
    </div>
  );
}

function _View() {
  const authBit = AuthBit.use();
  const accBit = AccountBit.use();

  async function _deleteAccount() {
    const c = await showConfirmDialog({
      title: "Delete Account",
      message:
        "Are you sure you want to delete this account?<br><b>This action cannot be undone!</b>",
    });
    if (c) accBit.ctrl.delete();
  }

  return accBit.onData((d) => (
    <div class="row-resp cross-start gap-double">
      <div class="flex-3  column cross-stretch-fill gap-double">
        <div class="column cross-stretch card">
          <h4 class="margin-none">account</h4>
          <div class="row main-start gap-half">
            <b>{d.email}</b>
            <PrivilegeChip p={d.privilege ?? 1} />
          </div>
          <Field label="Name" value={d.name} onSubmit={() => {}} />
          <div class="row-resp main-stretch gap">
            <SetPasswordDialogBtn withText={true} />
            <button
              class="error minor borderless flex-1 row"
              style="background: transparent"
              onClick={_deleteAccount}
            >
              <Trash2 />
              delete account
            </button>
          </div>
        </div>
      </div>
      <div class="flex-1 column cross-stretch-fill">
        <button class="loud minor" onClick={() => authBit.ctrl.logout()}>
          <LogOut />
          log out
        </button>
        {d.privilege >= userPrivileges.admin.id && <AdminActions />}
      </div>
    </div>
  ));
}

export function PrivilegeChip({ p: privilege }: { p: number }) {
  let p = null;
  for (let key in userPrivileges) {
    if (userPrivileges[key].id <= privilege) {
      p = userPrivileges[key];
    }
  }

  if (!p) p = userPrivileges.unknown;

  return (
    <div
      class="chip text-s b"
      style={{
        backgroundColor: p.color + "44",
        margin: "0",
      }}
    >
      {p.label}
    </div>
  );
}

function SetPasswordDialogBtnBit({}) {
  const accBit = AccountBit.use();
  return (
    <SetPasswordDialogBtn
      withText={true}
      onSet={async (pw) => {
        await accBit.ctrl.setPassword(pw);
      }}
    />
  );
}

export function SetPasswordDialogBtn({
  withText = false,
  onSet,
}: {
  withText?: boolean;
  onSet?: (pw: string) => Promise<void>;
}) {
  const pwData = useSignal(null);

  async function _setPassword() {
    if (pwData.value.password !== pwData.value.pwRedo) {
      showToast("passwords do not match!");
      return;
    }

    try {
      await onSet(pwData.value.password);
      showToast("password updated");
      pwData.value = null;
    } catch (e) {
      console.warn("error while setting password", e);
      showToast("failed to set password");
    }
  }

  return (
    <button
      class={"action " + (withText ? "flex-1 row" : "")}
      onClick={() => (pwData.value = {})}
    >
      <KeyRound />
      {withText ? "update password" : null}
      <ElbeDialog
        title="Set Password"
        open={pwData.value !== null}
        onClose={() => {
          pwData.value = null;
        }}
      >
        <div class="column cross-stretch nb">
          <input
            type="password"
            placeholder="new password"
            onInput={(e) => {
              pwData.value = {
                ...pwData.value,
                password: e.currentTarget.value,
              };
            }}
          />
          <input
            type="password"
            placeholder="retype password"
            onInput={(e) => {
              pwData.value = { ...pwData.value, pwRedo: e.currentTarget.value };
            }}
          />
          <button class="action" onClick={_setPassword}>
            set
          </button>
        </div>
      </ElbeDialog>
    </button>
  );
}

function AdminActions() {
  return (
    <div class="column cross-stretch">
      <button class="action" onClick={go("/manage")}>
        admin tools
      </button>
    </div>
  );
}
