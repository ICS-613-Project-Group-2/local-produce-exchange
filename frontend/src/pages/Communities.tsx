import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Card, { CardBody, CardFooter } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/feedback/EmptyState";
import { listCommunities, ApiError, type CommunityResponse } from "../lib/api";
import "./Communities.css";

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [myCommunities, setMyCommunities] = useState<CommunityResponse[]>([]);
  const [publicCommunities, setPublicCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listCommunities(searchQuery || undefined)
      .then((result) => {
        setMyCommunities(result.my_communities);
        setPublicCommunities(result.public_communities);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load communities.");
      })
      .finally(() => setLoading(false));
  }, [searchQuery]);

  const myCommunityIds = new Set(myCommunities.map((c) => c.community_id));
  const allCommunities = [...myCommunities, ...publicCommunities];

  function handleSearch(query: string) {
    setSearchQuery(query);
  }

  function getMembershipStatus(communityId: number): "joined" | "none" {
    return myCommunityIds.has(communityId) ? "joined" : "none";
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

      {loading ? (
        <p className="communities__status-message">Loading communities...</p>
      ) : error ? (
        <p className="communities__status-message">{error}</p>
      ) : allCommunities.length === 0 ? (
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
        <div className="communities__grid">
          {allCommunities.map((community) => {
            const status = getMembershipStatus(community.community_id);
            return (
              <Card key={community.community_id}>
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
                  <p className="communities__card-members">
                    👥 {community.member_count} members
                  </p>
                </CardBody>
                <CardFooter>
                  {status === "joined" ? (
                    <>
                      <Link to={`/communities/${community.community_id}`}>
                        <Button variant="outline" size="sm">View Community</Button>
                      </Link>
                      <span className="communities__joined-label">Already Joined</span>
                    </>
                  ) : community.is_private ? (
                    <Button variant="secondary" size="sm">Request to Join</Button>
                  ) : (
                    <Button variant="primary" size="sm">Join Community</Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
