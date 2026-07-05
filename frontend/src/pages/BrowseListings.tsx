import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { mockListings, mockCommunities, getCommunityById } from "../data/mockData";
import type { Listing } from "../data/types";
import "./BrowseListings.css";

export default function BrowseListings() {
  const [searchQuery, setSearchQuery] = useState("");

  // Only show non-closed, non-completed listings
  const activeListings = mockListings.filter(
    (l) => l.status !== "closed" && l.status !== "completed"
  );

  // Filter by search query
  const filteredListings = searchQuery
    ? activeListings.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeListings;

  // Group listings by community
  const userCommunities = mockCommunities.filter((c) => !c.is_private || c.community_id <= 3);
  const listingsByCommunity = userCommunities
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

      {listingsByCommunity.length === 0 ? (
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

function ListingCard({ listing }: { listing: Listing }) {
  const community = getCommunityById(listing.community_id);

  return (
    <Card>
      <CardImage src={listing.photo_url} alt={listing.name} />
      <CardBody>
        <div className="browse__card-header">
          <h3>{listing.name}</h3>
          <StatusBadge status={listing.status} />
        </div>
        <p className="browse__card-meta">
          {listing.quantity} {listing.unit} · {listing.category}
        </p>
        <p className="browse__card-expiry">
          Expires {new Date(listing.expiration_date).toLocaleDateString()}
        </p>
        <p className="browse__card-location">📍 {listing.pickup_location}</p>
        {community && <p className="browse__card-community">🏘️ {community.name}</p>}
      </CardBody>
      <CardFooter>
        <Link to={`/listings/${listing.listing_id}`}>
          <Button variant="primary" size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
