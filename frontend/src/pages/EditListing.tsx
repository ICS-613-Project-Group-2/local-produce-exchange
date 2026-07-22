import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge, { type BadgeStatus } from "../components/ui/StatusBadge";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import Modal, { ModalFooter } from "../components/ui/Modal";
import {
  getListing,
  updateListing,
  deleteListing,
  getCommunity,
  ApiError,
} from "../lib/api";
import "./EditListing.css";

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Herbs",
  "Baked Goods",
  "Pantry Items",
  "Dairy",
  "Other",
];

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "closed", label: "Closed" },
];

interface FormData {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  description: string;
  expiration_date: string;
  pickup_location: string;
  status: string;
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);

  const [formData, setFormData] = useState<FormData | null>(null);
  const [communityName, setCommunityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getListing(listingId)
      .then((listing) => {
        setFormData({
          name: listing.name,
          category: listing.category || "",
          quantity: String(listing.quantity),
          unit: listing.unit || "",
          description: listing.description || "",
          expiration_date: listing.expiration_date || "",
          pickup_location: listing.pickup_location || "",
          status: listing.status || "available",
        });
        if (listing.community_id !== null) {
          getCommunity(listing.community_id)
            .then((community) => setCommunityName(community.name))
            .catch(() => setCommunityName(null));
        }
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load this listing.");
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <div className="page-container">
        <p className="edit-listing__status-message">Loading listing...</p>
      </div>
    );
  }

  if (loadError || !formData) {
    return (
      <div className="page-container">
        <div className="edit-listing__error">
          <h1>Listing Not Found</h1>
          <p>{loadError || "This listing may have been removed or does not exist."}</p>
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = formData.status === "closed";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setSaved(false);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    setFormData((prev) => (prev ? { ...prev, status } : prev));
    setSaved(false);
  }

  function validate(data: FormData): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = "Produce name is required.";
    if (!data.category) newErrors.category = "Category is required.";
    if (!data.quantity || Number(data.quantity) < 0) newErrors.quantity = "Quantity must be zero or greater.";
    if (Number(data.quantity) === 0 && data.status === "available") {
      newErrors.quantity = "Quantity is zero — mark the listing as closed or reserved.";
    }
    if (!data.unit.trim()) newErrors.unit = "Unit is required.";
    if (!data.description.trim()) newErrors.description = "Description is required.";
    if (!data.expiration_date) newErrors.expiration_date = "Expiration date is required.";
    if (!data.pickup_location.trim()) newErrors.pickup_location = "Pickup location is required.";
    return newErrors;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData) return;

    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaveError(null);
    setSaving(true);

    try {
      await updateListing(listingId, {
        name: formData.name,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        status: formData.status,
        category: formData.category,
        expiration_date: formData.expiration_date,
        pickup_location: formData.pickup_location,
      });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setSaveError("You do not have permission to edit this listing.");
      } else if (err instanceof ApiError) {
        setSaveError(err.message);
      } else {
        setSaveError("Something went wrong while saving your changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteModalOpen(false);
    try {
      await deleteListing(listingId);
      setDeleted(true);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Something went wrong while deleting this listing."
      );
    }
  }

  if (deleted) {
    return (
      <div className="page-container">
        <div className="edit-listing__deleted">
          <h1>Listing Deleted</h1>
          <p>"{formData.name}" has been permanently removed.</p>
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Edit Listing"
        subtitle={`Managing: ${formData.name}`}
      />

      {/* Status Controls */}
      <div className="edit-listing__status-bar">
        <div className="edit-listing__status-current">
          <span>Current Status:</span>
          <StatusBadge status={formData.status as BadgeStatus} />
        </div>
        <div className="edit-listing__status-actions">
          <select
            className="form-field__input edit-listing__status-select"
            value={formData.status}
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
            Delete Listing
          </Button>
        </div>
      </div>

      {isClosed && (
        <div className="edit-listing__closed-notice">
          This listing is closed and no longer visible to other users. You can reopen it by changing the status back to Available.
        </div>
      )}

      {saveError && (
        <p className="edit-listing__submit-error" role="alert">
          {saveError}
        </p>
      )}

      {saved && (
        <div className="edit-listing__save-success">
          ✅ Listing updated successfully.
        </div>
      )}

      <Card>
        <CardBody>
          <form onSubmit={handleSave} className="edit-listing__form">
            {/* Item Details */}
            <section className="edit-listing__section">
              <h2>Item Details</h2>
              <FormField label="Produce Name" htmlFor="name" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
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

              <div className="edit-listing__row">
                <FormField label="Quantity" htmlFor="quantity" required error={errors.quantity}>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    hasError={!!errors.quantity}
                  />
                </FormField>
                <FormField label="Unit" htmlFor="unit" required error={errors.unit}>
                  <Input
                    id="unit"
                    name="unit"
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
                  value={formData.description}
                  onChange={handleChange}
                  hasError={!!errors.description}
                />
              </FormField>
            </section>

            {/* Freshness & Pickup */}
            <section className="edit-listing__section">
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
                  value={formData.pickup_location}
                  onChange={handleChange}
                  hasError={!!errors.pickup_location}
                />
              </FormField>
            </section>

            {/* Community (read-only; listings cannot be moved between communities) */}
            {communityName && (
              <section className="edit-listing__section">
                <h2>Community</h2>
                <p className="edit-listing__community-name">🏘️ {communityName}</p>
              </section>
            )}

            {/* Actions */}
            <div className="edit-listing__actions">
              <Button variant="primary" type="submit" size="lg" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Link to={`/listings/${listingId}`}>
                <Button variant="outline" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
      >
        <p>This will permanently remove "{formData.name}" and all associated claim requests and messages.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Listing</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
