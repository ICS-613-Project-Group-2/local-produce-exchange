import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { mockListings, mockClaimRequests, getCommunityById } from "../data/mockData";
import "./ListingHistory.css";

const CURRENT_USER_ID = 1;

type FilterTab = "all" | "available" | "reserved" | "completed" | "canceled" | "closed";

export default function ListingHistory() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  // All listings owned by user + all claims made by user
  const myListings = mockListings.filter((l) => l.user_id === CURRENT_USER_ID);
  const myClaims = mockClaimRequests.filter((cr) => cr.requester_user_id === CURRENT_USER_ID);

  // Combine into a unified history
  type HistoryItem = {
    id: string;
    name: string;
    photo_url: string;
    date: string;
    quantity: string;
    status: string;
    community: string;
    type: "listing" | "claim";
    listing_id: number;
  };

  const historyItems: HistoryItem[] = [
    ...myListings.map((l) => {
      const community = getCommunityById(l.community_id);
      return {
        id: `listing-${l.listing_id}`,
        name: l.name,
        photo_url: l.photo_url,
        date: l.date_posted,
        quantity: `${l.quantity} ${l.unit}`,
        status: l.status,
        community: community?.name || "",
        type: "listing" as const,
        listing_id: l.listing_id,
      };
    }),
    ...myClaims.map((cr) => {
      const listing = mockListings.find((l) => l.listing_id === cr.listing_id);
      const community = listing ? getCommunityById(listing.community_id) : undefined;
      return {
        id: `claim-${cr.request_id}`,
        name: listing?.name || "Unknown Listing",
        photo_url: listing?.photo_url || "",
        date: cr.request_date,
        quantity: `${cr.quantity_requested} ${listing?.unit || ""}`,
        status: cr.status,
        community: community?.name || "",
        type: "claim" as const,
        listing_id: cr.listing_id,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = activeFilter === "all"
    ? historyItems
    : historyItems.filter((item) => item.status === activeFilter);

  const filters: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "Active" },
    { value: "reserved", label: "Reserved" },
    { value: "completed", label: "Completed" },
    { value: "canceled", label: "Canceled" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Listing History"
        subtitle="Review your previous and current food-sharing activity"
      />

      {/* Filter Tabs */}
      <div className="history__filters">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`history__filter ${activeFilter === filter.value ? "history__filter--active" : ""}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<span>📋</span>}
          title="No listing history"
          description="Your past listings and exchange requests will appear here."
          action={
            <Link to="/listings/new">
              <Button variant="primary">Create a Listing</Button>
            </Link>
          }
        />
      ) : (
        <div className="history__list">
          {filteredItems.map((item) => (
            <div key={item.id} className="history__row">
              <img src={item.photo_url} alt={item.name} className="history__thumb" />
              <div className="history__info">
                <div className="history__info-header">
                  <h3>{item.name}</h3>
                  <StatusBadge status={item.status as any} />
                </div>
                <p className="history__meta">
                  {item.type === "listing" ? "Your listing" : "Your claim"} · {item.quantity} · {item.community}
                </p>
                <p className="history__date">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="history__actions">
                <Link to={`/listings/${item.listing_id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                {item.status === "completed" && (
                  <Button variant="secondary" size="sm">Leave Review</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
