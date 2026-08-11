import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import { createCommunity } from "../lib/api";
import "./CreateCommunity.css";

interface FormData {
  name: string;
  description: string;
  location: string;
  is_private: string;
  guidelines: string;
}

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    is_private: "true",
    guidelines: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createCommunity({
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        guidelines: formData.guidelines.trim() || "Be respectful and share freely.",
        is_private: formData.is_private === "true",
      });
      setSubmitted(true);
      setTimeout(() => navigate(`/communities/${created.community_id}`), 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create community");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="page-container">
        <div className="create-community__success">
          <h1>Community Created! 🏘️</h1>
          <p>"{formData.name}" is ready. You are the admin and can now invite members, post listings, and manage the community.</p>
          <div className="create-community__success-actions">
            <Link to="/communities"><Button variant="primary">View Communities</Button></Link>
            <Link to="/dashboard"><Button variant="outline">Go to Dashboard</Button></Link>
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

      {submitError && <p className="create-community__error">{submitError}</p>}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="create-community__form">
            <section className="create-community__section">
              <h2>Community Details</h2>
              <FormField label="Community Name" htmlFor="name" required error={errors.name}>
                <Input id="name" name="name" placeholder="e.g., Neighborhood Garden Share" value={formData.name} onChange={handleChange} hasError={!!errors.name} />
              </FormField>
              <FormField label="Description" htmlFor="description" required error={errors.description} helperText="Explain what this community is for and who should join.">
                <Textarea id="description" name="description" placeholder="e.g., A community for sharing backyard garden produce with neighbors..." value={formData.description} onChange={handleChange} hasError={!!errors.description} />
              </FormField>
              <FormField label="Location / Area" htmlFor="location" required error={errors.location} helperText="General area this community serves.">
                <Input id="location" name="location" placeholder="e.g., Elm Street area, Downtown, Campus" value={formData.location} onChange={handleChange} hasError={!!errors.location} />
              </FormField>
            </section>

            <section className="create-community__section">
              <h2>Privacy Setting</h2>
              <div className="create-community__privacy-options">
                <label className={`create-community__privacy-option ${formData.is_private === "true" ? "create-community__privacy-option--selected" : ""}`}>
                  <input type="radio" name="is_private" value="true" checked={formData.is_private === "true"} onChange={handleChange} />
                  <div><strong>Private</strong><p>Users must request access or receive an invite to join.</p></div>
                </label>
                <label className={`create-community__privacy-option ${formData.is_private === "false" ? "create-community__privacy-option--selected" : ""}`}>
                  <input type="radio" name="is_private" value="false" checked={formData.is_private === "false"} onChange={handleChange} />
                  <div><strong>Public</strong><p>Any logged-in user can join freely and browse listings.</p></div>
                </label>
              </div>
            </section>

            <section className="create-community__section">
              <h2>Community Guidelines (Optional)</h2>
              <FormField label="Guidelines" htmlFor="guidelines" helperText="Set expectations for members. You can update these later.">
                <Textarea id="guidelines" name="guidelines" placeholder="e.g., Be respectful, only post items you intend to share..." value={formData.guidelines} onChange={handleChange} />
              </FormField>
            </section>

            <div className="create-community__actions">
              <Button variant="primary" type="submit" size="lg" disabled={submitting}>
                {submitting ? "Creating..." : "Create Community"}
              </Button>
              <Link to="/communities"><Button variant="outline" size="lg">Cancel</Button></Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
