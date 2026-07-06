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

const CATEGORIES = ["All", "Fruits", "Vegetables", "Herbs", "Baked Goods", "Pantry Items"];
type SortOption = "newest" | "expiring" | "quantity";
type ViewMode = "grid" | "list";

export default function BrowseListings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Only show non-closed, non-completed listings
  const activeListings = mockListings.filter(
    (l) => l.status !== "closed" && l.status !== "completed"
  );

  // Filter by search query
  let filteredListings = searchQuery
    ? activeListings.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeListings;

  // Filter by category
  if (activeCategory !== "All") {
    filteredListings = filteredListings.filter((l) => l.category === activeCategory);
  }

  // Sort
  filteredListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "expiring") {
      return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
    }
    if (sortBy === "quantity") {
      return b.quantity - a.quantity;
    }
    return new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime();
  });

  // Group all filtered listings by community (including expiring)
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

  const totalCount = filteredListings.length;
  const communityCount = new Set(filteredListings.map((l) => l.community_id)).size;

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

      {/* Search */}
      <div className="browse__search">
        <SearchBar
          placeholder="Search for produce, categories, or communities..."
          onSearch={handleSearch}
        />
      </div>

      {/* Category Chips */}
      <div className="browse__categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`browse__category-chip ${activeCategory === cat ? "browse__category-chip--active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls Row */}
      <div className="browse__controls">
        <span className="browse__result-count">
          Showing {totalCount} listing{totalCount !== 1 ? "s" : ""} across {communityCount} communit{communityCount !== 1 ? "ies" : "y"}
        </span>
        <div className="browse__controls-right">
          <select
            className="browse__sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Newest First</option>
            <option value="expiring">Expiring Soonest</option>
            <option value="quantity">Most Quantity</option>
          </select>
          <div className="browse__view-toggle">
            <button
              className={`browse__view-btn ${viewMode === "grid" ? "browse__view-btn--active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              className={`browse__view-btn ${viewMode === "list" ? "browse__view-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 ? (
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
        <>
          {/* Community Sections */}
          <div className="browse__communities">
            {listingsByCommunity.map(({ community, listings }) => (
              <section key={community.community_id} className="browse__community-section">
                <div className="browse__community-header">
                  <h2 className="browse__community-name">{community.name}</h2>
                  <StatusBadge status={community.is_private ? "private" : "public"} />
                  <span className="browse__community-count">{listings.length} listing{listings.length !== 1 ? "s" : ""}</span>
                </div>
                <div className={viewMode === "grid" ? "browse__grid" : "browse__list"}>
                  {listings.map((listing) => (
                    <ListingCard key={listing.listing_id} listing={listing} viewMode={viewMode} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ListingCard({ listing, viewMode }: { listing: Listing; viewMode: ViewMode }) {
  const community = getCommunityById(listing.community_id);
  const daysLeft = Math.ceil((new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (viewMode === "list") {
    return (
      <Link to={`/listings/${listing.listing_id}`} className="browse__list-item">
        <img src={listing.photo_url} alt={listing.name} className="browse__list-thumb" />
        <div className="browse__list-info">
          <div className="browse__list-header">
            <h3>{listing.name}</h3>
            <StatusBadge status={listing.status} />
          </div>
          <p className="browse__list-meta">
            {listing.quantity} {listing.unit} · {listing.category} · 📍 {listing.pickup_location}
          </p>
          {community && <span className="browse__list-community">🏘️ {community.name}</span>}
        </div>
        <div className="browse__list-expiry">
          {daysLeft <= 2 && daysLeft >= 0 ? (
            <span className="browse__list-expiry--urgent">Expires in {daysLeft}d</span>
          ) : (
            <span>{new Date(listing.expiration_date).toLocaleDateString()}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Card className="browse__card">
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
          {daysLeft <= 2 && daysLeft >= 0 ? `⚠️ Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}` : `Expires ${new Date(listing.expiration_date).toLocaleDateString()}`}
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
