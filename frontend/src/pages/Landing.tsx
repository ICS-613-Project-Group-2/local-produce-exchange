import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import {
  mockListings,
  mockCommunities,
  mockMemberships,
  mockNotifications,
  getCommunityById,
  getUserById,
} from "../data/mockData";
import "./Landing.css";

const CURRENT_USER_ID = 1;

interface LandingProps {
  isLoggedIn?: boolean;
}

export default function Landing({ isLoggedIn = false }: LandingProps) {
  if (isLoggedIn) {
    return <LoggedInLanding />;
  }
  return <LoggedOutLanding />;
}

function LoggedOutLanding() {
  const featuredListings = mockListings
    .filter((l) => l.status === "available" || l.status === "expiring-soon")
    .slice(0, 3);
  const featuredCommunities = mockCommunities.filter((c) => !c.is_private).slice(0, 2);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <h1 className="landing__hero-title">Share fresh food with your local community</h1>
          <p className="landing__hero-description">
            Green Beans is a local food exchange platform where people share surplus produce, browse available food, join communities, and coordinate exchanges — reducing waste one listing at a time.
          </p>
          <div className="landing__hero-actions">
            <Link to="/signup">
              <Button variant="primary" size="lg">Sign Up</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="landing__stats">
        <div className="landing__stats-inner">
          <div className="landing__stat">
            <span className="landing__stat-number">42</span>
            <span className="landing__stat-label">Communities</span>
          </div>
          <div className="landing__stat">
            <span className="landing__stat-number">300+</span>
            <span className="landing__stat-label">Listings Shared</span>
          </div>
          <div className="landing__stat">
            <span className="landing__stat-number">1,200 lbs</span>
            <span className="landing__stat-label">Food Exchanged</span>
          </div>
          <div className="landing__stat">
            <span className="landing__stat-number">500+</span>
            <span className="landing__stat-label">Members</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing__section">
        <p className="landing__section-intro">Getting started is simple — here's how it works.</p>
        <h2 className="landing__section-title">How It Works</h2>
        <div className="landing__steps">
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden="true">👥</span>
            <h3>Join a Community</h3>
            <p>Find a local food-sharing group near you — public or private.</p>
          </div>
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden="true">🧺</span>
            <h3>Browse Listings</h3>
            <p>Search for available produce, baked goods, herbs, and pantry items.</p>
          </div>
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden="true">💬</span>
            <h3>Claim & Coordinate</h3>
            <p>Submit a claim request and message the owner to arrange pickup.</p>
          </div>
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden="true">🌱</span>
            <h3>Reduce Waste</h3>
            <p>Food gets shared before it goes unused. Everyone wins.</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="landing__testimonial">
        <blockquote className="landing__quote">
          "My garden produces way more than I can eat. Last month I shared 20 lbs of tomatoes and herbs with my neighbors through Green Beans. It feels good knowing nothing went to waste."
        </blockquote>
        <p className="landing__quote-author">— Lily, Home Gardener in Mānoa Valley</p>
      </section>

      {/* Featured Listings */}
      <section className="landing__section">
        <h2 className="landing__section-title">Featured Listings</h2>
        <div className="landing__grid">
          {featuredListings.map((listing) => {
            const community = getCommunityById(listing.community_id);
            return (
              <Card key={listing.listing_id}>
                <CardImage src={listing.photo_url} alt={listing.name} />
                <CardBody>
                  <div className="landing__card-header">
                    <h3>{listing.name}</h3>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="landing__card-meta">
                    {listing.quantity} {listing.unit} · Expires {new Date(listing.expiration_date).toLocaleDateString()}
                  </p>
                  <p className="landing__card-location">📍 {listing.pickup_location}</p>
                  {community && <p className="landing__card-community">🏘️ {community.name}</p>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Communities Preview */}
      <section className="landing__section landing__section--warm">
        <h2 className="landing__section-title">Join a Community</h2>
        <div className="landing__grid landing__grid--2col">
          {featuredCommunities.map((community) => (
            <Card key={community.community_id} variant="warm">
              <CardBody>
                <div className="landing__card-header">
                  <h3>{community.name}</h3>
                  <StatusBadge status={community.is_private ? "private" : "public"} />
                </div>
                <p className="landing__card-meta">{community.description}</p>
                <p className="landing__card-community">👥 {community.member_count} members</p>
              </CardBody>
              <CardFooter>
                <Button variant="primary" size="sm">Join Community</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="landing__section">
        <h2 className="landing__section-title">Not a Store. A Community.</h2>
        <p className="landing__trust-text">
          Green Beans is not a shopping marketplace. It's a local exchange platform focused on sharing, reducing waste, and connecting neighbors. Users coordinate through direct messages instead of automated checkout — keeping things simple and community-based.
        </p>
      </section>

      {/* Final CTA */}
      <section className="landing__cta">
        <h2 className="landing__section-title">Ready to share fresh food with your community?</h2>
        <div className="landing__hero-actions">
          <Link to="/signup">
            <Button variant="primary" size="lg">Sign Up</Button>
          </Link>
          <Link to="/about">
            <Button variant="secondary" size="lg">Learn More</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function LoggedInLanding() {
  const currentUser = getUserById(CURRENT_USER_ID)!;

  // Listings
  const myListings = mockListings.filter((l) => l.user_id === CURRENT_USER_ID);
  const expiringSoon = myListings.filter((l) => {
    if (l.status !== "available" && l.status !== "expiring-soon") return false;
    const daysLeft = Math.ceil((new Date(l.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 2 && daysLeft >= 0;
  });

  const recentListings = mockListings
    .filter((l) => l.status === "available" || l.status === "expiring-soon")
    .slice(0, 4);

  // Communities
  const userCommunityIds = mockMemberships
    .filter((m) => m.user_id === CURRENT_USER_ID)
    .map((m) => m.community_id);
  const userCommunities = mockCommunities.filter((c) => userCommunityIds.includes(c.community_id));

  // Recent notifications
  const recentNotifications = mockNotifications
    .filter((n) => n.user_id === CURRENT_USER_ID && !n.is_read)
    .slice(0, 3);

  return (
    <div className="landing">
      {/* Personalized Greeting */}
      <section className="landing__greeting">
        <div className="landing__greeting-inner">
          {currentUser.profile_photo_url ? (
            <img src={currentUser.profile_photo_url} alt={currentUser.name} className="landing__greeting-avatar" />
          ) : (
            <div className="landing__greeting-avatar landing__greeting-avatar--placeholder">
              {currentUser.name[0]}
            </div>
          )}
          <div>
            <h1>Welcome back, {currentUser.name.split(" ")[0]}! 🌱</h1>
            <p className="landing__greeting-subtitle">Here's what's fresh in your communities.</p>
          </div>
        </div>
        <div className="landing__hero-actions">
          <Link to="/listings/new">
            <Button variant="primary">Create a Listing</Button>
          </Link>
          <Link to="/browse">
            <Button variant="outline">Browse Listings</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">My Dashboard</Button>
          </Link>
        </div>
      </section>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <section className="landing__section">
          <div className="landing__alert">
            <span className="landing__alert-icon">⚠️</span>
            <div className="landing__alert-content">
              <strong>{expiringSoon.length} listing{expiringSoon.length !== 1 ? "s" : ""} expiring soon!</strong>
              <p>{expiringSoon.map((l) => l.name).join(", ")} — update or close before they expire.</p>
            </div>
            <Link to="/dashboard">
              <Button variant="accent" size="sm">Manage</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <section className="landing__section">
          <div className="landing__section-header">
            <h2 className="landing__section-title">What's New</h2>
            <Link to="/notifications"><Button variant="outline" size="sm">View All</Button></Link>
          </div>
          <div className="landing__notifications">
            {recentNotifications.map((n) => (
              <div key={n.notification_id} className="landing__notification-item">
                <span className="landing__notification-dot" />
                <p>{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Communities */}
      <section className="landing__section">
        <div className="landing__section-header">
          <h2 className="landing__section-title">My Communities</h2>
          <Link to="/communities"><Button variant="outline" size="sm">Browse All</Button></Link>
        </div>
        <div className="landing__communities">
          {userCommunities.map((community) => (
            <Link key={community.community_id} to={`/communities/${community.community_id}`} className="landing__community-chip">
              <StatusBadge status={community.is_private ? "private" : "public"} />
              <span>{community.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="landing__section">
        <div className="landing__section-header">
          <h2 className="landing__section-title">Fresh & Available</h2>
          <Link to="/browse"><Button variant="outline" size="sm">Browse All</Button></Link>
        </div>
        <div className="landing__grid">
          {recentListings.map((listing) => {
            const community = getCommunityById(listing.community_id);
            return (
              <Card key={listing.listing_id}>
                <CardImage src={listing.photo_url} alt={listing.name} />
                <CardBody>
                  <div className="landing__card-header">
                    <h3>{listing.name}</h3>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="landing__card-meta">
                    {listing.quantity} {listing.unit} · Expires {new Date(listing.expiration_date).toLocaleDateString()}
                  </p>
                  <p className="landing__card-location">📍 {listing.pickup_location}</p>
                  {community && <p className="landing__card-community">🏘️ {community.name}</p>}
                </CardBody>
                <CardFooter>
                  <Link to={`/listings/${listing.listing_id}`}>
                    <Button variant="primary" size="sm">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
