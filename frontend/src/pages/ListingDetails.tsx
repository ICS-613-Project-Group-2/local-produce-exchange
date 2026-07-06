import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody, CardImage, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input } from "../components/ui/FormField";
import { getListingById, getUserById, getCommunityById, mockListings, mockClaimRequests } from "../data/mockData";
import { displayName } from "../data/utils";
import "./ListingDetails.css";

const CURRENT_USER_ID = 1;

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const listing = getListingById(Number(id));
  const [claimQuantity, setClaimQuantity] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimError, setClaimError] = useState("");

  if (!listing) {
    return (
      <div className="page-container">
        <div className="listing-details__error">
          <h1>Listing Not Found</h1>
          <p>This listing may have been removed or does not exist.</p>
          <Link to="/browse">
            <Button variant="primary">Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  const owner = getUserById(listing.user_id);
  const community = getCommunityById(listing.community_id);
  const isActive = listing.status === "available" || listing.status === "expiring-soon";
  const isOwner = listing.user_id === CURRENT_USER_ID;

  const daysUntilExpiry = Math.ceil(
    (new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const freshnessPercent = Math.max(0, Math.min(100, (daysUntilExpiry / 7) * 100));

  // Claims for this listing (owner view)
  const listingClaims = mockClaimRequests.filter((cr) => cr.listing_id === listing.listing_id);

  // Related listings from same community
  const relatedListings = mockListings
    .filter((l) => l.community_id === listing.community_id && l.listing_id !== listing.listing_id && l.status !== "closed" && l.status !== "completed")
    .slice(0, 3);

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(claimQuantity);
    if (!qty || qty <= 0) {
      setClaimError("Please enter a valid quantity.");
      return;
    }
    if (qty > listing!.quantity) {
      setClaimError(`Quantity exceeds available amount (${listing!.quantity} ${listing!.unit}).`);
      return;
    }
    setClaimError("");
    setClaimSubmitted(true);
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="listing-details__breadcrumb">
        <Link to="/browse">Browse</Link>
        <span>/</span>
        {community && <Link to={`/communities/${community.community_id}`}>{community.name}</Link>}
        {community && <span>/</span>}
        <span>{listing.name}</span>
      </nav>

      <div className="listing-details">
        {/* Image */}
        <div className="listing-details__image-section">
          <div className="listing-details__image">
            <img src={listing.photo_url} alt={listing.name} />
          </div>
          <p className="listing-details__image-note">📷 1 photo uploaded</p>
        </div>

        {/* Main Info */}
        <div className="listing-details__info">
          <div className="listing-details__header">
            <h1>{listing.name}</h1>
            <StatusBadge status={listing.status} />
          </div>

          <div className="listing-details__meta">
            <span className="listing-details__category">{listing.category}</span>
            <span className="listing-details__quantity">
              {listing.quantity} {listing.unit} available
            </span>
          </div>

          {/* Freshness Bar */}
          <div className="listing-details__freshness">
            <div className="listing-details__freshness-bar">
              <div
                className={`listing-details__freshness-fill ${daysUntilExpiry <= 2 ? "listing-details__freshness-fill--urgent" : ""}`}
                style={{ width: `${freshnessPercent}%` }}
              />
            </div>
            <div className="listing-details__freshness-labels">
              {daysUntilExpiry > 0 ? (
                <p className={daysUntilExpiry <= 2 ? "listing-details__expiring" : ""}>
                  {daysUntilExpiry <= 2 ? "⚠️" : "📅"} Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} ({new Date(listing.expiration_date).toLocaleDateString()})
                </p>
              ) : (
                <p className="listing-details__expired">❌ Expired</p>
              )}
              <p className="listing-details__posted">
                Posted {new Date(listing.date_posted).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="listing-details__description">
            <h2>Description</h2>
            <p>{listing.description}</p>
          </div>

          {/* Pickup */}
          <div className="listing-details__pickup">
            <h2>Pickup Location</h2>
            <p>📍 {listing.pickup_location}</p>
          </div>

          {/* Community */}
          {community && (
            <div className="listing-details__community">
              <p>🏘️ <Link to={`/communities/${community.community_id}`}>{community.name}</Link></p>
            </div>
          )}

          {/* Actions Row */}
          <div className="listing-details__action-row">
            {isOwner && (
              <Link to={`/listings/${listing.listing_id}/edit`}>
                <Button variant="outline" size="sm">Edit Listing</Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={() => alert("Share link copied!")}>Share</Button>
            <Button variant="outline" size="sm" onClick={() => alert("Report submitted.")}>Report</Button>
          </div>

          {/* Owner Card */}
          {owner && (
            <Card variant="warm">
              <CardBody>
                <div className="listing-details__owner">
                  {owner.profile_photo_url ? (
                    <img src={owner.profile_photo_url} alt={owner.name} className="listing-details__owner-photo" />
                  ) : (
                    <div className="listing-details__owner-photo listing-details__owner-photo--placeholder">
                      {owner.name[0]}
                    </div>
                  )}
                  <div className="listing-details__owner-info">
                    <h3>{displayName(owner.name)}</h3>
                    {owner.location && <p>📍 {owner.location}</p>}
                    {owner.rating && <p>⭐ {owner.rating} rating</p>}
                  </div>
                  {!isOwner && isActive && (
                    <Button variant="primary" size="sm">Message Owner</Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Claim Requests (owner view) */}
          {isOwner && listingClaims.length > 0 && (
            <div className="listing-details__claims-summary">
              <h2>Claim Requests</h2>
              <div className="listing-details__claims-list">
                {listingClaims.map((claim) => {
                  const claimant = getUserById(claim.requester_user_id);
                  return (
                    <div key={claim.request_id} className="listing-details__claim-item">
                      <span>{displayName(claimant?.name || "Unknown")}</span>
                      <span>{claim.quantity_requested} {listing.unit}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Claim Action (non-owner) */}
          {!isOwner && isActive && !claimSubmitted && (
            <div className="listing-details__claim">
              <h2>Request This Item</h2>
              <form onSubmit={handleClaimSubmit} className="listing-details__claim-form">
                <FormField
                  label={`Quantity (${listing.unit})`}
                  htmlFor="claim-qty"
                  error={claimError}
                  required
                >
                  <Input
                    id="claim-qty"
                    type="number"
                    min="1"
                    max={listing.quantity}
                    placeholder={`Max ${listing.quantity}`}
                    value={claimQuantity}
                    onChange={(e) => setClaimQuantity(e.target.value)}
                    hasError={!!claimError}
                  />
                </FormField>
                <Button variant="primary" type="submit">
                  Submit Claim Request
                </Button>
              </form>
            </div>
          )}

          {claimSubmitted && (
            <div className="listing-details__claim-success">
              <p>✅ Claim request submitted! The listing owner will be notified. You can coordinate pickup details through messages.</p>
              <Link to="/messages">
                <Button variant="outline">Go to Messages</Button>
              </Link>
            </div>
          )}

          {!isActive && !isOwner && (
            <div className="listing-details__inactive">
              <p>This listing is no longer active and cannot accept new claims.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <section className="listing-details__related">
          <h2>More from {community?.name}</h2>
          <div className="listing-details__related-grid">
            {relatedListings.map((related) => (
              <Card key={related.listing_id} className="browse__card">
                <CardImage src={related.photo_url} alt={related.name} />
                <CardBody>
                  <div className="browse__card-header">
                    <h3>{related.name}</h3>
                    <StatusBadge status={related.status} />
                  </div>
                  <p className="browse__card-meta">{related.quantity} {related.unit}</p>
                </CardBody>
                <CardFooter>
                  <Link to={`/listings/${related.listing_id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
