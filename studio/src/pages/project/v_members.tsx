import { Eraser, RotateCcw, Trash2 } from "lucide-react";
import { ProjectBit } from "../../bit/b_project";
import { Field, showConfirmDialog } from "../../util";
import { MembersBit, ReadProjectMember } from "../../bit/b_members";
import { AuthBit } from "../../bit/b_auth";

export function ProjectMembersView({ pId }: { pId: string }) {
  return (
    <MembersBit.Provide pId={pId}>
      <_View />
    </MembersBit.Provide>
  );
}

function _View() {
  const authBit = AuthBit.use();
  const membersBit = MembersBit.use();
  return authBit.onData((auth) =>
    membersBit.onData((members) => (
      <div class="column cross-stretch">
        {members.length == 0 && <div class="card">no members</div>}
        {members.map((m) => (
          <_MemberSnippet m={m} isOwn={auth.id == m.account.id} />
        ))}
      </div>
    ))
  );
}

function _MemberSnippet({
  m,
  isOwn,
}: {
  m: ReadProjectMember;
  isOwn: boolean;
}) {
  return (
    <div class="card row">
      <div
      class="b"
        style={{
          minWidth: "5rem",
        }}
      >
        {m.role}
      </div>
      <div class="flex-1">{m.account.email}</div>
      {isOwn ? (
        <div class="chip"
        style={{margin: "0"}}
        >you</div>
      ) : (
        <button
          class="integrated"
          onClick={() =>
            showConfirmDialog({
              title: "Delete Member",
              message: "Are you sure you want to remove this member?",
            })
          }
        >
          <Trash2 />
        </button>
      )}
    </div>
  );
}
