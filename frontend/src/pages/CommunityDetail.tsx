import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import {
  getCommunity,
  browseListings,
  type CommunityResponse,
  type ListingResponse,
  ApiError,
} from "../lib/api";
import type { BadgeStatus } from "../components/ui/StatusBadge";
import "./CommunityDetail.css";

type Tab = "listings" | "posts" | "members";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("listings");

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
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      } else if (err instanceof ApiError && err.status === 404) {
        setCommunity(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load community");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="page-container"><p>Loading community...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>⚠️</span>}
          title="Something went wrong"
          description={error}
          action={<Button variant="primary" onClick={loadCommunity}>Try Again</Button>}
        />
      </div>
    );
  }

  if (!community && !forbidden) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🏘️</span>}
          title="Community not found"
          description="This community may have been removed or does not exist."
          action={<Link to="/communities"><Button variant="primary">Back to Communities</Button></Link>}
        />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="page-container">
        <div className="community-detail__locked">
          <h1>Private Community</h1>
          <StatusBadge status="private" />
          <p className="community-detail__locked-notice">
            This is a private community. You need an invitation or admin approval to view its content.
          </p>
          <Link to="/communities"><Button variant="outline">Back to Communities</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {community!.banner_url && (
        <div className="community-detail__banner">
          <img src={community!.banner_url} alt={community!.name} />
        </div>
      )}

      <div className="community-detail__header">
        <div className="community-detail__title-row">
          <h1>{community!.name}</h1>
          <StatusBadge status={community!.is_private ? "private" : "public"} />
        </div>
        <p className="community-detail__description">{community!.description}</p>
        <p className="community-detail__meta">👥 {community!.member_count} members</p>
        <div className="community-detail__actions">
          <Link to={`/communities/${community!.community_id}/admin`}>
            <Button variant="outline" size="sm">Manage Community</Button>
          </Link>
          <Link to="/listings/new">
            <Button variant="primary" size="sm">Create Listing</Button>
          </Link>
        </div>
      </div>

      <div className="community-detail__tabs">
        <button className={`community-detail__tab ${activeTab === "listings" ? "community-detail__tab--active" : ""}`} onClick={() => setActiveTab("listings")}>Listings</button>
        <button className={`community-detail__tab ${activeTab === "posts" ? "community-detail__tab--active" : ""}`} onClick={() => setActiveTab("posts")}>Posts</button>
        <button className={`community-detail__tab ${activeTab === "members" ? "community-detail__tab--active" : ""}`} onClick={() => setActiveTab("members")}>Members</button>
      </div>

      {activeTab === "listings" && <ListingsTab communityId={community!.community_id} />}
      {activeTab === "posts" && <PostsTab />}
      {activeTab === "members" && <MembersTab communityId={community!.community_id} />}
    </div>
  );
}

function ListingsTab({ communityId }: { communityId: number }) {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browseListings({ community_id: communityId })
      .then((data) => setListings(data.filter((l) => l.status !== "closed" && l.status !== "completed")))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [communityId]);

  if (loading) return <p>Loading listings...</p>;

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<span>🧺</span>}
        title="No listings in this community yet"
        description="Be the first to share produce with this community."
        action={<Link to="/listings/new"><Button variant="primary">Create a Listing</Button></Link>}
      />
    );
  }

  return (
    <div className="community-detail__grid">
      {listings.map((listing) => (
        <Card key={listing.listing_id}>
          {listing.photo_url && (
            <div className="communities__banner">
              <img src={listing.photo_url} alt={listing.name} />
            </div>
          )}
          <CardBody>
            <div className="community-detail__card-header">
              <h3>{listing.name}</h3>
              {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
            </div>
            <p className="community-detail__card-meta">
              {listing.quantity} {listing.unit} · {listing.category}
            </p>
            {listing.pickup_location && (
              <p className="community-detail__card-meta">📍 {listing.pickup_location}</p>
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

function PostsTab() {
  return (
    <EmptyState
      title="Posts coming soon"
      description="Community posts will be available once the posts endpoint is connected."
    />
  );
}

function MembersTab({ }: { communityId: number }) {
  return (
    <EmptyState
      title="Members coming soon"
      description="Member list will be available once the members endpoint is connected."
    />
  );
}
