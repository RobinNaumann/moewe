import { useComputed, useSignal } from "@preact/signals";
import { CheckCircle2 } from "lucide-react";
import { ApiService } from "../../service/s_api";
import { SignUpService } from "../../service/s_signup";
import { go, showToast } from "../../util";
import { HeaderView } from "../v_header";

export function SignupPage({}) {
  const emailSig = useSignal(null);
  return (
    <div class="base-limited column">
      <HeaderView />
      {!emailSig.value && (
        <>
          <h1>Sign Up</h1>
          <_FormView
            onSuccess={(email) => {
              emailSig.value = email;
            }}
          />
        </>
      )}
      {emailSig.value && (
        <>
          <h1>Verify Email</h1>

          <_VerifyEmailPage
            email={emailSig.value}
            onSuccess={() => {
              emailSig.value = null;
            }}
          />
        </>
      )}
    </div>
  );
}

function _FormView({ onSuccess }: { onSuccess: (email: string) => any }) {
  const formSig = useSignal({
    name: "",
    email: "",
    password: "",
    repeat: "",
    tos: false,
  });
  const validSig = useComputed(() => {
    return (
      formSig.value.tos &&
      formSig.value.email?.length > 0 &&
      formSig.value.email.includes("@") &&
      formSig.value.name?.length > 0 &&
      formSig.value.password?.length > 0 &&
      formSig.value.password === formSig.value.repeat
    );
  });
  return (
    <div class="column cross-stretch" style="width: 18rem">
      <input
        type="text"
        placeholder="your name"
        value={formSig.value.name}
        onInput={(e) =>
          (formSig.value = { ...formSig.value, name: e.currentTarget.value })
        }
      />
      <input
        type="email"
        placeholder="email address"
        value={formSig.value.email}
        onInput={(e) =>
          (formSig.value = { ...formSig.value, email: e.currentTarget.value })
        }
      />
      <div />
      <input
        type="password"
        placeholder="password"
        value={formSig.value.password}
        onInput={(e) =>
          (formSig.value = {
            ...formSig.value,
            password: e.currentTarget.value,
          })
        }
      />
      {formSig.value.password && formSig.value.password.length < 8 && (
        <div class="text-s">password must be at least 8 characters long</div>
      )}
      <input
        type="password"
        placeholder="repeat password"
        value={formSig.value.repeat}
        onInput={(e) =>
          (formSig.value = {
            ...formSig.value,
            repeat: e.currentTarget.value,
          })
        }
      />
      {formSig.value.password !== formSig.value.repeat && (
        <div class="text-s">passwords do not match</div>
      )}

      <div class="row cross-center" style="margin: 1rem 0">
        <div>
          <input
            checked={formSig.value.tos}
            onInput={(e) =>
              (formSig.value = {
                ...formSig.value,
                tos: e.currentTarget.checked,
              })
            }
            type="checkbox"
            style="margin: 0"
          />
        </div>
        <div class="text-s">
          I agree to the{" "}
          <a target="_blank" href={`${ApiService.i.apiURL}/legal/terms`}>
            terms of service
          </a>{" "}
          and{" "}
          <a target="_blank" href={`${ApiService.i.apiURL}/legal/privacy`}>
            privacy policy
          </a>
        </div>
      </div>

      <button
        class={!validSig.value ? "disabled" : ""}
        onClick={
          !validSig.value
            ? null
            : async () => {
                try {
                  await SignUpService.i.request(formSig.value);
                  onSuccess(formSig.value.email);
                } catch (e) {
                  showToast("an error occurred. Check your input.");
                }
              }
        }
      >
        sign up
      </button>
    </div>
  );
}

function _VerifyEmailPage({
  onSuccess,
  email,
}: {
  email;
  onSuccess: () => any;
}) {
  const codeSig = useSignal("");
  const validSig = useComputed(() => codeSig.value?.length > 5);
  const successSig = useSignal(false);
  return successSig.value ? (
    <_VerifySuccess />
  ) : (
    <div class="base-limited column cross-stretch" style="width: 18rem">
      <p>
        A verification email has been sent to <b>{email}</b>. Please enter the
        code below:
      </p>
      <input
        type="text"
        value={codeSig.value}
        onInput={(e) => (codeSig.value = e.currentTarget.value)}
        placeholder="code"
      />

      <button
        class={validSig.value ? "" : "disabled"}
        onClick={
          !validSig.value
            ? null
            : async () => {
                try {
                  await SignUpService.i.verify(email, codeSig.value);
                  successSig.value = true;
                } catch (e) {
                  showToast("an error occurred. Check your input.");
                }
              }
        }
      >
        ok
      </button>
    </div>
  );
}

function _VerifySuccess({}) {
  return (
    <div class="column cross-stretch" style="width: 18rem">
      <div class="column gap-quarter cross-center">
        <CheckCircle2 style="margin-bottom: 1rem" size={48} />
        <span class="header-6">Success!</span>

        <span>Your email has been verified.</span>
      </div>
      <button class="action" onClick={go("login")}>
        login
      </button>
    </div>
  );
}

/*
export function CreateAccountButton({
  onChanged,
}: {
  onChanged?: () => {};
}) {
  const editSig = useSignal<Partial<ApiAccount>>(null);

  async function createAccount(account: Partial<ApiAccount>) {
    try {
      const cl = { ...account, id: null };
      
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
*/
