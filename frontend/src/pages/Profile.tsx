import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import { getUserReviews, ApiError, type ReviewResponse } from "../lib/api";
import "./Profile.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-container">
        <p className="profile__status-message">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader title="Profile" />

      <div className="profile__tabs">
        <button
          className={`profile__tab ${activeTab === "profile" ? "profile__tab--active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Public Profile
        </button>
        <button
          className={`profile__tab ${activeTab === "settings" ? "profile__tab--active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {activeTab === "profile" ? <PublicProfile userId={user.user_id} name={user.name} email={user.email} photoUrl={user.profile_photo_url} /> : <ProfileSettings name={user.name} email={user.email} photoUrl={user.profile_photo_url} />}
    </div>
  );
}

interface PublicProfileProps {
  userId: number;
  name: string;
  email: string;
  photoUrl: string | null;
}

function PublicProfile({ userId, name, email, photoUrl }: PublicProfileProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getUserReviews(userId)
      .then((result) => {
        setReviews(result.reviews);
        setAverageRating(result.average_rating);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Reviews could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="profile__content">
      {/* Profile Card */}
      <Card variant="warm">
        <CardBody>
          <div className="profile__header">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="profile__avatar" />
            ) : (
              <div className="profile__avatar profile__avatar--placeholder">{name[0]}</div>
            )}
            <div className="profile__info">
              <h2>{name}</h2>
              {averageRating !== null && (
                <p className="profile__rating">
                  ⭐ {averageRating} rating ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </p>
              )}
              <p className="profile__email">{email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reviews */}
      <section className="profile__section">
        <h2>Reviews</h2>
        {loading ? (
          <p className="profile__status-message">Loading reviews...</p>
        ) : loadError ? (
          <p className="profile__status-message">{loadError}</p>
        ) : reviews.length > 0 ? (
          <div className="profile__reviews">
            {reviews.map((review) => (
              <Card key={review.review_id}>
                <CardBody>
                  <div className="profile__review">
                    <div className="profile__review-header">
                      <span className="profile__review-name">{review.reviewer_name ?? "A community member"}</span>
                      <span className="profile__review-rating">{"⭐".repeat(review.rating)}</span>
                    </div>
                    {review.comment && <p className="profile__review-comment">{review.comment}</p>}
                    {review.review_date && (
                      <p className="profile__review-date">{new Date(review.review_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews yet"
            description="Reviews will appear here after you complete exchanges."
          />
        )}
      </section>

      {/* Quick Links */}
      <section className="profile__section">
        <h2>Activity</h2>
        <div className="profile__links">
          <Link to="/history">
            <Button variant="outline">View Listing History</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

interface ProfileSettingsProps {
  name: string;
  email: string;
  photoUrl: string | null;
}

function ProfileSettings({ name, email, photoUrl }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name,
    email,
    location: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setSaved(false);
  }

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Display name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaved(true);
  }

  return (
    <div className="profile__content">
      {saved && (
        <div className="profile__save-success">
          ✅ Profile updated successfully.
        </div>
      )}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="profile__form">
            {/* Profile Photo */}
            <section className="profile__form-section">
              <h2>Profile Photo</h2>
              <div className="profile__photo-upload">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="profile__avatar" />
                ) : (
                  <div className="profile__avatar profile__avatar--placeholder">{name[0]}</div>
                )}
                <input type="file" accept="image/*" className="profile__file-input" />
              </div>
            </section>

            {/* Info */}
            <section className="profile__form-section">
              <h2>Account Information</h2>
              <FormField label="Display Name" htmlFor="name" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  hasError={!!errors.name}
                />
              </FormField>

              <FormField label="Email" htmlFor="email" required error={errors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  hasError={!!errors.email}
                />
              </FormField>

              <FormField label="Location" htmlFor="location" helperText="General area shown to other users.">
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Elm Street area"
                  value={formData.location}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Bio" htmlFor="bio" helperText="Optional short description about yourself.">
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell the community a bit about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </FormField>
            </section>

            <div className="profile__form-actions">
              <Button variant="primary" type="submit" size="lg">
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
