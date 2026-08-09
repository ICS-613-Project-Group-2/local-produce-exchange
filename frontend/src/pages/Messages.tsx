import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardBody } from "../components/ui/Card";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/feedback/EmptyState";
import Button from "../components/ui/Button";
import { getThreadsForUser, getUserById, getListingById } from "../data/mockData";
import { displayName } from "../data/utils";
import "./Messages.css";

const CURRENT_USER_ID = 1;

export default function Messages() {
  const allThreads = getThreadsForUser(CURRENT_USER_ID);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = searchQuery
    ? allThreads.filter((thread) => {
        const otherUserId = thread.participant_ids.find((id) => id !== CURRENT_USER_ID) || thread.participant_ids[1];
        const otherUser = getUserById(otherUserId);
        const listing = getListingById(thread.listing_id);
        const searchLower = searchQuery.toLowerCase();
        return (
          otherUser?.name.toLowerCase().includes(searchLower) ||
          listing?.name.toLowerCase().includes(searchLower)
        );
      })
    : allThreads;

  // Split into active (has recent message) and older
  const now = Date.now();
  const activeThreads = filteredThreads.filter((t) => {
    const lastMsg = t.messages[t.messages.length - 1];
    const diff = now - new Date(lastMsg.timestamp).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
  });
  const olderThreads = filteredThreads.filter((t) => {
    const lastMsg = t.messages[t.messages.length - 1];
    const diff = now - new Date(lastMsg.timestamp).getTime();
    return diff >= 7 * 24 * 60 * 60 * 1000;
  });

  const unreadCount = filteredThreads.filter((t) => {
    const lastMsg = t.messages[t.messages.length - 1];
    return lastMsg.sender_user_id !== CURRENT_USER_ID;
  }).length;

  return (
    <div className="page-container">
      <PageHeader
        title={`Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        subtitle="View conversations related to your listings, requests, and exchanges"
      />

      <div className="messages__search">
        <SearchBar
          placeholder="Search by name or listing..."
          onSearch={setSearchQuery}
        />
      </div>

      {filteredThreads.length === 0 ? (
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
        <div className="messages__sections">
          {activeThreads.length > 0 && (
            <section className="messages__section">
              <h3 className="messages__section-label">Recent</h3>
              <div className="messages__list">
                {activeThreads.map((thread) => (
                  <ThreadCard key={thread.thread_id} thread={thread} />
                ))}
              </div>
            </section>
          )}
          {olderThreads.length > 0 && (
            <section className="messages__section">
              <h3 className="messages__section-label">Older</h3>
              <div className="messages__list">
                {olderThreads.map((thread) => (
                  <ThreadCard key={thread.thread_id} thread={thread} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ThreadCard({ thread }: { thread: ReturnType<typeof getThreadsForUser>[0] }) {
  const otherUserId = thread.participant_ids.find((id) => id !== CURRENT_USER_ID) || thread.participant_ids[1];
  const otherUser = getUserById(otherUserId);
  const listing = getListingById(thread.listing_id);
  const lastMessage = thread.messages[thread.messages.length - 1];
  const isUnread = lastMessage.sender_user_id !== CURRENT_USER_ID;

  function timeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  return (
    <Link to={`/messages/${thread.thread_id}`} className="messages__thread-link">
      <Card className={`messages__thread-card ${isUnread ? "messages__thread-card--unread" : ""}`}>
        <CardBody>
          <div className="messages__thread">
            {otherUser?.profile_photo_url ? (
              <img src={otherUser.profile_photo_url} alt={otherUser.name} className="messages__avatar" />
            ) : (
              <div className="messages__avatar messages__avatar--placeholder">
                {otherUser?.name[0] || "?"}
              </div>
            )}
            <div className="messages__thread-content">
              <div className="messages__thread-header">
                <span className="messages__thread-name">{displayName(otherUser?.name || "Unknown User")}</span>
                <span className="messages__thread-time">{timeAgo(lastMessage.timestamp)}</span>
              </div>
              {listing && (
                <p className="messages__thread-listing">Re: {listing.name}</p>
              )}
              <p className="messages__thread-preview">
                {lastMessage.sender_user_id === CURRENT_USER_ID ? "You: " : ""}
                {lastMessage.content.length > 70 ? lastMessage.content.slice(0, 70) + "..." : lastMessage.content}
              </p>
            </div>
            {isUnread && <span className="messages__unread-dot" aria-label="Unread" />}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
