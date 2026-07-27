import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import {
  listMyClaims,
  approveClaim,
  declineClaim,
  pickupClaim,
  completeClaim,
  cancelClaim,
  ApiError,
  type ClaimHistoryResponse,
} from "../lib/api";
import { NO_PHOTO_URL } from "../lib/placeholder";
import "./Dashboard.css";

const ACTIVE_STATUSES = ["requested", "approved", "picked_up"];

function statusBadgeStatus(status: string | null): BadgeStatus {
  switch (status) {
    case "requested":
      return "pending";
    case "approved":
      return "approved";
    case "picked_up":
      return "picked-up";
    default:
      return "pending";
  }
}

function statusLabel(status: string | null): string {
  if (!status) return "Unknown";
  if (status === "picked_up") return "Picked Up";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Dashboard() {
  const [claims, setClaims] = useState<ClaimHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  function loadClaims() {
    setLoading(true);
    setLoadError(null);
    listMyClaims()
      .then(setClaims)
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Requests could not be loaded. Please try again.");
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

  const activeClaims = claims.filter((claim) => claim.status !== null && ACTIVE_STATUSES.includes(claim.status));
  const incoming = activeClaims.filter((claim) => claim.role === "owner");
  const outgoing = activeClaims.filter((claim) => claim.role === "claimant");

  return (
    <div className="page-container">
      <PageHeader title="Dashboard" subtitle="Your active listing requests" />

      {actionError && <p className="dashboard__action-error">{actionError}</p>}

      {loading ? (
        <p className="dashboard__status-message">Loading your requests...</p>
      ) : loadError ? (
        <p className="dashboard__status-message">{loadError}</p>
      ) : (
        <div className="dashboard__sections">
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Incoming Requests</h2>
            {incoming.length === 0 ? (
              <EmptyState
                icon={<span>📥</span>}
                title="No incoming requests"
                description="Requests other people make on your listings will show up here."
              />
            ) : (
              <div className="dashboard__list">
                {incoming.map((claim) => (
                  <RequestCard
                    key={claim.request_id}
                    claim={claim}
                    direction="incoming"
                    isBusy={busyId === claim.request_id}
                    busyAction={busyId === claim.request_id ? busyAction : null}
                    onApprove={() => runAction(claim, "approve", approveClaim)}
                    onDecline={() => runAction(claim, "decline", declineClaim)}
                    onPickup={() => runAction(claim, "pickup", pickupClaim)}
                    onComplete={() => runAction(claim, "complete", completeClaim)}
                    onCancel={() => runAction(claim, "cancel", cancelClaim)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Outgoing Requests</h2>
            {outgoing.length === 0 ? (
              <EmptyState
                icon={<span>📤</span>}
                title="No outgoing requests"
                description="Claims you make on other people's listings will show up here."
                action={
                  <Link to="/browse">
                    <Button variant="primary">Browse Listings</Button>
                  </Link>
                }
              />
            ) : (
              <div className="dashboard__list">
                {outgoing.map((claim) => (
                  <RequestCard
                    key={claim.request_id}
                    claim={claim}
                    direction="outgoing"
                    isBusy={busyId === claim.request_id}
                    busyAction={busyId === claim.request_id ? busyAction : null}
                    onApprove={() => runAction(claim, "approve", approveClaim)}
                    onDecline={() => runAction(claim, "decline", declineClaim)}
                    onPickup={() => runAction(claim, "pickup", pickupClaim)}
                    onComplete={() => runAction(claim, "complete", completeClaim)}
                    onCancel={() => runAction(claim, "cancel", cancelClaim)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

interface RequestCardProps {
  claim: ClaimHistoryResponse;
  direction: "incoming" | "outgoing";
  isBusy: boolean;
  busyAction: string | null;
  onApprove: () => void;
  onDecline: () => void;
  onPickup: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

function RequestCard({
  claim,
  direction,
  isBusy,
  busyAction,
  onApprove,
  onDecline,
  onPickup,
  onComplete,
  onCancel,
}: RequestCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="dashboard__card">
          <img
            src={claim.listing_photo_url || NO_PHOTO_URL}
            alt={claim.listing_name}
            className="dashboard__thumb"
          />
          <div className="dashboard__details">
            <div className="dashboard__details-header">
              <h3>{claim.listing_name}</h3>
              <StatusBadge status={statusBadgeStatus(claim.status)} label={statusLabel(claim.status)} />
            </div>
            <p className="dashboard__meta">
              {claim.quantity_requested}{" "}
              {direction === "incoming" ? "requested by" : "requested from"}{" "}
              {claim.other_user_name ?? "another user"}
            </p>
            {claim.request_date && (
              <p className="dashboard__date">
                Requested {new Date(claim.request_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className="dashboard__actions">
          {claim.status === "requested" && direction === "incoming" && (
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
          {(claim.status === "requested" || claim.status === "approved") && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              loading={busyAction === "cancel"}
              disabled={isBusy}
            >
              Cancel
            </Button>
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
