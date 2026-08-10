import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { getThreadById, getListingById, getUserById, mockClaimRequests } from "../data/mockData";
import { displayName } from "../data/utils";
import type { Message } from "../data/types";
import "./MessageThread.css";

const CURRENT_USER_ID = 1;

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
  const thread = getThreadById(Number(threadId));
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(thread?.messages || []);
  const [listingCollapsed, setListingCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!thread) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>💬</span>}
          title="Conversation not found"
          description="This message thread may have been removed or does not exist."
          action={<Link to="/messages"><Button variant="primary">Back to Inbox</Button></Link>}
        />
      </div>
    );
  }

  const listing = getListingById(thread.listing_id);
  const otherUserId = thread.participant_ids.find((id) => id !== CURRENT_USER_ID) || thread.participant_ids[1];
  const otherUser = getUserById(otherUserId);
  const claimRequest = mockClaimRequests.find((cr) => cr.request_id === thread.claim_request_id);
  const isActive = listing && (listing.status === "available" || listing.status === "reserved" || listing.status === "expiring-soon");
  const isOwner = listing && listing.user_id === CURRENT_USER_ID;

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

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateLabel) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, messages: [msg] });
    }
  });

  const lastMessage = messages[messages.length - 1];
  const lastMessageIsMine = lastMessage?.sender_user_id === CURRENT_USER_ID;

  return (
    <div className="thread-page">
      {/* Top Bar */}
      <div className="thread-page__topbar">
        <Link to="/messages" className="thread-page__back">←</Link>
        <div className="thread-page__topbar-user">
          {otherUser?.profile_photo_url ? (
            <img src={otherUser.profile_photo_url} alt={otherUser.name} className="thread-page__topbar-avatar" />
          ) : (
            <div className="thread-page__topbar-avatar thread-page__topbar-avatar--placeholder">
              {otherUser?.name[0] || "?"}
            </div>
          )}
          <div>
            <span className="thread-page__topbar-name">{displayName(otherUser?.name || "Unknown")}</span>
            {otherUser?.location && <span className="thread-page__topbar-location">📍 {otherUser.location}</span>}
          </div>
        </div>
        {listing && (
          <Link to={`/listings/${listing.listing_id}`} className="thread-page__topbar-listing">
            View Listing
          </Link>
        )}
      </div>

      {/* Listing Context (collapsible) */}
      {listing && (
        <div className={`thread-page__listing ${listingCollapsed ? "thread-page__listing--collapsed" : ""}`}>
          <button className="thread-page__listing-toggle" onClick={() => setListingCollapsed(!listingCollapsed)}>
            <img src={listing.photo_url} alt={listing.name} className="thread-page__listing-thumb" />
            <div className="thread-page__listing-info">
              <span className="thread-page__listing-name">{listing.name}</span>
              <span className="thread-page__listing-meta">
                {listing.quantity} {listing.unit} · <StatusBadge status={listing.status} />
              </span>
            </div>
            <span className="thread-page__listing-chevron">{listingCollapsed ? "▼" : "▲"}</span>
          </button>
          {!listingCollapsed && (
            <div className="thread-page__listing-details">
              <p>📍 {listing.pickup_location}</p>
              <p>📅 Expires {new Date(listing.expiration_date).toLocaleDateString()}</p>
              {claimRequest && (
                <p className="thread-page__claim-info">
                  Requested: {claimRequest.quantity_requested} {listing.unit} · <StatusBadge status={claimRequest.status} />
                </p>
              )}
              {/* Owner quick actions */}
              {isOwner && isActive && claimRequest && claimRequest.status === "pending" && (
                <div className="thread-page__owner-actions">
                  <Button variant="primary" size="sm">Approve Claim</Button>
                  <Button variant="danger" size="sm">Decline</Button>
                  <Button variant="outline" size="sm">Mark Reserved</Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Container */}
      <div className="thread-page__chat">
        <div className="thread-page__messages">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="thread-page__date-separator">
                <span>{group.date}</span>
              </div>
              {group.messages.map((msg, i) => {
                const isMine = msg.sender_user_id === CURRENT_USER_ID;
                const sender = getUserById(msg.sender_user_id);
                const showAvatar = !isMine && (i === 0 || group.messages[i - 1]?.sender_user_id !== msg.sender_user_id);
                return (
                  <div
                    key={msg.message_id}
                    className={`thread-page__bubble-row ${isMine ? "thread-page__bubble-row--mine" : "thread-page__bubble-row--theirs"}`}
                  >
                    {!isMine && (
                      <div className="thread-page__bubble-avatar-slot">
                        {showAvatar ? (
                          sender?.profile_photo_url ? (
                            <img src={sender.profile_photo_url} alt={sender.name} className="thread-page__bubble-avatar" />
                          ) : (
                            <div className="thread-page__bubble-avatar thread-page__bubble-avatar--placeholder">{sender?.name[0]}</div>
                          )
                        ) : null}
                      </div>
                    )}
                    <div className={`thread-page__bubble ${isMine ? "thread-page__bubble--mine" : "thread-page__bubble--theirs"}`}>
                      <p className="thread-page__bubble-content">{msg.content}</p>
                      <span className="thread-page__bubble-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {/* Read receipt */}
          {lastMessageIsMine && (
            <div className="thread-page__read-receipt">
              ✓ Delivered
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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
            <button
              type="submit"
              className="thread-page__send-btn"
              disabled={!newMessage.trim()}
              aria-label="Send message"
            >
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
