import { useSignal } from "@preact/signals";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { EventsBit } from "../../bit/b_events";
import { ProjectBit } from "../../bit/b_project";
import { ApiEvent } from "../../shared";
import { HelpHeader, showDate, toYAML } from "../../util";

const _helpFeedback = {
  label: "feedback",
  body: "Here you can see all the feedback that users have given you. This can be recorded using the feedback API endpoint.",
};

export function UserFeedbackView() {
  const projectBit = ProjectBit.use();
  return projectBit.onData((d) => (
    <div class="column base-limited cross-stretch" style="margin-top: 2rem">
      <HelpHeader level={2} help={_helpFeedback}>
        User Feedback
      </HelpHeader>
      <EventsBit.Provide project={d.id} type="feedback" filter={[]}>
        <_UserFeedbackView />
      </EventsBit.Provide>
    </div>
  ));
}

function _UserFeedbackView({}) {
  const openSig = useSignal(null);
  const feedbackBit = EventsBit.use();
  return feedbackBit.onData((d) => {
    return (
      <div class="column cross-stretch" style="margin-top: 2rem">
        {d.events.length === 0 && <div class="minor">No feedback yet</div>}
        {d.events.map((e) => (
          <_FeedbackItem
            event={e}
            open={openSig.value === e.id}
            openToggle={() => {
              openSig.value = openSig.value === e.id ? null : e.id;
            }}
          />
        ))}
      </div>
    );
  });
}

function _FeedbackItem({
  event,
  open,
  openToggle,
}: {
  event: ApiEvent;
  open: boolean;
  openToggle: () => void;
}) {
  const eventBit = EventsBit.use();

  return (
    <div
      class="card transed-height column cross-stretch"
      style="margin-top: 1rem"
    >
      <div class="row">
        <div class="column cross-stretch-fill">
          <div class="header-6">{event.data.title ?? "no title"}</div>
          {
            <div class="row gap-half main-start">
              <div class="b text-s margin-none chip">
                {event.meta.created_at ? showDate(event.meta.created_at) : "-"}
              </div>
              <div class="chip b text-s margin-none info minor">
                {event.data.type ?? "no type"}
              </div>
            </div>
          }
        </div>
        <button class="integrated" onClick={openToggle}>
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      {open && (
        <div class="column cross-stretch">
          <div>{event.data.message}</div>
          <div class="card secondary code" style={"margin-top: 1rem"}>
            {toYAML({
              ...event.data,
              title: undefined,
              message: undefined,
              type: undefined,
            })}
          </div>
          <div class="card secondary code">
            {toYAML({ ...event.meta, created_at: undefined })}
          </div>
          <button
            class="integrated"
            onClick={() => {
              eventBit.ctrl.delete(event.id);
            }}
          >
            <Trash2 />
            delete
          </button>
        </div>
      )}
    </div>
  );
}
