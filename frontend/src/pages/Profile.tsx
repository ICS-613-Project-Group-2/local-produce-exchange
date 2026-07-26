import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import EmptyState from "../components/feedback/EmptyState";
import { mockUsers } from "../data/mockData";
import "./Profile.css";

// Simulate logged-in user as Lily Chen (user_id 1)
const currentUser = mockUsers[0];

const mockReviews = [
  { id: 1, reviewer: "Oliver Lee", rating: 5, comment: "Tomatoes were super fresh! Easy pickup.", date: "2026-06-25" },
  { id: 2, reviewer: "Glen Kim", rating: 5, comment: "Always reliable and generous. Thank you!", date: "2026-06-22" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

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

      {activeTab === "profile" ? <PublicProfile /> : <ProfileSettings />}
    </div>
  );
}

function PublicProfile() {
  return (
    <div className="profile__content">
      {/* Profile Card */}
      <Card variant="warm">
        <CardBody>
          <div className="profile__header">
            {currentUser.profile_photo_url ? (
              <img
                src={currentUser.profile_photo_url}
                alt={currentUser.name}
                className="profile__avatar"
              />
            ) : (
              <div className="profile__avatar profile__avatar--placeholder">
                {currentUser.name[0]}
              </div>
            )}
            <div className="profile__info">
              <h2>{currentUser.name}</h2>
              {currentUser.location && <p className="profile__location">📍 {currentUser.location}</p>}
              {currentUser.rating && <p className="profile__rating">⭐ {currentUser.rating} rating</p>}
              <p className="profile__email">{currentUser.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reviews */}
      <section className="profile__section">
        <h2>Reviews</h2>
        {mockReviews.length > 0 ? (
          <div className="profile__reviews">
            {mockReviews.map((review) => (
              <Card key={review.id}>
                <CardBody>
                  <div className="profile__review">
                    <div className="profile__review-header">
                      <span className="profile__review-name">{review.reviewer}</span>
                      <span className="profile__review-rating">
                        {"⭐".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="profile__review-comment">{review.comment}</p>
                    <p className="profile__review-date">{new Date(review.date).toLocaleDateString()}</p>
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

function ProfileSettings() {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    location: currentUser.location || "",
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
                {currentUser.profile_photo_url ? (
                  <img
                    src={currentUser.profile_photo_url}
                    alt={currentUser.name}
                    className="profile__avatar"
                  />
                ) : (
                  <div className="profile__avatar profile__avatar--placeholder">
                    {currentUser.name[0]}
                  </div>
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
