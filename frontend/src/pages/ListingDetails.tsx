import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import FormField, { Input } from "../components/ui/FormField";
import { getListing, getCommunity, ApiError, type ListingResponse, type CommunityResponse } from "../lib/api";
import { NO_PHOTO_URL } from "../lib/placeholder";
import "./ListingDetails.css";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);

  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [claimQuantity, setClaimQuantity] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getListing(listingId)
      .then((result) => {
        setListing(result);
        if (result.community_id !== null) {
          getCommunity(result.community_id)
            .then(setCommunity)
            .catch(() => setCommunity(null));
        }
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load this listing.");
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <div className="page-container">
        <p className="listing-details__status-message">Loading listing...</p>
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="page-container">
        <div className="listing-details__error">
          <h1>Listing Not Found</h1>
          <p>{loadError || "This listing may have been removed or does not exist."}</p>
          <Link to="/browse">
            <Button variant="primary">Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = listing.status === "available" || listing.status === "reserved";

  const daysUntilExpiry = listing.expiration_date
    ? Math.ceil((new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(claimQuantity);
    if (!qty || qty <= 0) {
      setClaimError("Please enter a valid quantity.");
      return;
    }
    if (qty > listing!.quantity) {
      setClaimError(`Quantity exceeds available amount (${listing!.quantity} ${listing!.unit ?? ""}).`);
      return;
    }
    setClaimError("");
    setClaimSubmitted(true);
  }

  return (
    <div className="page-container">
      <div className="listing-details">
        {/* Image */}
        <div className="listing-details__image">
          <img src={listing.photo_url || NO_PHOTO_URL} alt={listing.name} />
        </div>

        {/* Main Info */}
        <div className="listing-details__info">
          <div className="listing-details__header">
            <h1>{listing.name}</h1>
            <StatusBadge status={(listing.status as BadgeStatus) || "available"} />
          </div>

          <div className="listing-details__meta">
            {listing.category && <span className="listing-details__category">{listing.category}</span>}
            <span className="listing-details__quantity">
              {listing.quantity} {listing.unit} available
            </span>
          </div>

          {/* Freshness */}
          <div className="listing-details__freshness">
            {daysUntilExpiry === null ? null : daysUntilExpiry > 0 ? (
              <p className={daysUntilExpiry <= 2 ? "listing-details__expiring" : ""}>
                {daysUntilExpiry <= 2 ? "⚠️" : "📅"} Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} ({new Date(listing.expiration_date!).toLocaleDateString()})
              </p>
            ) : (
              <p className="listing-details__expired">❌ Expired</p>
            )}
            {listing.date_posted && (
              <p className="listing-details__posted">
                Posted {new Date(listing.date_posted).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div className="listing-details__description">
              <h2>Description</h2>
              <p>{listing.description}</p>
            </div>
          )}

          {/* Pickup */}
          {listing.pickup_location && (
            <div className="listing-details__pickup">
              <h2>Pickup Location</h2>
              <p>📍 {listing.pickup_location}</p>
            </div>
          )}

          {/* Community */}
          {community && (
            <div className="listing-details__community">
              <p>🏘️ <Link to={`/communities/${community.community_id}`}>{community.name}</Link></p>
            </div>
          )}

          {/* Claim Action */}
          {isActive && !claimSubmitted && (
            <div className="listing-details__claim">
              <h2>Request This Item</h2>
              <form onSubmit={handleClaimSubmit} className="listing-details__claim-form">
                <FormField
                  label={`Quantity (${listing.unit ?? "units"})`}
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

          {!isActive && (
            <div className="listing-details__inactive">
              <p>This listing is no longer active and cannot accept new claims.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
