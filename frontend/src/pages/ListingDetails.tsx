import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody, CardImage, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input } from "../components/ui/FormField";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  getListing,
  getCommunity,
  getClaimsForListing,
  createClaim,
  approveClaim,
  declineClaim,
  browseListings,
  type ListingResponse,
  type CommunityResponse,
  type ClaimResponse,
} from "../lib/api";
import type { BadgeStatus } from "../components/ui/StatusBadge";
import "./ListingDetails.css";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const currentUserId = user?.user_id || 0;

  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [relatedListings, setRelatedListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [claimQuantity, setClaimQuantity] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Snapshot "now" once (lazy initializer) instead of calling Date.now()
  // directly during render, which is impure and gets flagged by react-hooks/purity.
  const [now] = useState(() => Date.now());

  async function loadListing() {
    setLoading(true);
    setError(null);
    try {
      const listingData = await getListing(Number(id));
      setListing(listingData);

      // Load community info
      if (listingData.community_id) {
        getCommunity(listingData.community_id).then(setCommunity).catch(() => setCommunity(null));
        // Related listings from same community
        browseListings({ community_id: listingData.community_id })
          .then((all) =>
            setRelatedListings(
              all.filter((l) => l.listing_id !== listingData.listing_id && l.status !== "closed" && l.status !== "completed").slice(0, 3)
            )
          )
          .catch(() => setRelatedListings([]));
      }

      // Load claims
      getClaimsForListing(listingData.listing_id).then(setClaims).catch(() => setClaims([]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- false positive: setState calls in loadListing happen inside try/catch/finally after an await (see facebook/react#34905)
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadListing is redefined each render; id is the real trigger
  }, [id]);

  if (loading) {
    return <div className="page-container"><p>Loading listing...</p></div>;
  }

  if (error || !listing) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🧺</span>}
          title="Listing Not Found"
          description={error || "This listing may have been removed or does not exist."}
          action={<Link to="/browse"><Button variant="primary">Back to Browse</Button></Link>}
        />
      </div>
    );
  }

  const isActive = listing.status === "available" || listing.status === "expiring-soon";
  const isOwner = listing.user_id === currentUserId;

  const daysUntilExpiry = listing.expiration_date
    ? Math.ceil((new Date(listing.expiration_date).getTime() - now) / (1000 * 60 * 60 * 24))
    : null;
  const freshnessPercent = daysUntilExpiry !== null ? Math.max(0, Math.min(100, (daysUntilExpiry / 7) * 100)) : 100;

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(claimQuantity);
    if (!qty || qty <= 0) {
      setClaimError("Please enter a valid quantity.");
      return;
    }
    if (listing && qty > listing.quantity) {
      setClaimError(`Quantity exceeds available amount (${listing.quantity} ${listing.unit || "units"}).`);
      return;
    }
    setClaimError("");
    setSubmitting(true);
    try {
      await createClaim(listing!.listing_id, qty);
      setClaimSubmitted(true);
      // Refresh claims
      const updatedClaims = await getClaimsForListing(listing!.listing_id);
      setClaims(updatedClaims);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApproveClaim(claimId: number) {
    try {
      await approveClaim(claimId);
      const updatedClaims = await getClaimsForListing(listing!.listing_id);
      setClaims(updatedClaims);
      const updatedListing = await getListing(listing!.listing_id);
      setListing(updatedListing);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve claim");
    }
  }

  async function handleDeclineClaim(claimId: number) {
    try {
      await declineClaim(claimId);
      const updatedClaims = await getClaimsForListing(listing!.listing_id);
      setClaims(updatedClaims);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline claim");
    }
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
          {listing.photo_url && (
            <div className="listing-details__image">
              <img src={listing.photo_url} alt={listing.name} />
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="listing-details__info">
          <div className="listing-details__header">
            <h1>{listing.name}</h1>
            {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
          </div>

          <div className="listing-details__meta">
            {listing.category && <span className="listing-details__category">{listing.category}</span>}
            <span className="listing-details__quantity">
              {listing.quantity} {listing.unit || "units"} available
            </span>
          </div>

          {/* Freshness Bar */}
          {daysUntilExpiry !== null && (
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
            </div>
          )}

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

          {/* Actions Row */}
          <div className="listing-details__action-row">
            {isOwner && (
              <Link to={`/listings/${listing.listing_id}/edit`}>
                <Button variant="outline" size="sm">Edit Listing</Button>
              </Link>
            )}
          </div>

          {/* Claim Requests (owner view) */}
          {isOwner && claims.length > 0 && (
            <div className="listing-details__claims-summary">
              <h2>Claim Requests</h2>
              <div className="listing-details__claims-list">
                {claims.map((claim) => (
                  <div key={claim.request_id} className="listing-details__claim-item">
                    <span>Requester #{claim.requester_user_id}</span>
                    <span>{claim.quantity_requested} {listing.unit || "units"}</span>
                    <StatusBadge status={(claim.status || "pending") as BadgeStatus} />
                    {claim.status === "requested" && (
                      <div className="listing-details__claim-actions">
                        <Button variant="primary" size="sm" onClick={() => handleApproveClaim(claim.request_id)}>Approve</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeclineClaim(claim.request_id)}>Decline</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Action (non-owner) */}
          {!isOwner && isActive && !claimSubmitted && (
            <div className="listing-details__claim">
              <h2>Request This Item</h2>
              <form onSubmit={handleClaimSubmit} className="listing-details__claim-form">
                <FormField label={`Quantity (${listing.unit || "units"})`} htmlFor="claim-qty" error={claimError} required>
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
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Claim Request"}
                </Button>
              </form>
            </div>
          )}

          {claimSubmitted && (
            <div className="listing-details__claim-success">
              <p>✅ Claim request submitted! The listing owner will be notified. You can coordinate pickup details through messages.</p>
              <Link to="/messages"><Button variant="outline">Go to Messages</Button></Link>
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
                {related.photo_url && <CardImage src={related.photo_url} alt={related.name} />}
                <CardBody>
                  <div className="browse__card-header">
                    <h3>{related.name}</h3>
                    {related.status && <StatusBadge status={related.status as BadgeStatus} />}
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