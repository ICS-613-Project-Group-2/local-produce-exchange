import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import { mockListings, mockCommunities, getCommunityById } from "../data/mockData";
import "./Landing.css";

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
  const featuredListings = mockListings.filter((l) => l.status === "available" || l.status === "expiring-soon").slice(0, 3);
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

      {/* How It Works */}
      <section className="landing__section">
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
      <section className="landing__section">
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
      <section className="landing__section landing__section--alt">
        <h2 className="landing__section-title">Not a Store. A Community.</h2>
        <p className="landing__trust-text">
          Green Beans is not a shopping marketplace. It's a local exchange platform focused on sharing, reducing waste, and connecting neighbors. Users coordinate through direct messages instead of automated checkout — keeping things simple and community-based.
        </p>
      </section>

      {/* Final CTA */}
      <section className="landing__section landing__cta">
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
  const expiringListings = mockListings
    .filter((l) => l.status === "expiring-soon" || l.status === "available")
    .slice(0, 4);

  return (
    <div className="landing">
      <section className="landing__section">
        <div className="landing__welcome">
          <h1>Welcome back! 🌱</h1>
          <p className="landing__welcome-subtitle">Here's what's fresh in your communities.</p>
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
        </div>
      </section>

      <section className="landing__section">
        <h2 className="landing__section-title">Expiring Soon & Available</h2>
        <div className="landing__grid">
          {expiringListings.map((listing) => {
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
