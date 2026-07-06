import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import { mockCommunities } from "../data/mockData";
import "./CreateListing.css";

interface FormData {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  description: string;
  expiration_date: string;
  pickup_location: string;
  community_id: string;
  photo: File | null;
}

interface FormErrors {
  [key: string]: string;
}

const CATEGORIES = [
  { value: "Fruits", icon: "🍎" },
  { value: "Vegetables", icon: "🥬" },
  { value: "Herbs", icon: "🌿" },
  { value: "Baked Goods", icon: "🍞" },
  { value: "Pantry Items", icon: "🥫" },
  { value: "Dairy", icon: "🥛" },
  { value: "Other", icon: "📦" },
];

const STEPS = ["Details", "Freshness & Pickup", "Photo", "Community"];

export default function CreateListing() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    description: "",
    expiration_date: "",
    pickup_location: "",
    community_id: "",
    photo: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const userCommunities = mockCommunities.filter((c) => !c.is_private || c.community_id <= 3);
  const descCharCount = formData.description.length;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      if (errors.photo) setErrors((prev) => ({ ...prev, photo: "" }));
    } else {
      setPhotoPreview(null);
    }
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Produce name is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = "Quantity must be greater than zero.";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required (e.g., lbs, pieces, bunches).";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.expiration_date) newErrors.expiration_date = "Expiration date is required.";
    if (!formData.pickup_location.trim()) newErrors.pickup_location = "Pickup location is required.";
    if (!formData.community_id) newErrors.community_id = "Please select a community.";
    if (!formData.photo) newErrors.photo = "Please upload a photo.";
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Jump to first step with error
      if (newErrors.name || newErrors.category || newErrors.quantity || newErrors.unit || newErrors.description) setCurrentStep(0);
      else if (newErrors.expiration_date || newErrors.pickup_location) setCurrentStep(1);
      else if (newErrors.photo) setCurrentStep(2);
      else setCurrentStep(3);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page-container">
        <div className="create-listing__success">
          <h1>Listing Published! 🎉</h1>
          <p>Your listing "{formData.name}" has been posted to your community.</p>
          <div className="create-listing__success-actions">
            <Link to="/browse">
              <Button variant="primary">View Listings</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showPreview) {
    const selectedCommunity = userCommunities.find((c) => String(c.community_id) === formData.community_id);
    return (
      <div className="page-container">
        <PageHeader title="Preview Listing" subtitle="This is how your listing will appear to other users" />
        <Card>
          <CardBody>
            <div className="create-listing__preview">
              {photoPreview && <img src={photoPreview} alt="Preview" className="create-listing__preview-image" />}
              <div className="create-listing__preview-info">
                <div className="create-listing__preview-header">
                  <h2>{formData.name || "Untitled"}</h2>
                  <StatusBadge status="available" />
                </div>
                <p className="create-listing__preview-meta">
                  {formData.quantity} {formData.unit} · {formData.category}
                </p>
                <p className="create-listing__preview-desc">{formData.description || "No description"}</p>
                <p className="create-listing__preview-detail">📍 {formData.pickup_location || "No location"}</p>
                <p className="create-listing__preview-detail">📅 Expires {formData.expiration_date || "Not set"}</p>
                {selectedCommunity && <p className="create-listing__preview-detail">🏘️ {selectedCommunity.name}</p>}
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="create-listing__preview-actions">
          <Button variant="outline" onClick={() => setShowPreview(false)}>Back to Edit</Button>
          <Button variant="primary" onClick={handleSubmit as any}>Publish Listing</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Create a Listing"
        subtitle="Share extra produce with your local community"
      />

      {/* Step Indicator */}
      <div className="create-listing__steps">
        {STEPS.map((step, i) => (
          <button
            key={step}
            className={`create-listing__step ${i === currentStep ? "create-listing__step--active" : ""} ${i < currentStep ? "create-listing__step--done" : ""}`}
            onClick={() => setCurrentStep(i)}
          >
            <span className="create-listing__step-number">{i < currentStep ? "✓" : i + 1}</span>
            <span className="create-listing__step-label">{step}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="create-listing__form">
            {/* Step 1: Details */}
            {currentStep === 0 && (
              <section className="create-listing__section">
                <h2>Item Details</h2>
                <FormField label="Produce Name" htmlFor="name" required error={errors.name}>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Fresh Tomatoes"
                    value={formData.name}
                    onChange={handleChange}
                    hasError={!!errors.name}
                  />
                </FormField>

                <FormField label="Category" htmlFor="category" required error={errors.category}>
                  <div className="create-listing__category-grid">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`create-listing__category-btn ${formData.category === cat.value ? "create-listing__category-btn--active" : ""}`}
                        onClick={() => { setFormData((prev) => ({ ...prev, category: cat.value })); if (errors.category) setErrors((prev) => ({ ...prev, category: "" })); }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.value}</span>
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="create-listing__row">
                  <FormField label="Quantity" htmlFor="quantity" required error={errors.quantity}>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      hasError={!!errors.quantity}
                    />
                  </FormField>
                  <FormField label="Unit" htmlFor="unit" required error={errors.unit}>
                    <Input
                      id="unit"
                      name="unit"
                      placeholder="e.g., lbs, pieces, bunches"
                      value={formData.unit}
                      onChange={handleChange}
                      hasError={!!errors.unit}
                    />
                  </FormField>
                </div>

                <FormField label="Description" htmlFor="description" required error={errors.description}>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the item, freshness, size, and any relevant details..."
                    value={formData.description}
                    onChange={handleChange}
                    hasError={!!errors.description}
                  />
                  <span className="create-listing__char-count">{descCharCount} characters</span>
                </FormField>
              </section>
            )}

            {/* Step 2: Freshness & Pickup */}
            {currentStep === 1 && (
              <section className="create-listing__section">
                <h2>Freshness & Pickup</h2>
                <FormField label="Expiration Date" htmlFor="expiration_date" required error={errors.expiration_date}>
                  <Input
                    id="expiration_date"
                    name="expiration_date"
                    type="date"
                    value={formData.expiration_date}
                    onChange={handleChange}
                    hasError={!!errors.expiration_date}
                  />
                </FormField>

                <FormField label="Pickup Location" htmlFor="pickup_location" required error={errors.pickup_location} helperText="Be specific — address, landmark, or instructions.">
                  <Input
                    id="pickup_location"
                    name="pickup_location"
                    placeholder="e.g., 2845 Oahu Ave, front porch"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    hasError={!!errors.pickup_location}
                  />
                </FormField>
              </section>
            )}

            {/* Step 3: Photo */}
            {currentStep === 2 && (
              <section className="create-listing__section">
                <h2>Photo</h2>
                <div className={`create-listing__upload-area ${errors.photo ? "create-listing__upload-area--error" : ""}`}>
                  {photoPreview ? (
                    <div className="create-listing__photo-preview">
                      <img src={photoPreview} alt="Preview" />
                      <button type="button" className="create-listing__photo-remove" onClick={() => { setPhotoPreview(null); setFormData((prev) => ({ ...prev, photo: null })); }}>✕ Remove</button>
                    </div>
                  ) : (
                    <label className="create-listing__upload-label" htmlFor="photo">
                      <span className="create-listing__upload-icon">📷</span>
                      <span className="create-listing__upload-text">Click or drag to upload a photo</span>
                      <span className="create-listing__upload-hint">JPG, PNG, or WebP</span>
                    </label>
                  )}
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    className="create-listing__file-input"
                    onChange={handlePhotoChange}
                  />
                </div>
                {errors.photo && <p className="create-listing__upload-error">{errors.photo}</p>}
              </section>
            )}

            {/* Step 4: Community */}
            {currentStep === 3 && (
              <section className="create-listing__section">
                <h2>Community</h2>
                <FormField label="Post to Community" htmlFor="community_id" required error={errors.community_id}>
                  <select
                    id="community_id"
                    name="community_id"
                    className={`form-field__input ${errors.community_id ? "form-field__input--error" : ""}`}
                    value={formData.community_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a community</option>
                    {userCommunities.map((c) => (
                      <option key={c.community_id} value={c.community_id}>
                        {c.name} {c.is_private ? "(Private)" : "(Public)"}
                      </option>
                    ))}
                  </select>
                </FormField>
              </section>
            )}

            {/* Navigation */}
            <div className="create-listing__nav">
              {currentStep > 0 && (
                <Button variant="outline" type="button" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
              )}
              <div className="create-listing__nav-right">
                {currentStep < STEPS.length - 1 ? (
                  <Button variant="primary" type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" type="button" onClick={() => setShowPreview(true)}>
                      Preview
                    </Button>
                    <Button variant="primary" type="submit" size="lg">
                      Publish Listing
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Draft indicator */}
      <p className="create-listing__draft-note">💾 Draft auto-saved locally</p>
    </div>
  );
}
