import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import {
  mockListings,
  mockClaimRequests,
  mockNotifications,
  getThreadsForUser,
  getUserById,
  getListingById,
} from "../data/mockData";
import "./Dashboard.css";

const CURRENT_USER_ID = 1;

export default function Dashboard() {
  // User's own listings
  const myListings = mockListings.filter((l) => l.user_id === CURRENT_USER_ID);
  const activeListings = myListings.filter((l) => l.status === "available" || l.status === "expiring-soon");
  const reservedListings = myListings.filter((l) => l.status === "reserved");

  // Outgoing claims (items user requested from others)
  const myClaims = mockClaimRequests.filter((cr) => cr.requester_user_id === CURRENT_USER_ID);
  const pendingClaims = myClaims.filter((cr) => cr.status === "pending" || cr.status === "approved");

  // Recent messages
  const threads = getThreadsForUser(CURRENT_USER_ID).slice(0, 3);

  // Unread notifications
  const unreadNotifications = mockNotifications.filter((n) => n.user_id === CURRENT_USER_ID && !n.is_read);

  return (
    <div className="page-container">
      <PageHeader
        title="My Dashboard"
        subtitle="Manage your listings, messages, and exchanges"
        action={
          <Link to="/listings/new">
            <Button variant="primary">Create Listing</Button>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="dashboard__summary">
        <Card>
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-number">{activeListings.length}</span>
              <span className="dashboard__stat-label">Active Listings</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-number">{reservedListings.length}</span>
              <span className="dashboard__stat-label">Reserved</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-number">{unreadNotifications.length}</span>
              <span className="dashboard__stat-label">Unread Notifications</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="dashboard__stat">
              <span className="dashboard__stat-number">{pendingClaims.length}</span>
              <span className="dashboard__stat-label">Pending Claims</span>
            </div>
          </CardBody>
        </Card>
      </div>

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
