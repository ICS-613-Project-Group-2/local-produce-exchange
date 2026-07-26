import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import {
  listListings,
  listCommunities,
  type ListingResponse,
  type CommunityResponse,
} from "../lib/api";
import { NO_PHOTO_URL } from "../lib/placeholder";
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

function ListingCard({
  listing,
  communityName,
  linked = false,
}: {
  listing: ListingResponse;
  communityName?: string;
  linked?: boolean;
}) {
  return (
    <Card>
      <CardImage src={listing.photo_url || NO_PHOTO_URL} alt={listing.name} />
      <CardBody>
        <div className="landing__card-header">
          <h3>{listing.name}</h3>
          <StatusBadge status={(listing.status as BadgeStatus) || "available"} />
        </div>
        <p className="landing__card-meta">
          {listing.quantity} {listing.unit}
          {listing.expiration_date && ` · Expires ${new Date(listing.expiration_date).toLocaleDateString()}`}
        </p>
        {listing.pickup_location && <p className="landing__card-location">📍 {listing.pickup_location}</p>}
        {communityName && <p className="landing__card-community">🏘️ {communityName}</p>}
      </CardBody>
      {linked && (
        <CardFooter>
          <Link to={`/listings/${listing.listing_id}`}>
            <Button variant="primary" size="sm">View Details</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

function LoggedOutLanding() {
  const [featuredListings, setFeaturedListings] = useState<ListingResponse[]>([]);

  useEffect(() => {
    // communities require authentication to fetch, so the logged-out landing only shows listings
    listListings({ status_filter: "available" })
      .then((listings) => setFeaturedListings(listings.slice(0, 3)))
      .catch(() => setFeaturedListings([]));
  }, []);

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
      {featuredListings.length > 0 && (
        <section className="landing__section">
          <h2 className="landing__section-title">Featured Listings</h2>
          <div className="landing__grid">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.listing_id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Communities Preview */}
      <section className="landing__section">
        <h2 className="landing__section-title">Join a Community</h2>
        <p className="landing__trust-text">
          Sign up to browse the local food-sharing communities near you — public groups anyone can join, and private groups by invitation.
        </p>
        <div className="landing__hero-actions">
          <Link to="/signup">
            <Button variant="primary" size="lg">Sign Up to Explore Communities</Button>
          </Link>
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
  const [expiringListings, setExpiringListings] = useState<ListingResponse[]>([]);
  const [communitiesById, setCommunitiesById] = useState<Map<number, CommunityResponse>>(new Map());

  useEffect(() => {
    Promise.all([listListings(), listCommunities()])
      .then(([listings, communitiesResult]) => {
        const active = listings
          .filter((l) => l.status === "available" || l.status === "reserved")
          .slice(0, 4);
        setExpiringListings(active);

        const allCommunities = [...communitiesResult.my_communities, ...communitiesResult.public_communities];
        setCommunitiesById(new Map(allCommunities.map((c) => [c.community_id, c])));
      })
      .catch(() => {
        setExpiringListings([]);
        setCommunitiesById(new Map());
      });
  }, []);

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
          {expiringListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              communityName={
                listing.community_id !== null
                  ? communitiesById.get(listing.community_id)?.name
                  : undefined
              }
              linked
            />
          ))}
        </div>
      </section>
    </div>
  );
}
