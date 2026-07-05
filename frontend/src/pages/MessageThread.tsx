import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { getThreadById, getListingById, getUserById, mockClaimRequests } from "../data/mockData";
import type { Message } from "../data/types";
import "./MessageThread.css";

// Simulate logged-in user as Lily Chen (user_id 1)
const CURRENT_USER_ID = 1;

export default function MessageThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const thread = getThreadById(Number(threadId));
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(thread?.messages || []);

  if (!thread) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>💬</span>}
          title="Conversation not found"
          description="This message thread may have been removed or does not exist."
          action={
            <Link to="/messages">
              <Button variant="primary">Back to Inbox</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const listing = getListingById(thread.listing_id);
  const otherUserId = thread.participant_ids.find((id) => id !== CURRENT_USER_ID) || thread.participant_ids[1];
  const otherUser = getUserById(otherUserId);
  const claimRequest = mockClaimRequests.find((cr) => cr.request_id === thread.claim_request_id);
  const isActive = listing && (listing.status === "available" || listing.status === "reserved" || listing.status === "expiring-soon");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: Message = {
      message_id: messages.length + 100,
      thread_id: thread!.thread_id,
      sender_user_id: CURRENT_USER_ID,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  }

  return (
    <div className="page-container">
      {/* Back link */}
      <Link to="/messages" className="thread__back">
        ← Back to Inbox
      </Link>

      {/* Listing context pinned at top */}
      {listing && (
        <Card variant="warm" className="thread__listing-context">
          <CardBody>
            <div className="thread__listing">
              <img src={listing.photo_url} alt={listing.name} className="thread__listing-image" />
              <div className="thread__listing-info">
                <div className="thread__listing-header">
                  <h3>{listing.name}</h3>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="thread__listing-meta">
                  {listing.quantity} {listing.unit} · 📍 {listing.pickup_location}
                </p>
                <p className="thread__listing-meta">
                  Expires {new Date(listing.expiration_date).toLocaleDateString()}
                </p>
                {claimRequest && (
                  <p className="thread__claim-info">
                    Requested: {claimRequest.quantity_requested} {listing.unit} · Status: <StatusBadge status={claimRequest.status} />
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Conversation header */}
      <div className="thread__header">
        {otherUser?.profile_photo_url ? (
          <img src={otherUser.profile_photo_url} alt={otherUser.name} className="thread__header-avatar" />
        ) : (
          <div className="thread__header-avatar thread__header-avatar--placeholder">
            {otherUser?.name[0] || "?"}
          </div>
        )}
        <h2>{otherUser?.name || "Unknown User"}</h2>
      </div>

      {/* Messages */}
      <div className="thread__messages">
        {messages.map((msg) => {
          const isMine = msg.sender_user_id === CURRENT_USER_ID;
          const sender = getUserById(msg.sender_user_id);
          return (
            <div
              key={msg.message_id}
              className={`thread__bubble ${isMine ? "thread__bubble--mine" : "thread__bubble--theirs"}`}
            >
              {!isMine && (
                <span className="thread__bubble-name">{sender?.name}</span>
              )}
              <p className="thread__bubble-content">{msg.content}</p>
              <span className="thread__bubble-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Message input */}
      {isActive ? (
        <form onSubmit={handleSend} className="thread__input-area">
          <input
            type="text"
            className="thread__input"
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            aria-label="Message input"
          />
          <Button variant="primary" type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </form>
      ) : (
        <div className="thread__inactive">
          Listing is no longer active. New messages cannot be sent.
        </div>
      )}
    </div>
  );
}
