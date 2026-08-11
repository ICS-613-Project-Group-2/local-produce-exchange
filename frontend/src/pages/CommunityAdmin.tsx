import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input } from "../components/ui/FormField";
import Modal, { ModalFooter } from "../components/ui/Modal";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  getCommunity,
  getCommunityMembers,
  getJoinRequests,
  getUser,
  removeCommunityMember,
  promoteMember,
  demoteMember,
  inviteToCommunity,
  approveJoinRequest,
  rejectJoinRequest,
  type CommunityResponse,
  type MembershipResponse,
  type JoinRequestResponse,
  type User,
  ApiError,
} from "../lib/api";
import "./CommunityAdmin.css";

type AdminTab = "members" | "requests" | "invitations" | "settings";

const MODERATOR_ROLES = ["owner", "moderator"];

export default function CommunityAdmin() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("members");

  useEffect(() => {
    loadCommunity();
  }, [id]);

  async function loadCommunity() {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const data = await getCommunity(Number(id));
      setCommunity(data);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setForbidden(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load community");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="page-container"><p>Loading...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>⚠️</span>}
          title="Something went wrong"
          description={error}
          action={<Link to="/communities"><Button variant="primary">Back to Communities</Button></Link>}
        />
      </div>
    );
  }

  const isModerator = !!community && community.my_role !== null && MODERATOR_ROLES.includes(community.my_role);

  if (!community || forbidden || !isModerator) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🔒</span>}
          title="Access denied"
          description="Only community admins can access this page."
          action={<Link to="/communities"><Button variant="primary">Back to Communities</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Manage: ${community.name}`}
        subtitle="Manage members, requests, invitations, and community settings"
        action={
          <Link to={`/communities/${community.community_id}`}>
            <Button variant="outline">Back to Community</Button>
          </Link>
        }
      />

      {/* Admin Tabs */}
      <div className="admin__tabs">
        {(["members", "requests", "invitations", "settings"] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            className={`admin__tab ${activeTab === tab ? "admin__tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <MembersSection
          communityId={community.community_id}
          currentUserId={user?.user_id || 0}
          isOwner={community.my_role === "owner"}
        />
      )}
      {activeTab === "requests" && <RequestsSection communityId={community.community_id} />}
      {activeTab === "invitations" && <InvitationsSection communityId={community.community_id} />}
      {activeTab === "settings" && <SettingsSection communityName={community.name} />}
    </div>
  );
}

function MembersSection({
  communityId,
  currentUserId,
  isOwner,
}: {
  communityId: number;
  currentUserId: number;
  isOwner: boolean;
}) {
  const [members, setMembers] = useState<MembershipResponse[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [kickModal, setKickModal] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadMembers();
  }, [communityId]);

  async function loadMembers() {
    setLoading(true);
    try {
      const data = await getCommunityMembers(communityId);
      setMembers(data);

      const userMap: Record<number, User> = {};
      await Promise.all(
        data.map(async (m) => {
          try {
            const u = await getUser(m.user_id);
            userMap[m.user_id] = u;
          } catch {
            // skip
          }
        })
      );
      setUsers(userMap);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote(userId: number) {
    try {
      const updated = await promoteMember(communityId, userId);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: updated.role } : m))
      );
      setSuccessMsg("Member promoted to moderator.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Failed to promote member.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }

  async function handleDemote(userId: number) {
    try {
      const updated = await demoteMember(communityId, userId);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: updated.role } : m))
      );
      setSuccessMsg("Moderator demoted to member.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Failed to demote member.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }

  async function handleKick(userId: number) {
    try {
      await removeCommunityMember(communityId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setKickModal(null);
      setSuccessMsg("Member has been removed from the community.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Failed to remove member.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }

  if (loading) return <p>Loading members...</p>;

  const kickUser = kickModal ? users[kickModal] : null;

  return (
    <div className="admin__section">
      {successMsg && <div className="admin__success">{successMsg}</div>}
      <div className="admin__members-list">
        {members.map((membership) => {
          const memberUser = users[membership.user_id];
          if (!memberUser) return null;
          const isCurrentUser = membership.user_id === currentUserId;
          const isTargetOwner = membership.role === "owner";
          const isTargetModerator = membership.role === "moderator";
          const canKick = !isCurrentUser && !isTargetOwner && (isOwner || !isTargetModerator);
          return (
            <div key={membership.user_id} className="admin__member-row">
              <div className="admin__member-info">
                {memberUser.profile_photo_url ? (
                  <img src={memberUser.profile_photo_url} alt={memberUser.name} className="admin__member-avatar" />
                ) : (
                  <div className="admin__member-avatar admin__member-avatar--placeholder">{memberUser.name[0]}</div>
                )}
                <div>
                  <span className="admin__member-name">{memberUser.name} {isCurrentUser && "(You)"}</span>
                  <span className="admin__member-date">Joined {membership.date_joined ? new Date(membership.date_joined).toLocaleDateString() : "Unknown"}</span>
                </div>
              </div>
              <div className="admin__member-actions">
                {isTargetOwner ? (
                  <StatusBadge status="approved" label="Owner" />
                ) : (
                  <StatusBadge status={isTargetModerator ? "approved" : "pending"} label={isTargetModerator ? "Moderator" : "Member"} />
                )}
                {isOwner && !isCurrentUser && !isTargetOwner && (
                  isTargetModerator ? (
                    <Button variant="outline" size="sm" onClick={() => handleDemote(membership.user_id)}>
                      Demote
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handlePromote(membership.user_id)}>
                      Promote
                    </Button>
                  )
                )}
                {canKick && (
                  <Button variant="danger" size="sm" onClick={() => setKickModal(membership.user_id)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!kickModal}
        onOpenChange={() => setKickModal(null)}
        title="Remove Member"
        description={`Are you sure you want to remove ${kickUser?.name || "this user"} from this community?`}
      >
        <p>They will lose access to community listings and posts. They can request to rejoin later.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setKickModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => kickModal && handleKick(kickModal)}>Remove Member</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function RequestsSection({ communityId }: { communityId: number }) {
  const [requests, setRequests] = useState<JoinRequestResponse[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadRequests();
  }, [communityId]);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await getJoinRequests(communityId);
      setRequests(data);

      const userMap: Record<number, User> = {};
      await Promise.all(
        data.map(async (r) => {
          try {
            const u = await getUser(r.user_id);
            userMap[r.user_id] = u;
          } catch {
            // skip
          }
        })
      );
      setUsers(userMap);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(requestId: number, decision: "approved" | "rejected") {
    try {
      if (decision === "approved") {
        await approveJoinRequest(communityId, requestId);
      } else {
        await rejectJoinRequest(communityId, requestId);
      }
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
      const label = decision === "approved" ? "approved" : "rejected";
      setSuccessMsg(`Request ${label}. User has been notified.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Failed to process request.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="admin__section">
      {successMsg && <div className="admin__success">{successMsg}</div>}
      {requests.length === 0 ? (
        <EmptyState title="No pending join requests" description="When users request to join, their requests will appear here." />
      ) : (
        <div className="admin__requests-list">
          {requests.map((request) => {
            const reqUser = users[request.user_id];
            return (
              <div key={request.request_id} className="admin__request-row">
                <div className="admin__member-info">
                  {reqUser?.profile_photo_url ? (
                    <img src={reqUser.profile_photo_url} alt={reqUser.name} className="admin__member-avatar" />
                  ) : (
                    <div className="admin__member-avatar admin__member-avatar--placeholder">{reqUser?.name?.[0] || "?"}</div>
                  )}
                  <div>
                    <span className="admin__member-name">{reqUser?.name || "Unknown"}</span>
                    <span className="admin__member-date">Requested {request.request_date ? new Date(request.request_date).toLocaleDateString() : ""}</span>
                  </div>
                </div>
                <div className="admin__request-actions">
                  <Button variant="primary" size="sm" onClick={() => handleDecision(request.request_id, "approved")}>
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDecision(request.request_id, "rejected")}>
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InvitationsSection({ communityId }: { communityId: number }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSending(true);
    setInviteLink(null);
    setCopied(false);
    try {
      const invitation = await inviteToCommunity(communityId, email);
      setInviteLink(invitation.invite_link);
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to send invitation.");
      }
    } finally {
      setSending(false);
    }
  }

  function handleCopy() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="admin__section">
      {inviteLink && (
        <div className="admin__success">
          <p>Invitation created! Copy this link and share it with the invitee:</p>
          <div className="admin__invite-link-row">
            <Input
              readOnly
              value={inviteLink}
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>
      )}
      <Card>
        <CardBody>
          <h3>Invite a Member</h3>
          <p className="admin__invite-desc">Send a invitation link to a trusted person.</p>
          <form onSubmit={handleInvite} className="admin__invite-form">
            <FormField label="Email Address" htmlFor="invite-email" error={error}>
              <Input
                id="invite-email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                hasError={!!error}
              />
            </FormField>
            <Button variant="primary" size="sm" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function SettingsSection({ communityName }: { communityName: string }) {
  return (
    <div className="admin__section">
      <Card>
        <CardBody>
          <h3>Community Settings</h3>
          <p className="admin__settings-note">
            Settings for "{communityName}" can be updated here. This section is a placeholder for future features like updating the community name, description, privacy setting, guidelines, and banner image.
          </p>
          <StatusBadge status="pending" label="Coming Soon" />
        </CardBody>
      </Card>
    </div>
  );
}
