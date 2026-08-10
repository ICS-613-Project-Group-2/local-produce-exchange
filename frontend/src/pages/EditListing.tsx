import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import Modal, { ModalFooter } from "../components/ui/Modal";
import { getListingById, mockCommunities, mockClaimRequests, getUserById } from "../data/mockData";
import "./EditListing.css";

const CATEGORIES = [
  { value: "Fruits", icon: "🍎" },
  { value: "Vegetables", icon: "🥬" },
  { value: "Herbs", icon: "🌿" },
  { value: "Baked Goods", icon: "🍞" },
  { value: "Pantry Items", icon: "🥫" },
  { value: "Dairy", icon: "🥛" },
  { value: "Other", icon: "📦" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "closed", label: "Closed" },
];

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const listing = getListingById(Number(id));

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);

  if (!listing) {
    return (
      <div className="page-container">
        <div className="edit-listing__error">
          <h1>Listing Not Found</h1>
          <p>This listing may have been removed or does not exist.</p>
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: listing.name,
    category: listing.category,
    quantity: String(listing.quantity),
    unit: listing.unit,
    description: listing.description,
    expiration_date: listing.expiration_date,
    pickup_location: listing.pickup_location,
    status: listing.status,
    community_id: String(listing.community_id),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userCommunities = mockCommunities.filter((c) => !c.is_private || c.community_id <= 3);
  const isClosed = formData.status === "closed";

  // Claims for this listing
  const listingClaims = mockClaimRequests.filter((cr) => cr.listing_id === listing.listing_id);
  const pendingClaims = listingClaims.filter((cr) => cr.status === "pending");
  const approvedClaims = listingClaims.filter((cr) => cr.status === "approved");

  // Activity log (mock)
  const activityLog = [
    { action: "Created", date: listing.date_posted },
    ...(listing.status !== "available" ? [{ action: `Status changed to ${listing.status}`, date: "2026-07-01T12:00:00" }] : []),
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setSaved(false);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, status: e.target.value as typeof prev.status }));
    setSaved(false);
    setStatusChanged(true);
    setTimeout(() => setStatusChanged(false), 3000);
  }

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Produce name is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.quantity || Number(formData.quantity) < 0) newErrors.quantity = "Quantity must be zero or greater.";
    if (Number(formData.quantity) === 0 && formData.status === "available") {
      newErrors.quantity = "Quantity is zero — mark the listing as closed or reserved.";
    }
    if (!formData.unit.trim()) newErrors.unit = "Unit is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.expiration_date) newErrors.expiration_date = "Expiration date is required.";
    if (!formData.pickup_location.trim()) newErrors.pickup_location = "Pickup location is required.";
    return newErrors;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaved(true);
  }

  function handleDelete() {
    setDeleteModalOpen(false);
    setDeleted(true);
  }

  if (deleted) {
    return (
      <div className="page-container">
        <div className="edit-listing__deleted">
          <h1>Listing Deleted</h1>
          <p>"{listing.name}" has been permanently removed.</p>
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
        subtitle={`Managing: ${listing.name}`}
        action={
          <Link to={`/listings/${listing.listing_id}`}>
            <Button variant="outline" size="sm">View as Public</Button>
          </Link>
        }
      />

      {/* Status Controls */}
      <div className="edit-listing__status-bar">
        <div className="edit-listing__status-current">
          <span>Current Status:</span>
          <StatusBadge status={formData.status as any} />
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
        </div>
      </div>

      {statusChanged && (
        <div className="edit-listing__status-toast">
          Status updated to "{formData.status}". Save to confirm changes.
        </div>
      )}

      {isClosed && (
        <div className="edit-listing__closed-notice">
          This listing is closed and no longer visible to other users. You can reopen it by changing the status back to Available.
        </div>
      )}

      {saved && (
        <div className="edit-listing__save-success">
          ✅ Listing updated successfully. <span className="edit-listing__timestamp">Last saved just now</span>
        </div>
      )}

      {/* Claim Requests Summary */}
      {listingClaims.length > 0 && (
        <div className="edit-listing__claims-summary">
          <h3>Claim Requests</h3>
          <div className="edit-listing__claims-stats">
            <span className="edit-listing__claims-stat">{pendingClaims.length} pending</span>
            <span className="edit-listing__claims-stat">{approvedClaims.length} approved</span>
            <span className="edit-listing__claims-stat">{listingClaims.length} total</span>
          </div>
          <div className="edit-listing__claims-list">
            {listingClaims.map((claim) => {
              const claimant = getUserById(claim.requester_user_id);
              return (
                <div key={claim.request_id} className="edit-listing__claim-row">
                  {claimant?.profile_photo_url ? (
                    <img src={claimant.profile_photo_url} alt={claimant.name} className="edit-listing__claim-avatar" />
                  ) : (
                    <div className="edit-listing__claim-avatar edit-listing__claim-avatar--placeholder">{claimant?.name[0]}</div>
                  )}
                  <span className="edit-listing__claim-name">{claimant?.name}</span>
                  <span className="edit-listing__claim-qty">{claim.quantity_requested} {listing.unit}</span>
                  <StatusBadge status={claim.status} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Form */}
      <Card>
        <CardBody>
          <form onSubmit={handleSave} className="edit-listing__form">
            <section className="edit-listing__section">
              <h2>Item Details</h2>
              <FormField label="Produce Name" htmlFor="name" required error={errors.name}>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} hasError={!!errors.name} />
              </FormField>

              <FormField label="Category" htmlFor="category" required error={errors.category}>
                <select id="category" name="category" className={`form-field__input ${errors.category ? "form-field__input--error" : ""}`} value={formData.category} onChange={handleChange}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.value}</option>
                  ))}
                </select>
              </FormField>

              <div className="edit-listing__row">
                <FormField label="Quantity" htmlFor="quantity" required error={errors.quantity}>
                  <Input id="quantity" name="quantity" type="number" min="0" step="1" value={formData.quantity} onChange={handleChange} hasError={!!errors.quantity} />
                </FormField>
                <FormField label="Unit" htmlFor="unit" required error={errors.unit}>
                  <Input id="unit" name="unit" value={formData.unit} onChange={handleChange} hasError={!!errors.unit} />
                </FormField>
              </div>

              <FormField label="Description" htmlFor="description" required error={errors.description}>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} hasError={!!errors.description} />
              </FormField>
            </section>

            <section className="edit-listing__section">
              <h2>Freshness & Pickup</h2>
              <FormField label="Expiration Date" htmlFor="expiration_date" required error={errors.expiration_date}>
                <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} hasError={!!errors.expiration_date} />
              </FormField>
              <FormField label="Pickup Location" htmlFor="pickup_location" required error={errors.pickup_location}>
                <Input id="pickup_location" name="pickup_location" value={formData.pickup_location} onChange={handleChange} hasError={!!errors.pickup_location} />
              </FormField>
            </section>

            <section className="edit-listing__section">
              <h2>Community</h2>
              <FormField label="Posted in" htmlFor="community_id">
                <select id="community_id" name="community_id" className="form-field__input" value={formData.community_id} onChange={handleChange}>
                  {userCommunities.map((c) => (
                    <option key={c.community_id} value={c.community_id}>{c.name} {c.is_private ? "(Private)" : "(Public)"}</option>
                  ))}
                </select>
              </FormField>
            </section>

            <div className="edit-listing__actions">
              <Button variant="primary" type="submit" size="lg">Save Changes</Button>
              <Link to={`/listings/${listing.listing_id}`}><Button variant="outline" size="lg">Cancel</Button></Link>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Activity Log */}
      <div className="edit-listing__activity">
        <h3>Activity</h3>
        <div className="edit-listing__activity-list">
          {activityLog.map((entry, i) => (
            <div key={i} className="edit-listing__activity-item">
              <span className="edit-listing__activity-dot" />
              <span>{entry.action}</span>
              <span className="edit-listing__activity-date">{new Date(entry.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="edit-listing__danger-zone">
        <h3>Danger Zone</h3>
        <p>Permanently delete this listing and all associated data. This cannot be undone.</p>
        <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
          Delete Listing
        </Button>
      </div>

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
      >
        <p>This will permanently remove "{listing.name}" and all associated claim requests and messages.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Listing</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
