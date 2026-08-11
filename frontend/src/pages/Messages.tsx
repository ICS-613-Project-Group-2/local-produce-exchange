import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/feedback/EmptyState";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import {
  getMyThreads,
  getListing,
  getUser,
  type MessageThreadResponse,
  type ListingResponse,
  type User,
} from "../lib/api";
import "./Messages.css";

interface ThreadDisplay {
  thread: MessageThreadResponse;
  listing: ListingResponse | null;
  otherUser: User | null;
  lastMessageContent: string;
  lastMessageTime: string;
  isUnread: boolean;
}

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const threadData = await getMyThreads();

      const displays: ThreadDisplay[] = await Promise.all(
        threadData.map(async (thread) => {
          let listing: ListingResponse | null = null;
          let otherUser: User | null = null;

          if (thread.listing_id) {
            listing = await getListing(thread.listing_id).catch(() => null);
          }

          // find the other participant
          const otherUserId = thread.participant_ids.find((id) => id !== user?.user_id);
          if (otherUserId) {
            otherUser = await getUser(otherUserId).catch(() => null);
          }

          const lastMsg = thread.messages[thread.messages.length - 1];
          const lastMessageContent = lastMsg?.content || "";
          const lastMessageTime = lastMsg?.timestamp || "";

          // consider unread if the last message was not from the current user
          const isUnread = lastMsg ? lastMsg.sender_user_id !== user?.user_id : false;

          return { thread, listing, otherUser, lastMessageContent, lastMessageTime, isUnread };
        })
      );

      setThreads(displays);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    // Deferred so the initial setState calls in loadThreads don't run
    // synchronously within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      void loadThreads();
    });
  }, [loadThreads]);

  if (loading) {
    return <div className="page-container"><p>Loading messages...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader title="Messages" subtitle="View conversations related to your listings, requests, and exchanges" />
        <EmptyState
          icon={<span>⚠️</span>}
          title="Failed to load messages"
          description={error}
          action={<Button variant="primary" onClick={loadThreads}>Try Again</Button>}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Messages"
        subtitle="View conversations related to your listings, requests, and exchanges"
      />

      {threads.length === 0 ? (
        <EmptyState
          icon={<span>💬</span>}
          title="No conversations yet"
          description="Conversations are created automatically when you submit a claim request on a listing. Visit a listing and submit a claim to start a conversation with the owner."
          action={
            <Link to="/browse">
              <Button variant="primary">Browse Listings</Button>
            </Link>
          }
        />
      ) : (
        <div className="messages__list">
          {threads.map(({ thread, listing, otherUser, lastMessageContent, lastMessageTime, isUnread }) => (
            <Link
              key={thread.thread_id}
              to={`/messages/${thread.claim_request_id}`}
              className="messages__thread-link"
            >
              <Card className={`messages__thread-card ${isUnread ? "messages__thread-card--unread" : ""}`}>
                <CardBody>
                  <div className="messages__thread-row">
                    <div className="messages__thread-avatar">
                      {otherUser?.profile_photo_url ? (
                        <img src={otherUser.profile_photo_url} alt={otherUser.name} />
                      ) : (
                        <div className="messages__thread-avatar--placeholder">
                          {otherUser?.name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div className="messages__thread-content">
                      <div className="messages__thread-header">
                        <span className="messages__thread-name">
                          {otherUser?.name || "Unknown User"}
                        </span>
                        <span className="messages__thread-time">
                          {lastMessageTime ? formatTime(lastMessageTime) : ""}
                        </span>
                      </div>
                      {listing && (
                        <span className="messages__thread-listing">
                          Re: {listing.name}
                        </span>
                      )}
                      <p className="messages__thread-preview">
                        {lastMessageContent.length > 80 ? lastMessageContent.slice(0, 80) + "..." : lastMessageContent}
                      </p>
                    </div>
                    {isUnread && <span className="messages__unread-dot" />}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}