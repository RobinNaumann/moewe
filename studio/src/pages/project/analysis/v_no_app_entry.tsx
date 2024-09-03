import { InfoIcon } from "lucide-react";
import { AppsBit } from "../../../bit/b_apps";

export function NoAppEntry() {
  const appsBit = AppsBit.use();
  return appsBit.map({
    onData: (apps) =>
      apps.length === 0 ? (
        <div class="card info">
          <div class="row cross-center">
            <InfoIcon />
            <div class="column gap-quarter cross-stretch">
              <b>No apps</b>
              <span>
                You haven't added any apps to this project yet. Define one on
                the left.
              </span>
            </div>
          </div>
        </div>
      ) : null,
    onLoading: () => null,
    onError: () => null,
  });
}
