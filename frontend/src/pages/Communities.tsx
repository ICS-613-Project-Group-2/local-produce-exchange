import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { mockCommunities, getMembersByCommunity, getUserById } from "../data/mockData";
import "./Communities.css";

// Simulate: user is a member of communities 1, 2, 4
const USER_COMMUNITY_IDS = [1, 2, 4];

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");

  // Only show public communities
  const publicCommunities = mockCommunities.filter((c) => !c.is_private);

  const filteredCommunities = searchQuery
    ? publicCommunities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : publicCommunities;

  // Separate into joined and available
  const joinedCommunities = filteredCommunities.filter((c) => USER_COMMUNITY_IDS.includes(c.community_id));
  const availableCommunities = filteredCommunities.filter((c) => !USER_COMMUNITY_IDS.includes(c.community_id));

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Communities"
        subtitle="Find and join local food-sharing communities"
        action={
          <Link to="/communities/new">
            <Button variant="primary">Create Community</Button>
          </Link>
        }
      />

      <div className="communities__search">
        <SearchBar
          placeholder="Search by community name or description..."
          onSearch={handleSearch}
        />
      </div>

      {filteredCommunities.length === 0 ? (
        <EmptyState
          icon={<span>🏘️</span>}
          title="No communities found"
          description="Try adjusting your search, or create a new community to start sharing food locally."
          action={
            <Link to="/communities/new">
              <Button variant="primary">Create a Community</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* My Communities */}
          {joinedCommunities.length > 0 && (
            <section className="communities__section">
              <h2 className="communities__section-title">My Communities</h2>
              <div className="communities__grid">
                {joinedCommunities.map((community) => (
                  <CommunityCard key={community.community_id} community={community} status="joined" />
                ))}
              </div>
            </section>
          )}

          {/* Available Communities */}
          {availableCommunities.length > 0 && (
            <section className="communities__section">
              <h2 className="communities__section-title">Available to Join</h2>
              <div className="communities__grid">
                {availableCommunities.map((community) => (
                  <CommunityCard key={community.community_id} community={community} status="none" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function CommunityCard({ community, status }: { community: typeof mockCommunities[0]; status: "joined" | "none" }) {
  const members = getMembersByCommunity(community.community_id);
  const memberAvatars = members.slice(0, 4).map((m) => getUserById(m.user_id)).filter(Boolean);

  return (
    <Card className="communities__card">
      {community.banner_url && (
        <div className="communities__banner">
          <img src={community.banner_url} alt={`${community.name} banner`} />
        </div>
      )}
      <CardBody>
        <div className="communities__card-header">
          <h3>{community.name}</h3>
          <StatusBadge status={community.is_private ? "private" : "public"} />
        </div>
        {community.description && (
          <p className="communities__card-description">{community.description}</p>
        )}
        <div className="communities__card-footer-info">
          <div className="communities__member-avatars">
            {memberAvatars.map((user) =>
              user?.profile_photo_url ? (
                <img key={user.user_id} src={user.profile_photo_url} alt={user.name} className="communities__member-avatar" />
              ) : (
                <div key={user?.user_id} className="communities__member-avatar communities__member-avatar--placeholder">
                  {user?.name[0]}
                </div>
              )
            )}
          </div>
          <span className="communities__card-members">
            {community.member_count} members
          </span>
        </div>
      </CardBody>
      <CardFooter>
        {status === "joined" ? (
          <>
            <Link to={`/communities/${community.community_id}`}>
              <Button variant="primary" size="sm">View Community</Button>
            </Link>
            <span className="communities__joined-label">✓ Joined</span>
          </>
        ) : (
          <Button variant="primary" size="sm">Join Community</Button>
        )}
      </CardFooter>
    </Card>
  );
}
