import { appInfo } from "../app";
import { imsg } from "../util";

export function FooterView() {
  return (
    <div class="footer">
      {imsg({
        en: `${appInfo.name} written by`,
        de: `${appInfo.name} geschrieben von`,
      })}
      &nbsp;
      <a href="https://robbb.in">Robin</a>.<br />v{appInfo.version}{" "}
      <a href={appInfo.repo}>source code</a>
      &nbsp;<a href="https://moewe.app">imprint/impressum</a>
      {/* <div class="i" style="margin-top: 10px">
        developed in{" "}
        <img
          style="height: 1rem; vertical-align: middle; margin-right: 0.5rem"
          src="https://raw.githubusercontent.com/nicolindemann/hamburg-icon/master/hamburg-icon.png"
        />
        Hamburg, Germany
      </div> */}
    </div>
  );
}
