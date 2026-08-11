import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  getMyListings,
  listCommunities,
  type ListingResponse,
  type CommunityResponse,
} from "../lib/api";
import type { BadgeStatus } from "../components/ui/StatusBadge";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<ListingResponse[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [listingsData, commData] = await Promise.all([
        getMyListings().catch(() => []),
        listCommunities().catch(() => ({ my_communities: [], public_communities: [] })),
      ]);
      setMyListings(listingsData);
      setMyCommunities(commData.my_communities);
    } catch {
      // Fail gracefully
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="page-container"><p>Loading dashboard...</p></div>;
  }

  const activeListings = myListings.filter((l) => l.status === "available" || l.status === "expiring-soon");
  const reservedListings = myListings.filter((l) => l.status === "reserved");

  const expiringSoon = activeListings.filter((l) => {
    if (!l.expiration_date) return false;
    const daysLeft = Math.ceil((new Date(l.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 2 && daysLeft >= 0;
  });

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="dashboard__greeting">
        {user?.profile_photo_url ? (
          <img src={user.profile_photo_url} alt={user.name} className="dashboard__greeting-avatar" />
        ) : (
          <div className="dashboard__greeting-avatar dashboard__greeting-avatar--placeholder">
            {user?.name?.[0] || "?"}
          </div>
        )}
        <div>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "there"}! 🌱</h1>
          <p className="dashboard__greeting-subtitle">Here's what's happening with your food exchanges.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard__quick-actions">
        <Link to="/listings/new"><Button variant="primary">Create Listing</Button></Link>
        <Link to="/browse"><Button variant="secondary">Browse Listings</Button></Link>
        <Link to="/history"><Button variant="outline">Exchange History</Button></Link>
        <Link to="/messages"><Button variant="outline">Messages</Button></Link>
        <Link to="/communities"><Button variant="outline">Communities</Button></Link>
      </div>

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div className="dashboard__alert">
          <span className="dashboard__alert-icon">⚠️</span>
          <div className="dashboard__alert-content">
            <strong>{expiringSoon.length} listing{expiringSoon.length !== 1 ? "s" : ""} expiring soon!</strong>
            <p>{expiringSoon.map((l) => l.name).join(", ")} — update or close before they expire.</p>
          </div>
          <Link to={`/listings/${expiringSoon[0].listing_id}/edit`}>
            <Button variant="accent" size="sm">Manage</Button>
          </Link>
        </div>
      )}

      {/* Summary */}
      <div className="dashboard__summary">
        <Card className="dashboard__stat-card dashboard__stat-card--green">
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-icon">🧺</span>
              <span className="dashboard__stat-number">{activeListings.length}</span>
              <span className="dashboard__stat-label">Active Listings</span>
            </div>
          </CardBody>
        </Card>
        <Card className="dashboard__stat-card dashboard__stat-card--yellow">
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-icon">📌</span>
              <span className="dashboard__stat-number">{reservedListings.length}</span>
              <span className="dashboard__stat-label">Reserved</span>
            </div>
          </CardBody>
        </Card>
        <Card className="dashboard__stat-card dashboard__stat-card--blue">
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-icon">🏘️</span>
              <span className="dashboard__stat-number">{myCommunities.length}</span>
              <span className="dashboard__stat-label">Communities</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Communities */}
      {myCommunities.length > 0 && (
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>My Communities</h2>
            <Link to="/communities"><Button variant="outline" size="sm">Browse All</Button></Link>
          </div>
          <div className="dashboard__communities">
            {myCommunities.map((community) => (
              <Link key={community.community_id} to={`/communities/${community.community_id}`} className="dashboard__community-chip">
                <StatusBadge status={community.is_private ? "private" : "public"} />
                <span>{community.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active Listings */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>My Active Listings</h2>
          <Link to="/history"><Button variant="outline" size="sm">View All History</Button></Link>
        </div>
        {activeListings.length === 0 ? (
          <EmptyState
            title="No active listings"
            description="You haven't created any listings yet."
            action={<Link to="/listings/new"><Button variant="primary" size="sm">Create a Listing</Button></Link>}
          />
        ) : (
          <div className="dashboard__list">
            {activeListings.map((listing) => (
              <Card key={listing.listing_id}>
                <CardBody>
                  <div className="dashboard__listing-row">
                    {listing.photo_url && <img src={listing.photo_url} alt={listing.name} className="dashboard__listing-thumb" />}
                    <div className="dashboard__listing-info">
                      <div className="dashboard__listing-header">
                        <h3>{listing.name}</h3>
                        {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
                      </div>
                      <p className="dashboard__listing-meta">
                        {listing.quantity} {listing.unit}
                        {listing.expiration_date && ` · Expires ${new Date(listing.expiration_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="dashboard__listing-actions">
                      <Link to={`/listings/${listing.listing_id}`}><Button variant="outline" size="sm">View</Button></Link>
                      <Link to={`/listings/${listing.listing_id}/edit`}><Button variant="primary" size="sm">Edit</Button></Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Reserved */}
      {reservedListings.length > 0 && (
        <section className="dashboard__section">
          <div className="dashboard__section-header"><h2>Reserved Items</h2></div>
          <div className="dashboard__list">
            {reservedListings.map((listing) => (
              <Card key={listing.listing_id}>
                <CardBody>
                  <div className="dashboard__listing-row">
                    {listing.photo_url && <img src={listing.photo_url} alt={listing.name} className="dashboard__listing-thumb" />}
                    <div className="dashboard__listing-info">
                      <div className="dashboard__listing-header">
                        <h3>{listing.name}</h3>
                        <StatusBadge status="reserved" />
                      </div>
                      <p className="dashboard__listing-meta">{listing.quantity} {listing.unit}</p>
                    </div>
                    <Link to={`/listings/${listing.listing_id}/edit`}><Button variant="outline" size="sm">Manage</Button></Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
