import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardBody } from "../components/ui/Card";
import EmptyState from "../components/feedback/EmptyState";
import Button from "../components/ui/Button";
import { getThreadsForUser, getUserById, getListingById } from "../data/mockData";
import "./Messages.css";

// Simulate logged-in user as Lily Chen (user_id 1)
const CURRENT_USER_ID = 1;

export default function Messages() {
  const threads = getThreadsForUser(CURRENT_USER_ID);

  return (
    <div className="page-container">
      <PageHeader
        title="Messages"
        subtitle="View conversations related to your listings, requests, and exchanges"
      />

      {threads.length === 0 ? (
        <EmptyState
          icon={<span>💬</span>}
          title="No messages yet"
          description="When you message a listing owner or someone claims your listing, conversations will appear here."
          action={
            <Link to="/browse">
              <Button variant="primary">Browse Listings</Button>
            </Link>
          }
        />
      ) : (
        <div className="messages__list">
          {threads.map((thread) => {
            const otherUserId = thread.participant_ids.find((id) => id !== CURRENT_USER_ID) || thread.participant_ids[1];
            const otherUser = getUserById(otherUserId);
            const listing = getListingById(thread.listing_id);
            const lastMessage = thread.messages[thread.messages.length - 1];
            const isUnread = lastMessage.sender_user_id !== CURRENT_USER_ID;

            return (
              <Link
                key={thread.thread_id}
                to={`/messages/${thread.thread_id}`}
                className="messages__thread-link"
              >
                <Card className={isUnread ? "messages__thread--unread" : ""}>
                  <CardBody>
                    <div className="messages__thread">
                      {otherUser?.profile_photo_url ? (
                        <img
                          src={otherUser.profile_photo_url}
                          alt={otherUser.name}
                          className="messages__avatar"
                        />
                      ) : (
                        <div className="messages__avatar messages__avatar--placeholder">
                          {otherUser?.name[0] || "?"}
                        </div>
                      )}
                      <div className="messages__thread-content">
                        <div className="messages__thread-header">
                          <span className="messages__thread-name">
                            {otherUser?.name || "Unknown User"}
                          </span>
                          <span className="messages__thread-time">
                            {new Date(lastMessage.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {listing && (
                          <p className="messages__thread-listing">
                            Re: {listing.name}
                          </p>
                        )}
                        <p className="messages__thread-preview">
                          {lastMessage.sender_user_id === CURRENT_USER_ID ? "You: " : ""}
                          {lastMessage.content.length > 80
                            ? lastMessage.content.slice(0, 80) + "..."
                            : lastMessage.content}
                        </p>
                      </div>
                      {isUnread && <span className="messages__unread-dot" aria-label="Unread" />}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
