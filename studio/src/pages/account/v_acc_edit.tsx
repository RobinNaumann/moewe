import { useSignal } from "@preact/signals";
import { ApiAccount, DataService } from "../../service/s_data";
import { ElbeDialog } from "../../elbe/components";
import { showToast } from "../../util";
import { AuthService } from "../../service/s_auth";
import { Plus } from "lucide-react";

export function CreateAccountButton({
  viaAdmin,
  onChanged,
}: {
  viaAdmin?: boolean;
  onChanged?: () => {};
}) {
  const editSig = useSignal<Partial<ApiAccount>>(null);

  async function createAccount(account: Partial<ApiAccount>) {
    try {
      const cl = { ...account, id: null };
      if (viaAdmin) {
        await DataService.i.setAccount(null, {...cl, privilege: 1});
      } else {
        if (!cl.email || !cl.password || !cl.name)
          throw new Error("missing fields");
        await AuthService.i.create({
          email: cl.email,
          password: cl.password,
          name: cl.name,
        });
      }

      editSig.value = null;
      showToast("your account was created");
      onChanged?.();
    } catch (e) {
      showToast("failed to create account");
    }
  }

  return (
    <div class="column cross-stretch">
      <button class="action" onClick={() => (editSig.value = {})}>
        <div class="row">
          {viaAdmin && <Plus />}
          <div>create account</div>
        </div>
      </button>
      <ElbeDialog
        title={"create account"}
        open={editSig.value != null}
        onClose={() => (editSig.value = null)}
      >
        <div class="column cross-stretch">
          <input
            type="text"
            placeholder="name"
            value={editSig.value?.name}
            onInput={(e) =>
              (editSig.value = {
                ...editSig.value,
                name: e.currentTarget.value,
              })
            }
          />
          <input
            type="text"
            placeholder="email"
            value={editSig.value?.email}
            onInput={(e) =>
              (editSig.value = {
                ...editSig.value,
                email: e.currentTarget.value,
              })
            }
          />
          <input
            type="password"
            placeholder="password"
            value={editSig.value?.password}
            onInput={(e) =>
              (editSig.value = {
                ...editSig.value,
                password: e.currentTarget.value,
              })
            }
          />
          <button
            disabled={
              !editSig.value?.name ||
              !editSig.value?.email ||
              !editSig.value?.password
            }
            onClick={() => {
              createAccount(editSig.value);
            }}
          >
            {"create"}
          </button>
        </div>
      </ElbeDialog>
    </div>
  );
}
