import { TriangleAlert } from "lucide-react";
import { route } from "preact-router";
import { useState } from "preact/hooks";
import { Spinner } from "../..";
import { AuthBit } from "../../bit/b_auth";
import { go } from "../../util";
import { HeaderView } from "../v_header";

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
            <_LoggedInView />
          ) : (
            <div
              class="base-limited column cross-stretch-fill"
              style="max-width: 300px"
            >
              <h1 style="text-align: center">Login</h1>
              <input
                type="email"
                placeholder="email"
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
              <button class="action" onClick={go("/signup")}>
                <div class="row">
                  <div>create account</div>
                </div>
              </button>
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

function _LoggedInView() {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  route(redirect ?? "/");
  return (
    <div style="min-height: 20rem" class="padded centered">
      you're already logged in
    </div>
  );
}
