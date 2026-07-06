import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import ReviewModal from "../components/feedback/ReviewModal";
import { mockListings, mockClaimRequests, getUserById, getCommunityById } from "../data/mockData";
import { displayName } from "../data/utils";
import "./ListingHistory.css";

const CURRENT_USER_ID = 1;

type ViewTab = "all" | "shared" | "claimed";
type FilterTab = "all" | "available" | "reserved" | "completed" | "canceled" | "closed";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}

type HistoryItem = {
  id: string;
  name: string;
  photo_url: string;
  date: string;
  quantity: string;
  status: string;
  community: string;
  type: "shared" | "claimed";
  listing_id: number;
  other_user_id: number | null;
};

export default function ListingHistory() {
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [reviewModal, setReviewModal] = useState<{ open: boolean; recipientName: string; listingName: string }>({
    open: false,
    recipientName: "",
    listingName: "",
  });

  // Build history items
  const myListings = mockListings.filter((l) => l.user_id === CURRENT_USER_ID);
  const myClaims = mockClaimRequests.filter((cr) => cr.requester_user_id === CURRENT_USER_ID);

  const historyItems: HistoryItem[] = [
    ...myListings.map((l) => {
      const community = getCommunityById(l.community_id);
      // Find a claimant for this listing
      const claim = mockClaimRequests.find((cr) => cr.listing_id === l.listing_id);
      return {
        id: `listing-${l.listing_id}`,
        name: l.name,
        photo_url: l.photo_url,
        date: l.date_posted,
        quantity: `${l.quantity} ${l.unit}`,
        status: l.status,
        community: community?.name || "",
        type: "shared" as const,
        listing_id: l.listing_id,
        other_user_id: claim?.requester_user_id || null,
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
        type: "claimed" as const,
        listing_id: cr.listing_id,
        other_user_id: listing?.user_id || null,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter by view
  const viewFiltered = viewTab === "all"
    ? historyItems
    : historyItems.filter((item) => item.type === viewTab);

  // Filter by status
  const filteredItems = activeFilter === "all"
    ? viewFiltered
    : viewFiltered.filter((item) => item.status === activeFilter);

  // Stats
  const totalExchanges = historyItems.length;
  const completedCount = historyItems.filter((i) => i.status === "completed").length;
  const totalShared = myListings.reduce((sum, l) => sum + l.quantity, 0);

  const filters: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "Active" },
    { value: "reserved", label: "Reserved" },
    { value: "completed", label: "Completed" },
    { value: "canceled", label: "Canceled" },
    { value: "closed", label: "Closed" },
  ];

  function handleOpenReview(item: HistoryItem) {
    const otherUser = item.other_user_id ? getUserById(item.other_user_id) : null;
    setReviewModal({
      open: true,
      recipientName: otherUser?.name ? displayName(otherUser.name) : "User",
      listingName: item.name,
    });
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Listing History"
        subtitle="Review your previous and current food-sharing activity"
      />

      {/* Summary Stats */}
      <div className="history__stats">
        <Card>
          <CardBody>
            <div className="history__stat">
              <span className="history__stat-number">{totalExchanges}</span>
              <span className="history__stat-label">Total Exchanges</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="history__stat">
              <span className="history__stat-number">{completedCount}</span>
              <span className="history__stat-label">Completed</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="history__stat">
              <span className="history__stat-number">{totalShared}</span>
              <span className="history__stat-label">Items Listed</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="history__view-toggle">
        <button
          className={`history__view-btn ${viewTab === "all" ? "history__view-btn--active" : ""}`}
          onClick={() => setViewTab("all")}
        >
          All
        </button>
        <button
          className={`history__view-btn ${viewTab === "shared" ? "history__view-btn--active" : ""}`}
          onClick={() => setViewTab("shared")}
        >
          Shared by Me
        </button>
        <button
          className={`history__view-btn ${viewTab === "claimed" ? "history__view-btn--active" : ""}`}
          onClick={() => setViewTab("claimed")}
        >
          Claimed by Me
        </button>
      </div>

      {/* Status Filters */}
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
          {filteredItems.map((item) => {
            const otherUser = item.other_user_id ? getUserById(item.other_user_id) : null;
            return (
              <div key={item.id} className="history__row">
                <img src={item.photo_url} alt={item.name} className="history__thumb" />
                <div className="history__info">
                  <div className="history__info-header">
                    <h3>{item.name}</h3>
                    <StatusBadge status={item.status as any} />
                  </div>
                  <p className="history__meta">
                    {item.type === "shared" ? "You shared" : "You claimed"} · {item.quantity} · {item.community}
                  </p>
                  <div className="history__row-footer">
                    {otherUser && (
                      <span className="history__other-user">
                        {otherUser.profile_photo_url ? (
                          <img src={otherUser.profile_photo_url} alt={otherUser.name} className="history__other-avatar" />
                        ) : (
                          <span className="history__other-avatar history__other-avatar--placeholder">{otherUser.name[0]}</span>
                        )}
                        {item.type === "shared" ? `Claimed by ${displayName(otherUser.name)}` : `From ${displayName(otherUser.name)}`}
                      </span>
                    )}
                    <span className="history__date">{timeAgo(item.date)}</span>
                  </div>
                </div>
                <div className="history__actions">
                  <Link to={`/listings/${item.listing_id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  {item.status === "completed" && (
                    <Button variant="secondary" size="sm" onClick={() => handleOpenReview(item)}>
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        open={reviewModal.open}
        onOpenChange={(open) => setReviewModal((prev) => ({ ...prev, open }))}
        recipientName={reviewModal.recipientName}
        listingName={reviewModal.listingName}
        onSubmit={(rating, comment) => {
          console.log("Review submitted:", { rating, comment });
        }}
      />
    </div>
  );
}
