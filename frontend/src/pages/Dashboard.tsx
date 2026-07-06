import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import {
  mockListings,
  mockClaimRequests,
  mockNotifications,
  mockCommunities,
  mockMemberships,
  getThreadsForUser,
  getUserById,
  getListingById,
} from "../data/mockData";
import "./Dashboard.css";

const CURRENT_USER_ID = 1;
const currentUser = getUserById(CURRENT_USER_ID)!;

export default function Dashboard() {
  // User's own listings
  const myListings = mockListings.filter((l) => l.user_id === CURRENT_USER_ID);
  const activeListings = myListings.filter((l) => l.status === "available" || l.status === "expiring-soon");
  const reservedListings = myListings.filter((l) => l.status === "reserved");

  // Expiring soon (within 2 days)
  const expiringSoon = activeListings.filter((l) => {
    const daysLeft = Math.ceil((new Date(l.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 2 && daysLeft >= 0;
  });

  // Outgoing claims
  const myClaims = mockClaimRequests.filter((cr) => cr.requester_user_id === CURRENT_USER_ID);
  const pendingClaims = myClaims.filter((cr) => cr.status === "pending" || cr.status === "approved");

  // Messages
  const threads = getThreadsForUser(CURRENT_USER_ID).slice(0, 3);

  // Notifications
  const unreadNotifications = mockNotifications.filter((n) => n.user_id === CURRENT_USER_ID && !n.is_read);

  // Communities
  const userCommunityIds = mockMemberships
    .filter((m) => m.user_id === CURRENT_USER_ID)
    .map((m) => m.community_id);
  const userCommunities = mockCommunities.filter((c) => userCommunityIds.includes(c.community_id));

  return (
    <div className="page-container">
      {/* Personalized Greeting */}
      <div className="dashboard__greeting">
        {currentUser.profile_photo_url ? (
          <img src={currentUser.profile_photo_url} alt={currentUser.name} className="dashboard__greeting-avatar" />
        ) : (
          <div className="dashboard__greeting-avatar dashboard__greeting-avatar--placeholder">
            {currentUser.name[0]}
          </div>
        )}
        <div>
          <h1>Welcome back, {currentUser.name.split(" ")[0]}! 🌱</h1>
          <p className="dashboard__greeting-subtitle">Here's what's happening with your food exchanges.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard__quick-actions">
        <Link to="/listings/new"><Button variant="primary">Create Listing</Button></Link>
        <Link to="/browse"><Button variant="secondary">Browse Listings</Button></Link>
        <Link to="/messages"><Button variant="outline">Messages</Button></Link>
        <Link to="/communities"><Button variant="outline">Communities</Button></Link>
      </div>

      {/* Expiring Soon Alert */}
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

      {/* Summary Cards */}
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
        <Card className="dashboard__stat-card dashboard__stat-card--orange">
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-icon">🔔</span>
              <span className="dashboard__stat-number">{unreadNotifications.length}</span>
              <span className="dashboard__stat-label">Unread Notifications</span>
            </div>
          </CardBody>
        </Card>
        <Card className="dashboard__stat-card dashboard__stat-card--blue">
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-icon">📦</span>
              <span className="dashboard__stat-number">{pendingClaims.length}</span>
              <span className="dashboard__stat-label">Pending Claims</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Notifications */}
      {unreadNotifications.length > 0 && (
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>Recent Notifications</h2>
            <Link to="/notifications"><Button variant="outline" size="sm">View All</Button></Link>
          </div>
          <div className="dashboard__notifications">
            {unreadNotifications.slice(0, 3).map((n) => (
              <div key={n.notification_id} className="dashboard__notification-item">
                <span className="dashboard__notification-dot" />
                <p>{n.content}</p>
                <span className="dashboard__notification-time">{new Date(n.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Communities */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>My Communities</h2>
          <Link to="/communities"><Button variant="outline" size="sm">Browse All</Button></Link>
        </div>
        <div className="dashboard__communities">
          {userCommunities.map((community) => (
            <Link key={community.community_id} to={`/communities/${community.community_id}`} className="dashboard__community-chip">
              <StatusBadge status={community.is_private ? "private" : "public"} />
              <span>{community.name}</span>
            </Link>
          ))}
        </div>
      </section>

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
                    <img src={listing.photo_url} alt={listing.name} className="dashboard__listing-thumb" />
                    <div className="dashboard__listing-info">
                      <div className="dashboard__listing-header">
                        <h3>{listing.name}</h3>
                        <StatusBadge status={listing.status} />
                      </div>
                      <p className="dashboard__listing-meta">
                        {listing.quantity} {listing.unit} · Expires {new Date(listing.expiration_date).toLocaleDateString()}
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

      {/* Reserved / Pending Claims */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Reserved & Pending</h2>
        </div>
        {reservedListings.length === 0 && pendingClaims.length === 0 ? (
          <EmptyState
            title="No reserved items"
            description="Items you've reserved or claims you've submitted will appear here."
          />
        ) : (
          <div className="dashboard__list">
            {reservedListings.map((listing) => (
              <Card key={`reserved-${listing.listing_id}`}>
                <CardBody>
                  <div className="dashboard__listing-row">
                    <img src={listing.photo_url} alt={listing.name} className="dashboard__listing-thumb" />
                    <div className="dashboard__listing-info">
                      <div className="dashboard__listing-header">
                        <h3>{listing.name}</h3>
                        <StatusBadge status="reserved" />
                      </div>
                      <p className="dashboard__listing-meta">Your listing · {listing.quantity} {listing.unit}</p>
                    </div>
                    <Link to={`/listings/${listing.listing_id}/edit`}><Button variant="outline" size="sm">Manage</Button></Link>
                  </div>
                </CardBody>
              </Card>
            ))}
            {pendingClaims.map((claim) => {
              const listing = getListingById(claim.listing_id);
              if (!listing) return null;
              return (
                <Card key={`claim-${claim.request_id}`}>
                  <CardBody>
                    <div className="dashboard__listing-row">
                      <img src={listing.photo_url} alt={listing.name} className="dashboard__listing-thumb" />
                      <div className="dashboard__listing-info">
                        <div className="dashboard__listing-header">
                          <h3>{listing.name}</h3>
                          <StatusBadge status={claim.status} />
                        </div>
                        <p className="dashboard__listing-meta">
                          Requested {claim.quantity_requested} {listing.unit} · {new Date(claim.request_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/listings/${listing.listing_id}`}><Button variant="outline" size="sm">View</Button></Link>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Messages */}
      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Recent Messages</h2>
          <Link to="/messages"><Button variant="outline" size="sm">View All</Button></Link>
        </div>
        {threads.length === 0 ? (
          <EmptyState title="No messages yet" description="Conversations will appear here when you message or receive messages." />
        ) : (
          <div className="dashboard__list">
            {threads.map((thread) => {
              const otherUserId = thread.participant_ids.find((id) => id !== CURRENT_USER_ID) || thread.participant_ids[1];
              const otherUser = getUserById(otherUserId);
              const listing = getListingById(thread.listing_id);
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <Link key={thread.thread_id} to={`/messages/${thread.thread_id}`} className="dashboard__message-link">
                  <Card>
                    <CardBody>
                      <div className="dashboard__message-row">
                        <div className="dashboard__message-info">
                          <span className="dashboard__message-name">{otherUser?.name}</span>
                          {listing && <span className="dashboard__message-listing">Re: {listing.name}</span>}
                        </div>
                        <p className="dashboard__message-preview">
                          {lastMsg.content.length > 60 ? lastMsg.content.slice(0, 60) + "..." : lastMsg.content}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
