import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import Modal, { ModalFooter } from "../components/ui/Modal";
import FormField, { Textarea } from "../components/ui/FormField";
import EmptyState from "../components/feedback/EmptyState";
import {
  listMyClaims,
  approveClaim,
  declineClaim,
  pickupClaim,
  completeClaim,
  createReview,
  ApiError,
  type ClaimHistoryResponse,
} from "../lib/api";
import { NO_PHOTO_URL } from "../lib/placeholder";
import "./ListingHistory.css";

function statusBadgeStatus(status: string | null): BadgeStatus {
  switch (status) {
    case "requested":
      return "pending";
    case "approved":
      return "approved";
    case "picked_up":
      return "picked-up";
    case "completed":
      return "completed";
    case "denied":
      return "denied";
    case "cancelled":
      return "canceled";
    default:
      return "pending";
  }
}

function statusLabel(status: string | null): string {
  if (!status) return "Unknown";
  if (status === "cancelled") return "Canceled";
  if (status === "picked_up") return "Picked Up";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ListingHistory() {
  const [claims, setClaims] = useState<ClaimHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ClaimHistoryResponse | null>(null);

  function loadClaims() {
    setLoading(true);
    setLoadError(null);
    listMyClaims()
      .then(setClaims)
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "History could not be loaded. Please try again.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadClaims();
  }, []);

  function runAction(claim: ClaimHistoryResponse, actionName: string, action: (id: number) => Promise<unknown>) {
    setActionError(null);
    setBusyId(claim.request_id);
    setBusyAction(actionName);
    action(claim.request_id)
      .then(() => loadClaims())
      .catch((err) => {
        setActionError(err instanceof ApiError ? err.message : "That action could not be completed.");
      })
      .finally(() => {
        setBusyId(null);
        setBusyAction(null);
      });
  }

  function handleReviewSubmitted(claimId: number) {
    setClaims((prev) =>
      prev.map((claim) =>
        claim.request_id === claimId ? { ...claim, can_review: false, already_reviewed: true } : claim
      )
    );
    setReviewTarget(null);
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Exchange History"
        subtitle="Review your previous and current produce exchanges"
      />

      {actionError && <p className="history__action-error">{actionError}</p>}

      {loading ? (
        <p className="history__status-message">Loading exchange history...</p>
      ) : loadError ? (
        <p className="history__status-message">{loadError}</p>
      ) : claims.length === 0 ? (
        <EmptyState
          icon={<span>📋</span>}
          title="No previous listings yet"
          description="Your exchange history will appear here once you claim or share produce."
          action={
            <Link to="/browse">
              <Button variant="primary">Browse Listings</Button>
            </Link>
          }
        />
      ) : (
        <div className="history__list">
          {claims.map((claim) => (
            <ClaimHistoryCard
              key={claim.request_id}
              claim={claim}
              isBusy={busyId === claim.request_id}
              busyAction={busyId === claim.request_id ? busyAction : null}
              onApprove={() => runAction(claim, "approve", approveClaim)}
              onDecline={() => runAction(claim, "decline", declineClaim)}
              onPickup={() => runAction(claim, "pickup", pickupClaim)}
              onComplete={() => runAction(claim, "complete", completeClaim)}
              onLeaveReview={() => setReviewTarget(claim)}
            />
          ))}
        </div>
      )}

      {reviewTarget && (
        <LeaveReviewModal
          claim={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => handleReviewSubmitted(reviewTarget.request_id)}
        />
      )}
    </div>
  );
}

interface ClaimHistoryCardProps {
  claim: ClaimHistoryResponse;
  isBusy: boolean;
  busyAction: string | null;
  onApprove: () => void;
  onDecline: () => void;
  onPickup: () => void;
  onComplete: () => void;
  onLeaveReview: () => void;
}

function ClaimHistoryCard({
  claim,
  isBusy,
  busyAction,
  onApprove,
  onDecline,
  onPickup,
  onComplete,
  onLeaveReview,
}: ClaimHistoryCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="history__card">
          <img
            src={claim.listing_photo_url || NO_PHOTO_URL}
            alt={claim.listing_name}
            className="history__thumb"
          />
          <div className="history__details">
            <div className="history__details-header">
              <h3>{claim.listing_name}</h3>
              <StatusBadge status={statusBadgeStatus(claim.status)} label={statusLabel(claim.status)} />
            </div>
            <p className="history__meta">
              {claim.quantity_requested}{" "}
              {claim.role === "owner" ? "requested by" : "requested from"}{" "}
              {claim.other_user_name ?? "another user"}
            </p>
            {claim.request_date && (
              <p className="history__date">
                Requested {new Date(claim.request_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="history__actions">
          {claim.status === "requested" && claim.role === "owner" && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onApprove}
                loading={busyAction === "approve"}
                disabled={isBusy}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                loading={busyAction === "decline"}
                disabled={isBusy}
              >
                Decline
              </Button>
            </>
          )}
          {claim.status === "approved" && (
            <Button
              variant="primary"
              size="sm"
              onClick={onPickup}
              loading={busyAction === "pickup"}
              disabled={isBusy}
            >
              Mark Picked Up
            </Button>
          )}
          {claim.status === "picked_up" && (
            <Button
              variant="primary"
              size="sm"
              onClick={onComplete}
              loading={busyAction === "complete"}
              disabled={isBusy}
            >
              Mark Complete
            </Button>
          )}
          {claim.status === "completed" && claim.can_review && (
            <Button variant="secondary" size="sm" onClick={onLeaveReview}>
              Leave Review
            </Button>
          )}
          {claim.status === "completed" && claim.already_reviewed && (
            <span className="history__reviewed">✅ Review submitted</span>
          )}
          {claim.listing_id !== null && (
            <Link to={`/listings/${claim.listing_id}`}>
              <Button variant="outline" size="sm">
                View Listing
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

interface LeaveReviewModalProps {
  claim: ClaimHistoryResponse;
  onClose: () => void;
  onSubmitted: () => void;
}

function LeaveReviewModal({ claim, onClose, onSubmitted }: LeaveReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    createReview(claim.request_id, { rating, comment: comment.trim() || null })
      .then(() => onSubmitted())
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Review could not be saved. Please try again.");
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title="Leave a Review"
      description={`How was your exchange with ${claim.other_user_name ?? "this user"}?`}
    >
      <form onSubmit={handleSubmit} className="history__review-form">
        <FormField label="Rating" htmlFor="review-rating" error={error} required>
          <div className="history__stars" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`history__star ${value <= rating ? "history__star--filled" : ""}`}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                aria-pressed={value <= rating}
                onClick={() => setRating(value)}
              >
                ⭐
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Comment (optional)" htmlFor="review-comment">
          <Textarea
            id="review-comment"
            placeholder="Share how the exchange went..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </FormField>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Submit Review
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
