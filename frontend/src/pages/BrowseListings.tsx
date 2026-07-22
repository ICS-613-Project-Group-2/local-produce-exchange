import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import {
  listListings,
  listCommunities,
  ApiError,
  type ListingResponse,
  type CommunityResponse,
} from "../lib/api";
import { NO_PHOTO_URL } from "../lib/placeholder";
import "./BrowseListings.css";

// displays "expiring-soon" for available listings expiring within 2 days, otherwise the raw status
function displayStatus(listing: ListingResponse): BadgeStatus {
  if (listing.status === "available" && listing.expiration_date) {
    const daysLeft = Math.ceil(
      (new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 2) return "expiring-soon";
  }
  return (listing.status as BadgeStatus) || "available";
}

export default function BrowseListings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([listListings(), listCommunities()])
      .then(([listingsResult, communitiesResult]) => {
        setListings(listingsResult);
        setCommunities([
          ...communitiesResult.my_communities,
          ...communitiesResult.public_communities,
        ]);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load listings.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Only show non-closed, non-completed listings
  const activeListings = listings.filter(
    (l) => l.status !== "closed" && l.status !== "completed"
  );

  // Filter by search query
  const query = searchQuery.toLowerCase();
  const filteredListings = searchQuery
    ? activeListings.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          (l.category?.toLowerCase().includes(query) ?? false) ||
          (l.description?.toLowerCase().includes(query) ?? false)
      )
    : activeListings;

  // Group listings by community
  const listingsByCommunity = communities
    .map((community) => ({
      community,
      listings: filteredListings.filter((l) => l.community_id === community.community_id),
    }))
    .filter((group) => group.listings.length > 0);

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Browse Listings"
        subtitle="Find available food shared by local community members"
        action={
          <Link to="/listings/new">
            <Button variant="primary">Create Listing</Button>
          </Link>
        }
      />

      <div className="browse__search">
        <SearchBar
          placeholder="Search for produce, categories, or communities..."
          onSearch={handleSearch}
        />
      </div>

      {loading ? (
        <p className="browse__status-message">Loading listings...</p>
      ) : error ? (
        <p className="browse__status-message">{error}</p>
      ) : listingsByCommunity.length === 0 ? (
        <EmptyState
          icon={<span>🧺</span>}
          title="No listings found"
          description="Try adjusting your search or filters, or create a new listing to share with your community."
          action={
            <Link to="/listings/new">
              <Button variant="primary">Create a Listing</Button>
            </Link>
          }
        />
      ) : (
        <div className="browse__communities">
          {listingsByCommunity.map(({ community, listings }) => (
            <section key={community.community_id} className="browse__community-section">
              <div className="browse__community-header">
                <h2 className="browse__community-name">{community.name}</h2>
                <StatusBadge status={community.is_private ? "private" : "public"} />
              </div>
              <div className="browse__grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.listing_id} listing={listing} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: ListingResponse }) {
  return (
    <Card>
      <CardImage src={listing.photo_url || NO_PHOTO_URL} alt={listing.name} />
      <CardBody>
        <div className="browse__card-header">
          <h3>{listing.name}</h3>
          <StatusBadge status={displayStatus(listing)} />
        </div>
        <p className="browse__card-meta">
          {listing.quantity} {listing.unit} · {listing.category}
        </p>
        {listing.expiration_date && (
          <p className="browse__card-expiry">
            Expires {new Date(listing.expiration_date).toLocaleDateString()}
          </p>
        )}
        {listing.pickup_location && (
          <p className="browse__card-location">📍 {listing.pickup_location}</p>
        )}
      </CardBody>
      <CardFooter>
        <Link to={`/listings/${listing.listing_id}`}>
          <Button variant="primary" size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
