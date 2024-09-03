import { Loader2 } from "lucide-react";
import { Component, render } from "preact";
import { Route, Router, route } from "preact-router";
import { useEffect } from "preact/hooks";
import "../style/base.scss";
import "../style/elbe/elbe.scss";
import "../style/google.scss";
import { AuthBit } from "./bit/b_auth";
import { FooterView } from "./elbe/v_footer";
import { AccountPage } from "./pages/account/p_account";
import { AdminToolsPage } from "./pages/admin/p_admin_tools";
import { LoginView } from "./pages/login/p_login";
import { HomePage } from "./pages/p_home";
import { ProjectPage } from "./pages/project/p_project";
import { SignupPage } from "./pages/signup/p_signup";
import { AuthService, AuthState } from "./service/s_auth";

function _Router({}) {
  return (
    <Router>
      <Route path="/login" component={LoginView} />
      <Route path="/signup" component={SignupPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/project/:id" component={ProjectPage} />
      <ProtectedRoute path="/account/:id" component={AccountPage} />
      <ProtectedRoute path="/manage/" component={AdminToolsPage} />
    </Router>
  );
}
// <ProtectedRoute path="/project/:id" component={GardenPage} />

class App extends Component {
  async componentDidMount() {
    // Check if user is authenticated here
    let user = null;
    try {
      user = await AuthService.i.get();
      console.log("User is authenticated", user);
    } catch (e) {}
    this.guard(window.location.pathname, user ?? null);
  }

  guard(url: string, user: AuthState) {
    if (user) return;
    console.log("Redirecting to login");
    route("/login", true);
  }

  render() {
    return (
      <div>
        <_Router />
        <FooterView />
        <div style="height:0px width: 0px; border: solid 1px transparent"></div>
      </div>
    );
  }
}

function Root() {
  return (
    <div class="content-base elbe-base primary">
      <AuthBit.Provide>
        <App />
      </AuthBit.Provide>
    </div>
  );
}

export function Spinner() {
  return (
    <div style="margin: 5rem 0" class="centered padded">
      {" "}
      <div class="rotate-box">
        <Loader2 />
      </div>
    </div>
  );
}

function ProtectedRoute(props: any) {
  const { map } = AuthBit.use();

  const isLoggedIn = map({
    onData: (d) => !!d,
    onError: (e) => false,
    onLoading: () => false,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      const currentPath = encodeURIComponent(window.location.pathname);
      route(`/login?redirect=${currentPath}`, true);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;
  return <Route {...props} />;
}

render(<Root />, document.getElementById("app"));
