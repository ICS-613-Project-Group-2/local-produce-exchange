import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  getCommunity,
  browseListings,
  getCommunityMembers,
  getCommunityPosts,
  createCommunityPost,
  getUser,
  type CommunityResponse,
  type ListingResponse,
  type MembershipResponse,
  type CommunityPostResponse,
  type User,
  ApiError,
} from "../lib/api";
import type { BadgeStatus } from "../components/ui/StatusBadge";
import "./CommunityDetail.css";

type Tab = "listings" | "posts" | "members";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  useEffect(() => {
    loadCommunity();
  }, [id]);

  async function loadCommunity() {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const data = await getCommunity(Number(id));
      setCommunity(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      } else if (err instanceof ApiError && err.status === 404) {
        setCommunity(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load community");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="page-container"><p>Loading community...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>⚠️</span>}
          title="Something went wrong"
          description={error}
          action={<Button variant="primary" onClick={loadCommunity}>Try Again</Button>}
        />
      </div>
    );
  }

  if (!community && !forbidden) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🏘️</span>}
          title="Community not found"
          description="This community may have been removed or does not exist."
          action={<Link to="/communities"><Button variant="primary">Back to Communities</Button></Link>}
        />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="page-container">
        <div className="community-detail__locked">
          <h1>Private Community</h1>
          <StatusBadge status="private" />
          <p className="community-detail__locked-notice">
            This is a private community. You need an invitation or admin approval to view its content.
          </p>
          <Link to="/communities"><Button variant="outline">Back to Communities</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {community!.banner_url && (
        <div className="community-detail__banner">
          <img src={community!.banner_url} alt={community!.name} />
        </div>
      )}

      <div className="community-detail__header">
        <div className="community-detail__title-row">
          <h1>{community!.name}</h1>
          <StatusBadge status={community!.is_private ? "private" : "public"} />
        </div>
        <p className="community-detail__description">{community!.description}</p>
        <p className="community-detail__meta">👥 {community!.member_count} members</p>
        <div className="community-detail__actions">
          <Link to={`/communities/${community!.community_id}/admin`}>
            <Button variant="outline" size="sm">Manage Community</Button>
          </Link>
          <Link to="/listings/new">
            <Button variant="primary" size="sm">Create Listing</Button>
          </Link>
        </div>
      </div>

      <div className="community-detail__tabs">
        <button className={`community-detail__tab ${activeTab === "listings" ? "community-detail__tab--active" : ""}`} onClick={() => setActiveTab("listings")}>Listings</button>
        <button className={`community-detail__tab ${activeTab === "posts" ? "community-detail__tab--active" : ""}`} onClick={() => setActiveTab("posts")}>Posts</button>
        <button className={`community-detail__tab ${activeTab === "members" ? "community-detail__tab--active" : ""}`} onClick={() => setActiveTab("members")}>Members</button>
      </div>

      {activeTab === "listings" && <ListingsTab communityId={community!.community_id} />}
      {activeTab === "posts" && <PostsTab communityId={community!.community_id} />}
      {activeTab === "members" && <MembersTab communityId={community!.community_id} />}
    </div>
  );
}

function ListingsTab({ communityId }: { communityId: number }) {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browseListings({ community_id: communityId })
      .then((data) => setListings(data.filter((l) => l.status !== "closed" && l.status !== "completed")))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [communityId]);

  if (loading) return <p>Loading listings...</p>;

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<span>🧺</span>}
        title="No listings in this community yet"
        description="Be the first to share produce with this community."
        action={<Link to="/listings/new"><Button variant="primary">Create a Listing</Button></Link>}
      />
    );
  }

  return (
    <div className="community-detail__grid">
      {listings.map((listing) => (
        <Card key={listing.listing_id}>
          {listing.photo_url && (
            <div className="communities__banner">
              <img src={listing.photo_url} alt={listing.name} />
            </div>
          )}
          <CardBody>
            <div className="community-detail__card-header">
              <h3>{listing.name}</h3>
              {listing.status && <StatusBadge status={listing.status as BadgeStatus} />}
            </div>
            <p className="community-detail__card-meta">
              {listing.quantity} {listing.unit} · {listing.category}
            </p>
            {listing.pickup_location && (
              <p className="community-detail__card-meta">📍 {listing.pickup_location}</p>
            )}
          </CardBody>
          <CardFooter>
            <Link to={`/listings/${listing.listing_id}`}>
              <Button variant="primary" size="sm">View Details</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function PostsTab({ communityId }: { communityId: number }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPostResponse[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [communityId]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getCommunityPosts(communityId);
      setPosts(data);

      // Load user info for post authors
      const uniqueUserIds = [...new Set(data.map((p) => p.user_id))];
      const userMap: Record<number, User> = {};
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          try {
            const u = await getUser(uid);
            userMap[uid] = u;
          } catch {
            // skip
          }
        })
      );
      setUsers(userMap);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const post = await createCommunityPost(communityId, newPost.trim());
      setPosts((prev) => [post, ...prev]);
      if (user) setUsers((prev) => ({ ...prev, [user.user_id]: user }));
      setNewPost("");
    } catch {
      // fail silently
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="community-detail__posts">
      <form onSubmit={handlePost} className="community-detail__post-form">
        <textarea
          className="community-detail__post-input"
          placeholder="Share something with the community..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows={3}
        />
        <Button variant="primary" size="sm" type="submit" disabled={!newPost.trim() || posting}>
          {posting ? "Posting..." : "Post"}
        </Button>
      </form>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to share an update with this community."
        />
      ) : (
        <div className="community-detail__posts-list">
          {posts.map((post) => {
            const author = users[post.user_id];
            return (
              <Card key={post.post_id}>
                <CardBody>
                  <div className="community-detail__post-header">
                    <div className="community-detail__post-author">
                      {author?.profile_photo_url ? (
                        <img src={author.profile_photo_url} alt={author.name} className="community-detail__post-avatar" />
                      ) : (
                        <div className="community-detail__post-avatar community-detail__post-avatar--placeholder">
                          {author?.name?.[0] || "?"}
                        </div>
                      )}
                      <span className="community-detail__post-name">{author?.name || "Unknown"}</span>
                    </div>
                    <span className="community-detail__post-time">
                      {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="community-detail__post-content">{post.content}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MembersTab({ communityId }: { communityId: number }) {
  const [members, setMembers] = useState<MembershipResponse[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [communityId]);

  async function loadMembers() {
    setLoading(true);
    try {
      const data = await getCommunityMembers(communityId);
      setMembers(data);

      // Load user info
      const userMap: Record<number, User> = {};
      await Promise.all(
        data.map(async (m) => {
          try {
            const u = await getUser(m.user_id);
            userMap[m.user_id] = u;
          } catch {
            // skip
          }
        })
      );
      setUsers(userMap);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading members...</p>;

  if (members.length === 0) {
    return <EmptyState title="No members" description="This community has no members yet." />;
  }

  return (
    <div className="community-detail__members">
      {members.map((membership) => {
        const memberUser = users[membership.user_id];
        return (
          <div key={membership.user_id} className="community-detail__member-row">
            <div className="community-detail__member-info">
              {memberUser?.profile_photo_url ? (
                <img src={memberUser.profile_photo_url} alt={memberUser.name} className="community-detail__member-avatar" />
              ) : (
                <div className="community-detail__member-avatar community-detail__member-avatar--placeholder">
                  {memberUser?.name?.[0] || "?"}
                </div>
              )}
              <div>
                <span className="community-detail__member-name">{memberUser?.name || "Unknown"}</span>
                {membership.role && membership.role !== "member" && (
                  <StatusBadge status={membership.role as BadgeStatus} />
                )}
              </div>
            </div>
            <span className="community-detail__member-date">
              {membership.date_joined ? `Joined ${new Date(membership.date_joined).toLocaleDateString()}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
