import { LogOut, MenuIcon, User } from "lucide-react";
import { route } from "preact-router";
import { AuthBit } from "../bit/b_auth";
import { useEffect, useState } from "preact/compat";
import { go } from "../util";

export function HeaderView({onMenuClick, children}: {onMenuClick?: () => void, children?: any}) {
  const authB = AuthBit.use();
  const [isScrolledTop, setIsScrolled] = useState(false);

  useEffect(() => {
    const _handle = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", _handle);
    return () => {
      window.removeEventListener("scroll", _handle);
    };
  }, []);

  return (
    <div>
      <div style="height: 4rem"></div>
      <div
        class="header"
        style={isScrolledTop ? null : "border-color: transparent"}
      >
        <div class="row cross-center flex-1 " >
          {onMenuClick && <button class="integrated" onClick={onMenuClick}><MenuIcon/></button>}
          <Logo _style=" margin-top: 0.5rem" onTap={goHome} />
          {children}
        </div>
        <ProfileButton />
      </div>
    </div>
  );
}

export function Logo({ _style,onTap }: { _style?: string,onTap?: () => void}) {
  return (
    <div style={"font-weight: normal; " + (onTap ? "cursor: pointer" : "")} onClick={onTap}>
      <img
        src="/assets/moewe_logo.png"
        style={`height: 1rem; ${_style ?? ""}`}
      />
    </div>
  );
}

function goHome() {
  route("/");
}

function ProfileButton() {
  const authBit = AuthBit.use();

  return authBit.map({
    onLoading: () => <div />,
    onError: (e) => <div />,
    onData: (auth) =>
      auth ? (
        <button class="integrated" onClick={go("/account/" + auth.id)}>
          <div class="if-wide">{auth.name ?? ""}</div>
          <User />
        </button>
      ) : null,
  });
}
