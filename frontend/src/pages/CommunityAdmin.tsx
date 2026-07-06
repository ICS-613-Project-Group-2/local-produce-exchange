import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input } from "../components/ui/FormField";
import Modal, { ModalFooter } from "../components/ui/Modal";
import EmptyState from "../components/feedback/EmptyState";
import {
  getCommunityById,
  getMembersByCommunity,
  getJoinRequestsByCommunity,
  getUserById,
  getUserRole,
} from "../data/mockData";
import type { Membership, JoinRequest } from "../data/types";
import "./CommunityAdmin.css";

const CURRENT_USER_ID = 1;

type AdminTab = "members" | "requests" | "invitations" | "settings";

export default function CommunityAdmin() {
  const { id } = useParams<{ id: string }>();
  const community = getCommunityById(Number(id));
  const [activeTab, setActiveTab] = useState<AdminTab>("members");

  if (!community) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🏘️</span>}
          title="Community not found"
          action={<Link to="/communities"><Button variant="primary">Back to Communities</Button></Link>}
        />
      </div>
    );
  }

  const userRole = getUserRole(CURRENT_USER_ID, community.community_id);
  if (userRole !== "admin") {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🔒</span>}
          title="Access denied"
          description="Only community admins can access this page."
          action={<Link to={`/communities/${community.community_id}`}><Button variant="primary">Back to Community</Button></Link>}
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

      {activeTab === "members" && <MembersSection communityId={community.community_id} />}
      {activeTab === "requests" && <RequestsSection communityId={community.community_id} />}
      {activeTab === "invitations" && <InvitationsSection />}
      {activeTab === "settings" && <SettingsSection communityName={community.name} />}
    </div>
  );
}

function MembersSection({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<Membership[]>(getMembersByCommunity(communityId));
  const [kickModal, setKickModal] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  function handleRoleChange(userId: number, newRole: "member" | "admin") {
    setMembers((prev) =>
      prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
    );
    setSuccessMsg("Member role updated.");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  function handleKick(userId: number) {
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    setKickModal(null);
    setSuccessMsg("Member has been removed from the community.");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  const kickUser = kickModal ? getUserById(kickModal) : null;

  return (
    <div className="admin__section">
      {successMsg && <div className="admin__success">{successMsg}</div>}
      <div className="admin__members-list">
        {members.map((membership) => {
          const user = getUserById(membership.user_id);
          if (!user) return null;
          const isCurrentUser = membership.user_id === CURRENT_USER_ID;
          return (
            <div key={membership.user_id} className="admin__member-row">
              <div className="admin__member-info">
                {user.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={user.name} className="admin__member-avatar" />
                ) : (
                  <div className="admin__member-avatar admin__member-avatar--placeholder">{user.name[0]}</div>
                )}
                <div>
                  <span className="admin__member-name">{user.name} {isCurrentUser && "(You)"}</span>
                  <span className="admin__member-date">Joined {new Date(membership.date_joined).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="admin__member-actions">
                <select
                  className="form-field__input admin__role-select"
                  value={membership.role}
                  onChange={(e) => handleRoleChange(membership.user_id, e.target.value as "member" | "admin")}
                  disabled={isCurrentUser}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                {!isCurrentUser && (
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
        description={`Are you sure you want to remove ${kickUser?.name} from this community?`}
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
  const [requests, setRequests] = useState<JoinRequest[]>(getJoinRequestsByCommunity(communityId));
  const [successMsg, setSuccessMsg] = useState("");

  function handleDecision(requestId: number, decision: "approved" | "rejected") {
    setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    const label = decision === "approved" ? "approved" : "rejected";
    setSuccessMsg(`Request ${label}. User has been notified.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <div className="admin__section">
      {successMsg && <div className="admin__success">{successMsg}</div>}
      {requests.length === 0 ? (
        <EmptyState title="No pending join requests" description="When users request to join, their requests will appear here." />
      ) : (
        <div className="admin__requests-list">
          {requests.map((request) => {
            const user = getUserById(request.user_id);
            return (
              <div key={request.request_id} className="admin__request-row">
                <div className="admin__member-info">
                  {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt={user.name} className="admin__member-avatar" />
                  ) : (
                    <div className="admin__member-avatar admin__member-avatar--placeholder">{user?.name[0] || "?"}</div>
                  )}
                  <div>
                    <span className="admin__member-name">{user?.name}</span>
                    <span className="admin__member-date">Requested {new Date(request.request_date).toLocaleDateString()}</span>
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

function InvitationsSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleInvite(e: React.FormEvent) {
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
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="admin__section">
      {sent && <div className="admin__success">Invitation sent successfully!</div>}
      <Card>
        <CardBody>
          <h3>Invite a Member</h3>
          <p className="admin__invite-desc">Send an email invitation to a trusted person. They'll receive a link to join this community.</p>
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
            <Button variant="primary" size="sm" type="submit">Send Invite</Button>
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
