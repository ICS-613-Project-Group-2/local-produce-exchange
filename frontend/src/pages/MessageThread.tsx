import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  getThread,
  getListing,
  sendMessage,
  type MessageThreadResponse,
  type MessageResponse,
  type ListingResponse,
} from "../lib/api";
import type { BadgeStatus } from "../components/ui/StatusBadge";
import "./MessageThread.css";

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function MessageThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const currentUserId = user?.user_id || 0;

  const [thread, setThread] = useState<MessageThreadResponse | null>(null);
  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [listingCollapsed, setListingCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThread();
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadThread() {
    setLoading(true);
    setError(null);
    try {
      // threadId here corresponds to claim_request_id for the API
      const claimId = Number(threadId);
      const threadData = await getThread(claimId);
      setThread(threadData);
      setMessages(threadData.messages);

      if (threadData.listing_id) {
        getListing(threadData.listing_id).then(setListing).catch(() => setListing(null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !thread) return;
    setSending(true);
    try {
      // claim_request_id is used to send messages
      const msg = await sendMessage(thread.claim_request_id!, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="page-container"><p>Loading conversation...</p></div>;
  }

  if (error || !thread) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>💬</span>}
          title="Conversation not found"
          description={error || "This message thread may have been removed or does not exist."}
          action={<Link to="/messages"><Button variant="primary">Back to Messages</Button></Link>}
        />
      </div>
    );
  }

  // Messaging is allowed only while the claim is still active (not completed, denied, or cancelled)
  const closedClaimStatuses = ["completed", "denied", "cancelled"];
  const isActive = thread.claim_status ? !closedClaimStatuses.includes(thread.claim_status) : true;

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageResponse[] }[] = [];
  messages.forEach((msg) => {
    const dateLabel = msg.timestamp ? formatDate(msg.timestamp) : "Unknown";
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateLabel) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, messages: [msg] });
    }
  });

  const lastMessage = messages[messages.length - 1];
  const lastMessageIsMine = lastMessage?.sender_user_id === currentUserId;

  return (
    <div className="thread-page">
      {/* Top Bar */}
      <div className="thread-page__topbar">
        <Link to="/messages" className="thread-page__back">←</Link>
        <div className="thread-page__topbar-user">
          <span className="thread-page__topbar-name">Conversation</span>
        </div>
        {listing && (
          <Link to={`/listings/${listing.listing_id}`} className="thread-page__topbar-listing">
            View Listing
          </Link>
        )}
      </div>

      {/* Listing Context */}
      {listing && (
        <div className={`thread-page__listing ${listingCollapsed ? "thread-page__listing--collapsed" : ""}`}>
          <button className="thread-page__listing-toggle" onClick={() => setListingCollapsed(!listingCollapsed)}>
            {listing.photo_url && <img src={listing.photo_url} alt={listing.name} className="thread-page__listing-thumb" />}
            <div className="thread-page__listing-info">
              <span className="thread-page__listing-name">{listing.name}</span>
              <span className="thread-page__listing-meta">
                {listing.quantity} {listing.unit} · {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
              </span>
            </div>
            <span className="thread-page__listing-chevron">{listingCollapsed ? "▼" : "▲"}</span>
          </button>
          {!listingCollapsed && (
            <div className="thread-page__listing-details">
              {listing.pickup_location && <p>📍 {listing.pickup_location}</p>}
              {listing.expiration_date && <p>📅 Expires {new Date(listing.expiration_date).toLocaleDateString()}</p>}
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      <div className="thread-page__chat">
        <div className="thread-page__messages">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="thread-page__date-separator"><span>{group.date}</span></div>
              {group.messages.map((msg) => {
                const isMine = msg.sender_user_id === currentUserId;
                return (
                  <div key={msg.message_id} className={`thread-page__bubble-row ${isMine ? "thread-page__bubble-row--mine" : "thread-page__bubble-row--theirs"}`}>
                    <div className={`thread-page__bubble ${isMine ? "thread-page__bubble--mine" : "thread-page__bubble--theirs"}`}>
                      <p className="thread-page__bubble-content">{msg.content}</p>
                      <span className="thread-page__bubble-time">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {lastMessageIsMine && <div className="thread-page__read-receipt">✓ Delivered</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {isActive ? (
        <div className="thread-page__input-wrapper">
          <form onSubmit={handleSend} className="thread-page__input-area">
            <input
              type="text"
              className="thread-page__input"
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              aria-label="Message input"
            />
            <button type="submit" className="thread-page__send-btn" disabled={!newMessage.trim() || sending} aria-label="Send message">
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="thread-page__inactive">
          Listing is no longer active. New messages cannot be sent.
        </div>
      )}
    </div>
  );
}
