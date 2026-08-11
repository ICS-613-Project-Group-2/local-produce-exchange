import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError, acceptInvitation, declineInvitation, getInvitationPreview, type InvitationPreview } from "../lib/api";
import "./AuthPages.css";

type Outcome = "accepted" | "declined" | null;

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  useEffect(() => {
    if (!token) return;
    getInvitationPreview(token)
      .then(setPreview)
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "This invitation could not be found.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await acceptInvitation(token);
      setOutcome("accepted");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDecline() {
    if (!token) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await declineInvitation(token);
      setOutcome("declined");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderBody() {
    if (loading || authLoading) {
      return <p>Loading invitation...</p>;
    }

    if (loadError || !preview) {
      return (
        <div className="auth-page__success">
          <h1>Invitation not found</h1>
          <p>{loadError || "This invite link is invalid."}</p>
          <Link to="/communities">
            <Button variant="outline">Browse Communities</Button>
          </Link>
        </div>
      );
    }

    if (outcome === "accepted") {
      return (
        <div className="auth-page__success">
          <h1>You're in! 🌱</h1>
          <p>You've joined {preview.community_name}.</p>
          <Link to={`/communities/${preview.community_id}`}>
            <Button variant="primary">Go to Community</Button>
          </Link>
        </div>
      );
    }

    if (outcome === "declined") {
      return (
        <div className="auth-page__success">
          <h1>Invitation declined</h1>
          <p>You've declined the invitation to join {preview.community_name}.</p>
          <Link to="/communities">
            <Button variant="outline">Browse Communities</Button>
          </Link>
        </div>
      );
    }

    const isExpired = preview.is_expired;
    const isResolved = preview.status !== "pending";

    return (
      <>
        <div className="auth-page__header">
          <h1>You're invited to {preview.community_name}</h1>
          <p>{preview.community_description}</p>
          {preview.inviter_name && (
            <p>Invited by {preview.inviter_name} to {preview.email}.</p>
          )}
        </div>

        {isExpired && preview.status === "pending" && (
          <p className="auth-page__submit-error" role="alert">
            This invitation has expired. Ask an admin of {preview.community_name} to send you a new one.
          </p>
        )}

        {!isExpired && isResolved && (
          <p className="auth-page__submit-error" role="alert">
            This invitation has already been {preview.status}.
          </p>
        )}

        {!authLoading && !isLoggedIn && !isExpired && !isResolved && (
          <p>
            Log in or sign up with <strong>{preview.email}</strong> to accept this invitation.
            <br />
            <Link to="/login">Log in</Link> · <Link to="/signup">Sign up</Link>
          </p>
        )}

        {isLoggedIn && !isExpired && !isResolved && user && user.email.toLowerCase() !== preview.email.toLowerCase() && (
          <p className="auth-page__submit-error" role="alert">
            You're logged in as {user.email}, but this invitation was sent to {preview.email}. Log in with that address to accept it.
          </p>
        )}

        {isLoggedIn && !isExpired && !isResolved && user && user.email.toLowerCase() === preview.email.toLowerCase() && (
          <>
            {actionError && (
              <p className="auth-page__submit-error" role="alert">
                {actionError}
              </p>
            )}
            <div className="auth-page__form">
              <Button variant="primary" size="lg" onClick={handleAccept} disabled={submitting}>
                {submitting ? "Joining..." : "Accept Invitation"}
              </Button>
              <Button variant="outline" size="lg" onClick={handleDecline} disabled={submitting}>
                Decline
              </Button>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page__layout">
        <div className="auth-page__form-side">
          <div className="auth-page__card">
            <div className="auth-page__brand">
              <span className="auth-page__brand-icon">🌱</span>
              <span className="auth-page__brand-name">Green Beans</span>
            </div>
            {renderBody()}
          </div>
        </div>
        <div className="auth-page__image-side">
          <div className="auth-page__image-content">
            <h2>Join your neighbors</h2>
            <p>Private communities keep local food-sharing trusted and close to home.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
