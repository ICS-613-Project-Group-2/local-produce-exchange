import { describe, it, expect } from 'vitest';
import {
  mockUsers,
  mockCommunities,
  mockListings,
  mockPosts,
  mockMemberships,
  mockJoinRequests,
  mockThreads,
  getUserById,
  getCommunityById,
  getListingById,
  getListingsByCommunity,
  getActiveListings,
  getThreadById,
  getThreadsForUser,
  getPostsByCommunity,
  getMembersByCommunity,
  getUserRole,
  getJoinRequestsByCommunity,
} from '@/data/mockData';

const MISSING_ID = 9999;

describe('mockData helpers', () => {

  describe('getUserById', () => {

    it('must return the matching user', () => {
      const user = getUserById(1);

      expect(user).toBeDefined();
      expect(user?.user_id).toBe(1);
      expect(user?.name).toBe(mockUsers[0].name);
    });

    it('must return undefined for an unknown id', () => {
      expect(getUserById(MISSING_ID)).toBeUndefined();
    });

  });

  describe('getCommunityById', () => {

    it('must return the matching community', () => {
      const community = getCommunityById(1);

      expect(community?.community_id).toBe(1);
      expect(community?.name).toBe(mockCommunities[0].name);
    });

    it('must return undefined for an unknown id', () => {
      expect(getCommunityById(MISSING_ID)).toBeUndefined();
    });

  });

  describe('getListingById', () => {

    it('must return the matching listing', () => {
      const listing = getListingById(1);

      expect(listing?.listing_id).toBe(1);
      expect(listing?.name).toBe('Fresh Tomatoes');
    });

    it('must return undefined for an unknown id', () => {
      expect(getListingById(MISSING_ID)).toBeUndefined();
    });

  });

  describe('getListingsByCommunity', () => {

    it('must return only listings belonging to the community', () => {
      const listings = getListingsByCommunity(1);

      expect(listings.length).toBeGreaterThan(0);
      listings.forEach((l) => expect(l.community_id).toBe(1));
    });

    it('must return an empty array for a community with no listings', () => {
      expect(getListingsByCommunity(MISSING_ID)).toEqual([]);
    });

  });

  describe('getActiveListings', () => {

    it('must exclude closed and completed listings', () => {
      const active = getActiveListings();

      expect(active.length).toBeGreaterThan(0);
      active.forEach((l) => {
        expect(l.status).not.toBe('closed');
        expect(l.status).not.toBe('completed');
      });
    });

    it('must return every listing that is not closed or completed', () => {
      const expected = mockListings.filter(
        (l) => l.status !== 'closed' && l.status !== 'completed'
      );

      expect(getActiveListings()).toHaveLength(expected.length);
    });

    it('must omit the completed strawberry jam listing', () => {
      const ids = getActiveListings().map((l) => l.listing_id);

      // listing_id 7 is the only "completed" entry in the fixture data
      expect(ids).not.toContain(7);
      expect(ids).toContain(1);
    });

  });

  describe('getThreadById', () => {

    it('must return the matching thread', () => {
      const thread = getThreadById(1);

      expect(thread?.thread_id).toBe(1);
      expect(thread?.messages.length).toBeGreaterThan(0);
    });

    it('must return undefined for an unknown id', () => {
      expect(getThreadById(MISSING_ID)).toBeUndefined();
    });

  });

  describe('getThreadsForUser', () => {

    it('must return only threads the user participates in', () => {
      const threads = getThreadsForUser(1);

      expect(threads.length).toBeGreaterThan(0);
      threads.forEach((t) => expect(t.participant_ids).toContain(1));
    });

    it('must return an empty array for a user with no threads', () => {
      expect(getThreadsForUser(MISSING_ID)).toEqual([]);
    });

    it('must match the fixture data', () => {
      const expected = mockThreads.filter((t) => t.participant_ids.includes(4));

      expect(getThreadsForUser(4)).toHaveLength(expected.length);
    });

  });

  describe('getPostsByCommunity', () => {

    it('must return only posts from the given community', () => {
      const posts = getPostsByCommunity(1);

      expect(posts.length).toBeGreaterThan(0);
      posts.forEach((p) => expect(p.community_id).toBe(1));
    });

    it('must return an empty array for a community with no posts', () => {
      expect(getPostsByCommunity(MISSING_ID)).toEqual([]);
    });

    it('must match the fixture data', () => {
      const expected = mockPosts.filter((p) => p.community_id === 2);

      expect(getPostsByCommunity(2)).toHaveLength(expected.length);
    });

  });

  describe('getMembersByCommunity', () => {

    it('must return only memberships for the given community', () => {
      const members = getMembersByCommunity(1);

      expect(members.length).toBeGreaterThan(0);
      members.forEach((m) => expect(m.community_id).toBe(1));
    });

    it('must return an empty array for a community with no members', () => {
      expect(getMembersByCommunity(MISSING_ID)).toEqual([]);
    });

    it('must match the fixture data', () => {
      const expected = mockMemberships.filter((m) => m.community_id === 1);

      expect(getMembersByCommunity(1)).toHaveLength(expected.length);
    });

  });

  describe('getUserRole', () => {

    it('must return "admin" for a community admin', () => {
      expect(getUserRole(1, 1)).toBe('admin');
    });

    it('must return "member" for a regular member', () => {
      expect(getUserRole(2, 1)).toBe('member');
    });

    it('must return null when the user is not a member of the community', () => {
      expect(getUserRole(7, 1)).toBeNull();
    });

    it('must return null for an unknown user', () => {
      expect(getUserRole(MISSING_ID, 1)).toBeNull();
    });

    it('must return null for an unknown community', () => {
      expect(getUserRole(1, MISSING_ID)).toBeNull();
    });

  });

  describe('getJoinRequestsByCommunity', () => {

    it('must return pending requests for the given community', () => {
      const requests = getJoinRequestsByCommunity(3);

      expect(requests.length).toBeGreaterThan(0);
      requests.forEach((r) => {
        expect(r.community_id).toBe(3);
        expect(r.status).toBe('pending');
      });
    });

    it('must match the fixture data', () => {
      const expected = mockJoinRequests.filter(
        (r) => r.community_id === 3 && r.status === 'pending'
      );

      expect(getJoinRequestsByCommunity(3)).toHaveLength(expected.length);
    });

    it('must return an empty array for a community with no join requests', () => {
      expect(getJoinRequestsByCommunity(1)).toEqual([]);
    });

    it('must return an empty array for an unknown community', () => {
      expect(getJoinRequestsByCommunity(MISSING_ID)).toEqual([]);
    });

  });

});
