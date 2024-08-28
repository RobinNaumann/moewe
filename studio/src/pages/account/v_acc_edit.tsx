import { useSignal } from "@preact/signals";
import { Plus } from "lucide-react";
import { ElbeDialog } from "../../elbe/components";
import { ApiAccount, DataService } from "../../service/s_data";
import { showToast } from "../../util";

export function CreateAccountButton({ onChanged }: { onChanged?: () => {} }) {
  const editSig = useSignal<Partial<ApiAccount>>(null);

  async function createAccount(account: Partial<ApiAccount>) {
    try {
      const cl = { ...account, id: null };

      await DataService.i.setAccount(null, { ...cl, privilege: 1 });

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
          <Plus />
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
