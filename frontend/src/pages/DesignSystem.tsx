import { useState } from "react";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import FormField, { Input, Textarea } from "../components/ui/FormField";
import SearchBar from "../components/ui/SearchBar";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/feedback/EmptyState";
import Modal, { ModalFooter } from "../components/ui/Modal";

export default function DesignSystem() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page-container">
      <PageHeader
        title="Design System"
        subtitle="All reusable components for Green Beans"
      />

      {/* Buttons */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Buttons</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="danger" disabled>Disabled Danger</Button>
        </div>
      </section>

      {/* Status Badges */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Status Badges</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
          <StatusBadge status="available" />
          <StatusBadge status="reserved" />
          <StatusBadge status="expiring-soon" />
          <StatusBadge status="closed" />
          <StatusBadge status="pending" />
          <StatusBadge status="completed" />
          <StatusBadge status="canceled" />
          <StatusBadge status="error" />
          <StatusBadge status="public" />
          <StatusBadge status="private" />
        </div>
      </section>

      {/* Cards */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Cards</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginTop: "16px" }}>
          <Card>
            <CardImage
              src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop"
              alt="Fresh tomatoes"
            />
            <CardBody>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Fresh Tomatoes</h3>
                <StatusBadge status="available" />
              </div>
              <p style={{ color: "var(--color-text-muted)", marginTop: "8px" }}>
                8 lbs available · Expires in 3 days
              </p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                📍 Downtown Community Garden
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="primary" size="sm">View Details</Button>
              <Button variant="outline" size="sm">Message Owner</Button>
            </CardFooter>
          </Card>

          <Card variant="warm">
            <CardImage
              src="https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=400&h=300&fit=crop"
              alt="Zucchini"
            />
            <CardBody>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Organic Zucchini</h3>
                <StatusBadge status="expiring-soon" />
              </div>
              <p style={{ color: "var(--color-text-muted)", marginTop: "8px" }}>
                5 pieces · Expires tomorrow
              </p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                📍 Elm Street Garden Co-op
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="accent" size="sm">View Details</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardBody>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Neighborhood Garden Share</h3>
                <StatusBadge status="public" />
              </div>
              <p style={{ color: "var(--color-text-muted)", marginTop: "8px" }}>
                A community for sharing backyard garden produce with neighbors.
              </p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                👥 42 members
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="primary" size="sm">Join Community</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Form Fields */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Form Fields</h2>
        <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <FormField label="Produce Name" htmlFor="name" required>
            <Input id="name" placeholder="e.g., Fresh Tomatoes" />
          </FormField>
          <FormField label="Description" htmlFor="desc" helperText="Describe the item, freshness, and any relevant details.">
            <Textarea id="desc" placeholder="Tell others about this item..." />
          </FormField>
          <FormField label="Email" htmlFor="email" error="Please enter a valid email address" required>
            <Input id="email" type="email" placeholder="you@example.com" hasError />
          </FormField>
          <FormField label="Quantity" htmlFor="qty">
            <Input id="qty" type="number" placeholder="0" />
          </FormField>
        </div>
      </section>

      {/* Search Bar */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Search Bar</h2>
        <div style={{ maxWidth: "600px", marginTop: "16px" }}>
          <SearchBar
            placeholder="Search for produce, categories, or communities..."
            onSearch={(q) => console.log("Search:", q)}
          />
        </div>
      </section>

      {/* Page Header */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Page Header</h2>
        <div style={{ marginTop: "16px", padding: "24px", backgroundColor: "var(--color-background-alt)", borderRadius: "var(--radius-card)" }}>
          <PageHeader
            title="Browse Listings"
            subtitle="Find available food shared by local community members"
            action={<Button variant="primary">Create Listing</Button>}
          />
        </div>
      </section>

      {/* Empty State */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Empty State</h2>
        <div style={{ marginTop: "16px", padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-card)", border: "1px solid var(--color-border)" }}>
          <EmptyState
            icon={<span>🧺</span>}
            title="No listings found"
            description="Try adjusting your search or filters, or create a new listing to share with your community."
            action={<Button variant="primary">Create a Listing</Button>}
          />
        </div>
      </section>

      {/* Modal */}
      <section style={{ marginBottom: "48px" }}>
        <h2>Modal</h2>
        <div style={{ marginTop: "16px" }}>
          <Button variant="danger" onClick={() => setModalOpen(true)}>
            Delete Listing (open modal)
          </Button>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Delete Listing"
            description="Are you sure you want to delete this listing? This action cannot be undone."
          >
            <p>This will permanently remove "Fresh Tomatoes" and all associated messages.</p>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => setModalOpen(false)}>Delete Listing</Button>
            </ModalFooter>
          </Modal>
        </div>
      </section>
    </div>
  );
}
