import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  browseListings,
  listCommunities,
  type ListingResponse,
  type CommunityResponse,
} from "../lib/api";
import "./Profile.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  return (
    <div className="page-container">
      <PageHeader title="Profile" />

      <div className="profile__tabs">
        <button className={`profile__tab ${activeTab === "profile" ? "profile__tab--active" : ""}`} onClick={() => setActiveTab("profile")}>
          Public Profile
        </button>
        <button className={`profile__tab ${activeTab === "settings" ? "profile__tab--active" : ""}`} onClick={() => setActiveTab("settings")}>
          Settings
        </button>
      </div>

      {activeTab === "profile" ? <PublicProfile /> : <ProfileSettings />}
    </div>
  );
}

function PublicProfile() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<ListingResponse[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const [listings, commData] = await Promise.all([
        browseListings().catch(() => []),
        listCommunities().catch(() => ({ my_communities: [], public_communities: [] })),
      ]);
      setMyListings(listings.filter((l) => l.user_id === user?.user_id));
      setMyCommunities(commData.my_communities);
    } catch {
      // fail gracefully
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  const completedCount = myListings.filter((l) => l.status === "completed").length;

  return (
    <div className="profile__content">
      <Card variant="warm">
        <CardBody>
          <div className="profile__header">
            <div className="profile__avatar-wrapper">
              {user?.profile_photo_url ? (
                <img src={user.profile_photo_url} alt={user.name} className="profile__avatar" />
              ) : (
                <div className="profile__avatar profile__avatar--placeholder">{user?.name?.[0] || "?"}</div>
              )}
            </div>
            <div className="profile__info">
              <h2>{user?.name}</h2>
              {user?.location && <p className="profile__location">📍 {user.location}</p>}
              {user?.rating && <p className="profile__rating">⭐ {user.rating} rating</p>}
              <p className="profile__email">{user?.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-number">{myListings.length}</span>
          <span className="profile__stat-label">Listings</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-number">{completedCount}</span>
          <span className="profile__stat-label">Completed</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-number">{myCommunities.length}</span>
          <span className="profile__stat-label">Communities</span>
        </div>
      </div>

      {myCommunities.length > 0 && (
        <section className="profile__section">
          <h2>Communities</h2>
          <div className="profile__communities-list">
            {myCommunities.map((c) => (
              <Link key={c.community_id} to={`/communities/${c.community_id}`} className="profile__community-chip">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="profile__section">
        <h2>Reviews</h2>
        <EmptyState title="No reviews yet" description="Reviews will appear here after you complete exchanges." />
      </section>

      <section className="profile__section">
        <div className="profile__links">
          <Link to="/history"><Button variant="outline">View Listing History</Button></Link>
          <Link to="/dashboard"><Button variant="outline">Go to Dashboard</Button></Link>
        </div>
      </section>
    </div>
  );
}

function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
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
    // TODO: Call updateProfile API once endpoint exists
  }

  return (
    <div className="profile__content">
      {saved && <div className="profile__save-success">✅ Profile updated successfully.</div>}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="profile__form">
            <section className="profile__form-section">
              <h2>Profile Photo</h2>
              <div className="profile__photo-upload">
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={user.name} className="profile__avatar" />
                ) : (
                  <div className="profile__avatar profile__avatar--placeholder">{user?.name?.[0] || "?"}</div>
                )}
                <div className="profile__photo-actions">
                  <Button variant="outline" size="sm">Upload New Photo</Button>
                  <p className="profile__photo-hint">JPG, PNG, or WebP. Max 5MB.</p>
                </div>
              </div>
            </section>

            <section className="profile__form-section">
              <h2>Account Information</h2>
              <FormField label="Display Name" htmlFor="name" required error={errors.name}>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} hasError={!!errors.name} />
              </FormField>
              <FormField label="Email" htmlFor="email" required error={errors.email}>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} hasError={!!errors.email} disabled />
              </FormField>
              <FormField label="Location" htmlFor="location" helperText="General area shown to other users.">
                <Input id="location" name="location" placeholder="e.g., Mānoa Valley" value={formData.location} onChange={handleChange} />
              </FormField>
              <FormField label="Bio" htmlFor="bio" helperText="Optional short description about yourself.">
                <Textarea id="bio" name="bio" placeholder="Tell the community a bit about yourself..." value={formData.bio} onChange={handleChange} />
              </FormField>
            </section>

            <div className="profile__form-actions">
              <Button variant="primary" type="submit" size="lg">Save Changes</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
