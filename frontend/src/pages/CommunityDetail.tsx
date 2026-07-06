import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card, { CardImage, CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import FormField, { Textarea } from "../components/ui/FormField";
import {
  getCommunityById,
  getListingsByCommunity,
  getPostsByCommunity,
  getMembersByCommunity,
  getUserRole,
  getUserById,
} from "../data/mockData";
import "./CommunityDetail.css";

// Simulate logged-in user as Lily Chen (user_id 1)
const CURRENT_USER_ID = 1;

type Tab = "listings" | "posts" | "members";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const community = getCommunityById(Number(id));
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  if (!community) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<span>🏘️</span>}
          title="Community not found"
          description="This community may have been removed or does not exist."
          action={
            <Link to="/communities">
              <Button variant="primary">Back to Communities</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const userRole = getUserRole(CURRENT_USER_ID, community.community_id);
  const isMember = userRole !== null;
  const isAdmin = userRole === "admin";
  const members = getMembersByCommunity(community.community_id);

  // Private community, not a member — show locked view
  if (community.is_private && !isMember) {
    return (
      <div className="page-container">
        <div className="community-detail__locked">
          {community.banner_url && (
            <div className="community-detail__banner">
              <img src={community.banner_url} alt={community.name} />
            </div>
          )}
          <h1>{community.name}</h1>
          <StatusBadge status="private" />
          <p className="community-detail__locked-desc">{community.description}</p>
          <p className="community-detail__locked-members">👥 {community.member_count} members</p>
          <p className="community-detail__locked-notice">
            This is a private community. You need an invitation or admin approval to view its content.
          </p>
          <Button variant="secondary">Request to Join</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Banner */}
      {community.banner_url && (
        <div className="community-detail__banner">
          <img src={community.banner_url} alt={community.name} />
        </div>
      )}

      {/* Header */}
      <div className="community-detail__header">
        <div className="community-detail__title-row">
          <h1>{community.name}</h1>
          <StatusBadge status={community.is_private ? "private" : "public"} />
        </div>
        <p className="community-detail__description">{community.description}</p>
        <p className="community-detail__meta">👥 {members.length} members</p>
        <div className="community-detail__actions">
          {isAdmin && (
            <Link to={`/communities/${community.community_id}/admin`}>
              <Button variant="outline" size="sm">Manage Community</Button>
            </Link>
          )}
          <Link to="/listings/new">
            <Button variant="primary" size="sm">Create Listing</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="community-detail__tabs">
        <button
          className={`community-detail__tab ${activeTab === "listings" ? "community-detail__tab--active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          Listings
        </button>
        <button
          className={`community-detail__tab ${activeTab === "posts" ? "community-detail__tab--active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`community-detail__tab ${activeTab === "members" ? "community-detail__tab--active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "listings" && <ListingsTab communityId={community.community_id} />}
      {activeTab === "posts" && <PostsTab communityId={community.community_id} />}
      {activeTab === "members" && <MembersTab communityId={community.community_id} />}
    </div>
  );
}

function ListingsTab({ communityId }: { communityId: number }) {
  const listings = getListingsByCommunity(communityId).filter(
    (l) => l.status !== "closed" && l.status !== "completed"
  );

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<span>🧺</span>}
        title="No listings in this community yet"
        description="Be the first to share produce with this community."
        action={
          <Link to="/listings/new">
            <Button variant="primary">Create a Listing</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="community-detail__grid">
      {listings.map((listing) => (
        <Card key={listing.listing_id}>
          <CardImage src={listing.photo_url} alt={listing.name} />
          <CardBody>
            <div className="community-detail__card-header">
              <h3>{listing.name}</h3>
              <StatusBadge status={listing.status} />
            </div>
            <p className="community-detail__card-meta">
              {listing.quantity} {listing.unit} · {listing.category}
            </p>
            <p className="community-detail__card-meta">
              📍 {listing.pickup_location}
            </p>
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
  const posts = getPostsByCommunity(communityId);
  const [newPost, setNewPost] = useState("");
  const [localPosts, setLocalPosts] = useState(posts);

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;
    const post = {
      post_id: localPosts.length + 100,
      community_id: communityId,
      user_id: 1,
      content: newPost.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalPosts([post, ...localPosts]);
    setNewPost("");
  }

  return (
    <div className="community-detail__posts">
      {/* Post input */}
      <Card>
        <CardBody>
          <form onSubmit={handlePost} className="community-detail__post-form">
            <FormField label="Share an update" htmlFor="new-post">
              <Textarea
                id="new-post"
                placeholder="Share news, ask a question, or post an announcement..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </FormField>
            <Button variant="primary" size="sm" type="submit" disabled={!newPost.trim()}>
              Post
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Posts list */}
      {localPosts.length === 0 ? (
        <EmptyState
          title="No community posts yet"
          description="Start the conversation by sharing an update above."
        />
      ) : (
        <div className="community-detail__posts-list">
          {localPosts.map((post) => {
            const author = getUserById(post.user_id);
            return (
              <Card key={post.post_id}>
                <CardBody>
                  <div className="community-detail__post">
                    <div className="community-detail__post-header">
                      {author?.profile_photo_url ? (
                        <img src={author.profile_photo_url} alt={author.name} className="community-detail__post-avatar" />
                      ) : (
                        <div className="community-detail__post-avatar community-detail__post-avatar--placeholder">
                          {author?.name[0] || "?"}
                        </div>
                      )}
                      <div>
                        <span className="community-detail__post-name">{author?.name}</span>
                        <span className="community-detail__post-time">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="community-detail__post-content">{post.content}</p>
                  </div>
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
  const members = getMembersByCommunity(communityId);

  return (
    <div className="community-detail__members">
      {members.map((membership) => {
        const user = getUserById(membership.user_id);
        if (!user) return null;
        return (
          <div key={membership.user_id} className="community-detail__member">
            {user.profile_photo_url ? (
              <img src={user.profile_photo_url} alt={user.name} className="community-detail__member-avatar" />
            ) : (
              <div className="community-detail__member-avatar community-detail__member-avatar--placeholder">
                {user.name[0]}
              </div>
            )}
            <div className="community-detail__member-info">
              <span className="community-detail__member-name">{user.name}</span>
              {user.location && <span className="community-detail__member-location">📍 {user.location}</span>}
            </div>
            <StatusBadge
              status={membership.role === "admin" ? "approved" : "available"}
              label={membership.role === "admin" ? "Admin" : "Member"}
            />
          </div>
        );
      })}
    </div>
  );
}
