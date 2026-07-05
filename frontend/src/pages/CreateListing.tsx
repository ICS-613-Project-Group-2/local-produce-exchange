import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
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
  "Fruits",
  "Vegetables",
  "Herbs",
  "Baked Goods",
  "Pantry Items",
  "Dairy",
  "Other",
];

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

  const userCommunities = mockCommunities.filter((c) => !c.is_private || c.community_id <= 3);

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

  return (
    <div className="page-container">
      <PageHeader
        title="Create a Listing"
        subtitle="Share extra produce with your local community"
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="create-listing__form">
            {/* Basic Details */}
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
                <select
                  id="category"
                  name="category"
                  className={`form-field__input ${errors.category ? "form-field__input--error" : ""}`}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
              </FormField>
            </section>

            {/* Freshness & Pickup */}
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

              <FormField label="Pickup Location" htmlFor="pickup_location" required error={errors.pickup_location}>
                <Input
                  id="pickup_location"
                  name="pickup_location"
                  placeholder="e.g., 123 Elm Street, front porch"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  hasError={!!errors.pickup_location}
                />
              </FormField>
            </section>

            {/* Photo */}
            <section className="create-listing__section">
              <h2>Photo</h2>
              <FormField label="Upload Image" htmlFor="photo" required error={errors.photo}>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="create-listing__file-input"
                  onChange={handlePhotoChange}
                />
              </FormField>
              {photoPreview && (
                <div className="create-listing__photo-preview">
                  <img src={photoPreview} alt="Preview" />
                </div>
              )}
            </section>

            {/* Community */}
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

            {/* Actions */}
            <div className="create-listing__actions">
              <Button variant="primary" type="submit" size="lg">
                Publish Listing
              </Button>
              <Link to="/browse">
                <Button variant="outline" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
