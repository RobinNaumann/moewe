import { useState } from "preact/hooks";
import { AuthBit } from "../../bit/b_auth";
import { Spinner } from "../..";
import { TriangleAlert } from "lucide-react";
import { HeaderView } from "../v_header";
import { CreateAccountButton } from "../account/v_acc_edit";

export function LoginView({}) {
  const authBit = AuthBit.use();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  return (
    <div>
      <HeaderView />
      {authBit.map({
        onLoading: () => <Spinner />,
        onData: (auth) =>
          auth ? (
            <div style="min-height: 20rem" class="padded centered">
              you're already logged in
            </div>
          ) : (
            <div
              class="base-limited column cross-stretch-fill"
              style="max-width: 300px"
            >
              <h1 style="text-align: center">Login</h1>
              <input
                type="text"
                placeholder="username"
                value={username}
                onInput={(e) => setUsername(e.currentTarget.value)}
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
              <button
                onClick={() => {
                  setError(null);
                  authBit.ctrl.login({ username, password }).catch((e) => {
                    console.log(e);
                    setError("login failed");
                  });
                }}
              >
                login
              </button>
              <CreateAccountButton/>
              {error ? (
                <div class="card row secondary">
                  <TriangleAlert />
                  {error}
                </div>
              ) : null}
            </div>
          ),
      })}
    </div>
  );
}
