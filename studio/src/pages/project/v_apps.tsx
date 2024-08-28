import { Signal, useSignal } from "@preact/signals";
import { ChevronDown, ChevronUp, Edit2, PlusIcon, Trash2 } from "lucide-react";
import { App, AppsBit } from "../../bit/b_apps";
import { ProjectBit } from "../../bit/b_project";
import { ElbeDialog } from "../../elbe/components";
import { DataService } from "../../service/s_data";
import { Field, HelpHeader, showConfirmDialog, showToast } from "../../util";

const _helpApps = {
  label: "apps",
  body: "apps allow you to connect clients to your project. Each app has a unique id and can be configured with flags. Only apps can send events to your project.",
};
const _helpClientSetup = {
  label: "client setup",
  body: "use this information to connect the client to this instance of mœwe",
};
const _helpVersion = {
  label: "version",
  body: "incrementing the build number value will allow you to notify the user that once a new version of the client is available. The build number is value behind the last '+' symbol.",
};
const _helpFlags = {
  label: "flags",
  body: "flags are key-value pairs that can be used to configure the client. The value can be a string, number or boolean.",
};

function _AppCreateBtn({
  projectId,
  onChange,
}: {
  projectId: string;
  onChange: () => void;
}) {
  const sig = useSignal(null);

  const isValid = (signal: Signal) => {
    return signal.value?.name?.length > 0; // && signal.value.platform?.length > 0;
  };

  const createApp = async () => {
    if (!isValid(sig)) return;
    try {
      await DataService.i.setApp(projectId, null, {
        ...sig.value,
        config: {},
        platform: "any",
        project: projectId,
      });
    } catch (e) {
      showToast("error creating app");
    }
    sig.value = null;
    onChange();
  };

  return (
    <div class="column cross-stretch">
      <button class="action" onClick={() => (sig.value = {})}>
        <PlusIcon />
        create app
      </button>
      <ElbeDialog
        title="create app"
        open={sig.value != null}
        onClose={() => (sig.value = null)}
      >
        <div class="column cross-stretch">
          <input
            type="text"
            placeholder="app name (e.g. 'android')"
            onInput={(e) => {
              sig.value = { ...sig.value, name: e.currentTarget.value };
            }}
          />
          <button
            class={isValid(sig) ? "loud minor" : "loud minor disabled"}
            onClick={createApp}
          >
            create
          </button>
        </div>
      </ElbeDialog>
    </div>
  );
}

export function ProjectAppsView({}) {
  const projectBit = ProjectBit.use();

  return projectBit.onData((project) => {
    return (
      <div class={"base-limited column cross-stretch"} style="margin-top: 2rem">
        <HelpHeader level={2} help={_helpApps}>
          Apps
        </HelpHeader>
        <AppsBit.Provide projectId={project.id}>
          <_AppsView />
        </AppsBit.Provide>
      </div>
    );
  });
}

function _AppsView() {
  const appsBit = AppsBit.use();
  const openBit = useSignal(null);

  return appsBit.onData((apps) => {
    return (
      <div class="column cross-stretch">
        {apps.map((app) => (
          <_AppView
            app={app}
            open={openBit.value == app.id}
            toggleOpen={() => {
              openBit.value = openBit.value == app.id ? null : app.id;
            }}
          />
        ))}
        <_AppCreateBtn
          projectId={appsBit.ctrl.p.projectId}
          onChange={() => appsBit.ctrl.reload()}
        />
      </div>
    );
  });
}

function _AppView({
  app,
  open,
  toggleOpen,
}: {
  app: App;
  open?: boolean;
  toggleOpen?: () => void;
}) {
  return (
    <div key={app.id} class="card column cross-stretch">
      <div class="row cross-start main-space-between">
        <h4 class="margin-none" style="margin-top: 0.75rem">
          {app.name}
        </h4>
        <button
          class="action"
          onClick={() => {
            toggleOpen();
          }}
        >
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      {open && (
        <div class="column cross-stretch">
          <div class="row">
            <_DeleteBtn appId={app.id} />
          </div>
          <HelpHeader level={6} help={_helpClientSetup}>
            client setup
          </HelpHeader>
          <_clientInfo app={app} />
          <HelpHeader level={6} help={_helpVersion}>
            version
          </HelpHeader>
          <_versionInfo app={app} />
          <HelpHeader level={6} help={_helpFlags}>
            flags
          </HelpHeader>
          <_flagsInfo app={app} />
        </div>
      )}
    </div>
  );
}

function _DeleteBtn({ appId }: { appId: string }) {
  const appsBit = AppsBit.use();
  return (
    <button
      onClick={async () => {
        const yes = await showConfirmDialog({
          title: "delete app",
          message:
            "are you sure you want to delete this app? All clients connected to that app won't be able to submit events<br/><br/><b>THIS CANNOT BE UNDONE</b>",
        });
        if (yes === true) appsBit.ctrl.deleteApp(appId);
      }}
      class="error minor borderless"
      style="background-color: transparent"
    >
      <Trash2 />
      delete app
    </button>
  );
}

function _clientInfo({ app }: { app: App }) {
  const data = [
    { label: "host", value: location.host.split(":")[0], mono: true },
    { label: "port", value: 80, mono: true },
    { label: "project", value: app.project, mono: true },
    { label: "app", value: app.id, mono: true },
  ];
  return (
    <div class="column cross-stretch gap-half">
      {data.map((d) => (
        <div class="row">
          <div style="width: 6rem">{d.label}:</div>

          <div
            class={" " + (d.mono ? "code" : "text")}
            style={d.mono ? "border: none;" : "margin: 0.3rem 0;"}
          >
            {d.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function _versionInfo({ app }: { app: App }) {
  const appBit = AppsBit.use();
  return (
    <div class="column cross-stretch">
      <div class="row cross-start">
        <Field
          label="version"
          placeholder="e.g. 1.2.3+42"
          value={`${app.config.version ?? ""}`}
          onSubmit={(v) => {
            const parts = v.split("+");
            if (parts.length != 2 || isNaN(parseInt(parts[1])))
              return showToast("invalid version format");
            appBit.ctrl.setFlag(app.id, "version", v);
          }}
        />
      </div>
    </div>
  );
}

function _flagsInfo({ app }: { app: App }) {
  const appBit = AppsBit.use();

  function sortAlphabetically(a: [string, any], b: [string, any]) {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  }

  function typeString(value: any) {
    if (typeof value === "string") return 0;
    if (typeof value === "number") return 1;
    if (typeof value === "boolean") return 2;
    return 3;
  }

  return (
    <div class="column cross-stretch-fill">
      {Object.entries(app.config)
        .sort(sortAlphabetically)
        .map(([key, value]) => {
          return (
            <div
              class="row cross-center card padding-none"
              style={{
                paddingLeft: "1rem",
                opacity: key === "version" ? 0.3 : 1,
              }}
            >
              <div class="flex-1 row">
                {key}
                <div
                  class="text-s secondary rounded"
                  style={{ padding: "0.5rem" }}
                >
                  {["string", "int", "bool", "unknown"][typeString(value)]}
                </div>
              </div>
              <div class="flex-1 b">{value?.toString() ?? "null"}</div>
              <div class="row gap-none">
                {key === "version" ? (
                  <div style="width:3rem" />
                ) : (
                  <_EditFlagBtn
                    appId={app.id}
                    current={{ key, value, type: typeString(value) }}
                  >
                    <Edit2 />
                  </_EditFlagBtn>
                )}
                <button
                  class="action"
                  onClick={() => {
                    appBit.ctrl.setFlag(app.id, key, null);
                  }}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          );
        })}
      <_EditFlagBtn appId={app.id}>
        <PlusIcon />
        add flag
      </_EditFlagBtn>
    </div>
  );
}

function _EditFlagBtn({
  appId,
  children,
  current,
}: {
  appId: string;
  children: any;
  current?: { key: string; value: string | number | boolean; type: number };
}) {
  const appsBit = AppsBit.use();
  const sig = useSignal(null);
  return (
    <div class="column">
      <button
        class="action"
        onClick={() => {
          const v = current ?? { key: "", value: null, type: 0 };
          if (v.type > 2) {
            v.type = 0;
            v.value = "";
          }
          sig.value = v;
        }}
      >
        {children}
      </button>
      <ElbeDialog
        title={current ? "edit flag" : "add flag"}
        open={sig.value != null}
        onClose={() => (sig.value = null)}
      >
        {sig.value != null && (
          <div class="column cross-stretch">
            <input
              type="text"
              placeholder="key"
              value={sig.value.key}
              onInput={(e) =>
                (sig.value = {
                  ...sig.value,
                  key: e.currentTarget.value.toLowerCase().replace(" ", "_"),
                })
              }
            />

            <SelectField
              options={["string", "int", "bool"]}
              value={sig.value.type}
              onChange={(v) => (sig.value = { ...sig.value, type: v })}
            />
            {sig.value.type == 0 && (
              <input
                type="text"
                placeholder="value"
                value={sig.value.value}
                onInput={(e) =>
                  (sig.value = { ...sig.value, value: e.currentTarget.value })
                }
              />
            )}
            {sig.value.type == 1 && (
              <input
                type="number"
                placeholder="value"
                value={sig.value.value}
                onInput={(e) =>
                  (sig.value = { ...sig.value, value: e.currentTarget.value })
                }
              />
            )}
            {sig.value.type == 2 && (
              <input
                type="checkbox"
                checked={sig.value.value}
                onInput={(e) =>
                  (sig.value = { ...sig.value, value: e.currentTarget.checked })
                }
              />
            )}
            <button
              class="loud minor"
              onClick={() => {
                try {
                  if (
                    sig?.value?.key == null ||
                    sig.value.value == null ||
                    sig.value.type == null
                  )
                    return;
                  if (sig.value.key === "version")
                    throw new Error("cannot set version flag");
                  if (sig.value.type == 0) {
                    if (sig.value.value.length == 0)
                      throw new Error("empty string");
                    appsBit.ctrl.setFlag(appId, sig.value.key, sig.value.value);
                  } else if (sig.value.type == 1) {
                    if (isNaN(parseInt(sig.value.value)))
                      throw new Error("not a number");
                    appsBit.ctrl.setFlag(
                      appId,
                      sig.value.key,
                      parseInt(sig.value.value)
                    );
                  } else if (sig.value.type == 2) {
                    appsBit.ctrl.setFlag(
                      appId,
                      sig.value.key,
                      !!sig.value.value
                    );
                  }
                } catch (e) {
                  showToast("could not set flag. check values");
                }
              }}
            >
              {current ? "save" : "add"}
            </button>
          </div>
        )}
      </ElbeDialog>
    </div>
  );
}

export function SelectField({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      class="row gap-none card padding-none main-stetch"
      style="overflow: hidden"
    >
      {options.map((v, i) => (
        <button
          class={`flex-1 sharp ${value === i ? "loud minor" : "action"}`}
          onClick={() => onChange(i)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
