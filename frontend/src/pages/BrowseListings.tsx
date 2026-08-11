import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { browseListings, type ListingResponse } from "../lib/api";
import type { BadgeStatus } from "../components/ui/StatusBadge";
import "./BrowseListings.css";

const CATEGORIES = ["All", "Fruits", "Vegetables", "Herbs", "Baked Goods", "Pantry Items"];
type SortOption = "newest" | "expiring" | "quantity";
type ViewMode = "grid" | "list";

export default function BrowseListings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query — wait 400ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    loadListings();
  }, [debouncedSearch, activeCategory]);

  async function loadListings() {
    setLoading(true);
    setError(null);
    try {
      const data = await browseListings({
        search: debouncedSearch || undefined,
        category: activeCategory !== "All" ? activeCategory : undefined,
      });
      setListings(data.filter((l) => l.status !== "closed" && l.status !== "completed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  // Sort locally
  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === "expiring") {
      const aDate = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
      const bDate = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
      return aDate - bDate;
    }
    if (sortBy === "quantity") {
      return b.quantity - a.quantity;
    }
    const aPosted = a.date_posted ? new Date(a.date_posted).getTime() : 0;
    const bPosted = b.date_posted ? new Date(b.date_posted).getTime() : 0;
    return bPosted - aPosted;
  });

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  const totalCount = sortedListings.length;

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
          Showing {totalCount} listing{totalCount !== 1 ? "s" : ""}
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

      {/* Content */}
      {loading ? (
        <p className="browse__loading">Loading listings...</p>
      ) : error ? (
        <EmptyState
          icon={<span>⚠️</span>}
          title="Something went wrong"
          description={error}
          action={<Button variant="primary" onClick={loadListings}>Try Again</Button>}
        />
      ) : sortedListings.length === 0 ? (
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
        <div className={viewMode === "grid" ? "browse__grid" : "browse__list"}>
          {sortedListings.map((listing) => (
            <ListingCard key={listing.listing_id} listing={listing} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, viewMode }: { listing: ListingResponse; viewMode: ViewMode }) {
  const daysLeft = listing.expiration_date
    ? Math.ceil((new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (viewMode === "list") {
    return (
      <Link to={`/listings/${listing.listing_id}`} className="browse__list-item">
        {listing.photo_url && (
          <img src={listing.photo_url} alt={listing.name} className="browse__list-thumb" />
        )}
        <div className="browse__list-info">
          <div className="browse__list-header">
            <h3>{listing.name}</h3>
            {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
          </div>
          <p className="browse__list-meta">
            {listing.quantity} {listing.unit} · {listing.category}
            {listing.pickup_location && ` · 📍 ${listing.pickup_location}`}
          </p>
        </div>
        <div className="browse__list-expiry">
          {daysLeft !== null && daysLeft <= 2 && daysLeft >= 0 ? (
            <span className="browse__list-expiry--urgent">Expires in {daysLeft}d</span>
          ) : listing.expiration_date ? (
            <span>{new Date(listing.expiration_date).toLocaleDateString()}</span>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Card className="browse__card">
      {listing.photo_url && <CardImage src={listing.photo_url} alt={listing.name} />}
      <CardBody>
        <div className="browse__card-header">
          <h3>{listing.name}</h3>
          {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
        </div>
        <p className="browse__card-meta">
          {listing.quantity} {listing.unit} · {listing.category}
        </p>
        {daysLeft !== null && (
          <p className="browse__card-expiry">
            {daysLeft <= 2 && daysLeft >= 0
              ? `⚠️ Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
              : `Expires ${new Date(listing.expiration_date!).toLocaleDateString()}`}
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
