import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import "./CreateCommunity.css";

interface FormData {
  name: string;
  description: string;
  location: string;
  is_private: string;
  guidelines: string;
  invite_email: string;
}

export default function CreateCommunity() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    is_private: "false",
    guidelines: "",
    invite_email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Community name is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.location.trim()) newErrors.location = "Location or area is required.";
    if (formData.invite_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.invite_email)) {
      newErrors.invite_email = "Please enter a valid email address.";
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
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page-container">
        <div className="create-community__success">
          <h1>Community Created! 🏘️</h1>
          <p>"{formData.name}" is ready. You are the admin and can now invite members, post listings, and manage the community.</p>
          <div className="create-community__success-actions">
            <Link to="/communities">
              <Button variant="primary">View Communities</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Create a Community"
        subtitle="Start a public or private group for sharing produce and food items with trusted local members"
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="create-community__form">
            {/* Basic Details */}
            <section className="create-community__section">
              <h2>Community Details</h2>
              <FormField label="Community Name" htmlFor="name" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Neighborhood Garden Share"
                  value={formData.name}
                  onChange={handleChange}
                  hasError={!!errors.name}
                />
              </FormField>

              <FormField label="Description" htmlFor="description" required error={errors.description} helperText="Explain what this community is for and who should join.">
                <Textarea
                  id="description"
                  name="description"
                  placeholder="e.g., A community for sharing backyard garden produce with neighbors..."
                  value={formData.description}
                  onChange={handleChange}
                  hasError={!!errors.description}
                />
              </FormField>

              <FormField label="Location / Area" htmlFor="location" required error={errors.location} helperText="General area this community serves.">
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Elm Street area, Downtown, Campus"
                  value={formData.location}
                  onChange={handleChange}
                  hasError={!!errors.location}
                />
              </FormField>
            </section>

            {/* Privacy */}
            <section className="create-community__section">
              <h2>Privacy Setting</h2>
              <div className="create-community__privacy-options">
                <label className={`create-community__privacy-option ${formData.is_private === "false" ? "create-community__privacy-option--selected" : ""}`}>
                  <input
                    type="radio"
                    name="is_private"
                    value="false"
                    checked={formData.is_private === "false"}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>Public</strong>
                    <p>Any logged-in user can join freely and browse listings.</p>
                  </div>
                </label>
                <label className={`create-community__privacy-option ${formData.is_private === "true" ? "create-community__privacy-option--selected" : ""}`}>
                  <input
                    type="radio"
                    name="is_private"
                    value="true"
                    checked={formData.is_private === "true"}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>Private</strong>
                    <p>Users must request access or receive an invite to join.</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Invite (shown for private) */}
            {formData.is_private === "true" && (
              <section className="create-community__section">
                <h2>Invite Members (Optional)</h2>
                <p className="create-community__invite-note">
                  You can also invite members later from Community Settings.
                </p>
                <FormField label="Invite by Email" htmlFor="invite_email" error={errors.invite_email}>
                  <Input
                    id="invite_email"
                    name="invite_email"
                    type="email"
                    placeholder="friend@example.com"
                    value={formData.invite_email}
                    onChange={handleChange}
                    hasError={!!errors.invite_email}
                  />
                </FormField>
              </section>
            )}

            {/* Guidelines */}
            <section className="create-community__section">
              <h2>Community Guidelines (Optional)</h2>
              <FormField label="Guidelines" htmlFor="guidelines" helperText="Set expectations for members. You can update these later.">
                <Textarea
                  id="guidelines"
                  name="guidelines"
                  placeholder="e.g., Be respectful, only post items you intend to share, pick up within 48 hours..."
                  value={formData.guidelines}
                  onChange={handleChange}
                />
              </FormField>
            </section>

            {/* Actions */}
            <div className="create-community__actions">
              <Button variant="primary" type="submit" size="lg">
                Create Community
              </Button>
              <Link to="/communities">
                <Button variant="outline" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
