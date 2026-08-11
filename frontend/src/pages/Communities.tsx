import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import {
  listCommunities,
  joinCommunity,
  type CommunityResponse,
} from "../lib/api";
import "./Communities.css";

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [myCommunities, setMyCommunities] = useState<CommunityResponse[]>([]);
  const [publicCommunities, setPublicCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommunities();
  }, [searchQuery]);

  async function loadCommunities() {
    setLoading(true);
    setError(null);
    try {
      const data = await listCommunities(searchQuery || undefined);
      setMyCommunities(data.my_communities);
      setPublicCommunities(data.public_communities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  async function handleJoin(communityId: number) {
    try {
      await joinCommunity(communityId);
      await loadCommunities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to join community");
    }
  }

  const noResults = myCommunities.length === 0 && publicCommunities.length === 0;

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

      {loading ? (
        <p className="communities__loading">Loading communities...</p>
      ) : error ? (
        <EmptyState
          icon={<span>⚠️</span>}
          title="Something went wrong"
          description={error}
          action={<Button variant="primary" onClick={loadCommunities}>Try Again</Button>}
        />
      ) : noResults ? (
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
          {myCommunities.length > 0 && (
            <section className="communities__section">
              <h2 className="communities__section-title">My Communities</h2>
              <div className="communities__grid">
                {myCommunities.map((community) => (
                  <CommunityCard key={community.community_id} community={community} status="joined" />
                ))}
              </div>
            </section>
          )}

          {publicCommunities.length > 0 && (
            <section className="communities__section">
              <h2 className="communities__section-title">Available to Join</h2>
              <div className="communities__grid">
                {publicCommunities.map((community) => (
                  <CommunityCard key={community.community_id} community={community} status="none" onJoin={handleJoin} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function CommunityCard({
  community,
  status,
  onJoin,
}: {
  community: CommunityResponse;
  status: "joined" | "none";
  onJoin?: (id: number) => void;
}) {
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
          <span className="communities__card-members">👥 {community.member_count} members</span>
          {community.location && <span className="communities__card-location">📍 {community.location}</span>}
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
          <Button variant="primary" size="sm" onClick={() => onJoin?.(community.community_id)}>
            Join Community
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
