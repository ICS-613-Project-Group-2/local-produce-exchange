import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input } from "../components/ui/FormField";
import { getListingById, getUserById, getCommunityById } from "../data/mockData";
import "./ListingDetails.css";

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

  const daysUntilExpiry = Math.ceil(
    (new Date(listing.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

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
      <div className="listing-details">
        {/* Image */}
        <div className="listing-details__image">
          <img src={listing.photo_url} alt={listing.name} />
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

          {/* Freshness */}
          <div className="listing-details__freshness">
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

          {/* Owner Card */}
          {owner && (
            <Card variant="warm">
              <CardBody>
                <div className="listing-details__owner">
                  {owner.profile_photo_url ? (
                    <img
                      src={owner.profile_photo_url}
                      alt={owner.name}
                      className="listing-details__owner-photo"
                    />
                  ) : (
                    <div className="listing-details__owner-photo listing-details__owner-photo--placeholder">
                      {owner.name[0]}
                    </div>
                  )}
                  <div className="listing-details__owner-info">
                    <h3>{owner.name}</h3>
                    {owner.location && <p>📍 {owner.location}</p>}
                    {owner.rating && <p>⭐ {owner.rating} rating</p>}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Claim Action */}
          {isActive && !claimSubmitted && (
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
