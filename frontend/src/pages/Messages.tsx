import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/feedback/EmptyState";
import Button from "../components/ui/Button";
import "./Messages.css";

export default function Messages() {
  return (
    <div className="page-container">
      <PageHeader
        title="Messages"
        subtitle="View conversations related to your listings, requests, and exchanges"
      />

      <EmptyState
        icon={<span>💬</span>}
        title="Messages"
        description="Conversations are created automatically when you submit a claim request on a listing. Visit a listing and submit a claim to start a conversation with the owner."
        action={
          <Link to="/browse">
            <Button variant="primary">Browse Listings</Button>
          </Link>
        }
      />
    </div>
  );
}
