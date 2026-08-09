import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { NO_PHOTO_URL } from "../lib/placeholder";
import {
  getCommunity,
  listListings,
  listCommunityMembers,
  ApiError,
  type CommunityResponse,
  type ListingResponse,
  type CommunityMemberResponse,
} from "../lib/api";
import { displayName } from "../data/utils";
import "./CommunityDetail.css";

type Tab = "listings" | "members";

const MODERATOR_ROLES = ["owner", "moderator", "admin"];

// displays "expired" for available listings past their expiration date, "expiring-soon" for
// those expiring within 2 days, otherwise the raw status
function displayStatus(listing: ListingResponse): BadgeStatus {
  if (listing.status === "available" && listing.expiration_date) {
    const daysLeft = Math.ceil(
      (new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 0) return "expired";
    if (daysLeft <= 2) return "expiring-soon";
  }
  return (listing.status as BadgeStatus) || "available";
}

function roleLabel(role: string | null): string {
  if (role === "owner") return "Owner";
  if (role === "moderator" || role === "admin") return "Moderator";
  return "Member";
}

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const communityId = Number(id);

  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivateLocked, setIsPrivateLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIsPrivateLocked(false);
    getCommunity(communityId)
      .then(setCommunity)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setIsPrivateLocked(true);
        } else {
          setError(err instanceof ApiError ? err.message : "Failed to load this community.");
        }
      })
      .finally(() => setLoading(false));
  }, [communityId]);

  if (loading) {
    return (
      <div className="page-container">
        <p className="community-detail__status-message">Loading community...</p>
      </div>
    );
  }

  if (isPrivateLocked) {
    return (
      <div className="page-container">
        <div className="community-detail__locked">
          <h1>Private Community</h1>
          <StatusBadge status="private" />
          <p className="community-detail__locked-notice">
            This is a private community. You need an invitation to view its content.
          </p>
          <Link to="/communities">
            <Button variant="outline">Back to Communities</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🏘️</span>}
          title="Community not found"
          description={error || "This community may have been removed or does not exist."}
          action={
            <Link to="/communities">
              <Button variant="primary">Back to Communities</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isAdmin = community.my_role !== null && MODERATOR_ROLES.includes(community.my_role);

  return (
    <div className="page-container">
      {/* Banner */}
      {community.banner_url && (
        <div className="community-detail__banner">
          <img src={community.banner_url} alt={community.name} />
        </div>
      )}

      {/* Header */}
      <div className="community-detail__header">
        <div className="community-detail__title-row">
          <h1>{community.name}</h1>
          <StatusBadge status={community.is_private ? "private" : "public"} />
        </div>
        <p className="community-detail__description">{community.description}</p>
        <p className="community-detail__meta">👥 {community.member_count} members</p>
        <div className="community-detail__actions">
          {isAdmin && (
            <Link to={`/communities/${community.community_id}/admin`}>
              <Button variant="outline" size="sm">Manage Community</Button>
            </Link>
          )}
          <Link to="/listings/new">
            <Button variant="primary" size="sm">Create Listing</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="community-detail__tabs">
        <button
          className={`community-detail__tab ${activeTab === "listings" ? "community-detail__tab--active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          Listings
        </button>
        <button
          className={`community-detail__tab ${activeTab === "members" ? "community-detail__tab--active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "listings" && <ListingsTab communityId={community.community_id} />}
      {activeTab === "members" && <MembersTab communityId={community.community_id} />}
    </div>
  );
}

function ListingsTab({ communityId }: { communityId: number }) {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listListings({ community_id: communityId })
      .then((result) =>
        setListings(result.filter((l) => l.status !== "closed" && l.status !== "completed"))
      )
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load listings.");
      })
      .finally(() => setLoading(false));
  }, [communityId]);

  if (loading) {
    return <p className="community-detail__status-message">Loading listings...</p>;
  }

  if (error) {
    return <p className="community-detail__status-message">{error}</p>;
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<span>🧺</span>}
        title="No listings in this community yet"
        description="Be the first to share produce with this community."
        action={
          <Link to="/listings/new">
            <Button variant="primary">Create a Listing</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="community-detail__grid">
      {listings.map((listing) => (
        <Card key={listing.listing_id}>
          <CardImage src={listing.photo_url || NO_PHOTO_URL} alt={listing.name} />
          <CardBody>
            <div className="community-detail__card-header">
              <h3>{listing.name}</h3>
              <StatusBadge status={displayStatus(listing)} />
            </div>
            <p className="community-detail__card-meta">
              {listing.quantity} {listing.unit} · {listing.category}
            </p>
            {listing.pickup_location && (
              <p className="community-detail__card-meta">
                📍 {listing.pickup_location}
              </p>
            )}
          </CardBody>
          <CardFooter>
            <Link to={`/listings/${listing.listing_id}`}>
              <Button variant="primary" size="sm">View Details</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function MembersTab({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<CommunityMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCommunityMembers(communityId)
      .then(setMembers)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load members.");
      })
      .finally(() => setLoading(false));
  }, [communityId]);

  if (loading) {
    return <p className="community-detail__status-message">Loading members...</p>;
  }

  if (error) {
    return <p className="community-detail__status-message">{error}</p>;
  }

  if (members.length === 0) {
    return <EmptyState icon={<span>👥</span>} title="No members yet" />;
  }

  return (
    <div className="community-detail__members">
      {members.map((member) => (
        <div key={member.user_id} className="community-detail__member">
          {member.profile_photo_url ? (
            <img src={member.profile_photo_url} alt={member.name} className="community-detail__member-avatar" />
          ) : (
            <div className="community-detail__member-avatar community-detail__member-avatar--placeholder">
              {member.name[0]}
            </div>
          )}
          <div className="community-detail__member-info">
            <span className="community-detail__member-name">{displayName(member.name)}</span>
          </div>
          <StatusBadge
            status={MODERATOR_ROLES.includes(member.role || "") ? "approved" : "available"}
            label={roleLabel(member.role)}
          />
        </div>
      ))}
    </div>
  );
}
