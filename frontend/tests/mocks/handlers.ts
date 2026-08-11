import { http, HttpResponse } from 'msw';

const API_URL = 'http://127.0.0.1:8000';

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const mockUser = {
  user_id: 1,
  name: 'Peter Pan',
  email: 'peter@example.com',
  profile_photo_id: null,
  profile_photo_url: null,
  location: null,
  rating: 4.3,
  review_count: 2,
};

const mockListings = [
  {
    listing_id: 1,
    user_id: 1,
    community_id: 1,
    name: 'Fresh Tomatoes',
    description: 'Vine-ripened tomatoes from the garden.',
    quantity: 8,
    unit: 'lbs',
    status: 'available',
    expiration_date: '2026-08-15',
    date_posted: '2026-08-01T10:00:00',
    pickup_location: '123 Main St, front porch',
    category: 'vegetables',
    photo_url: 'https://images.unsplash.com/tomatoes.jpg',
  },
  {
    listing_id: 2,
    user_id: 2,
    community_id: 1,
    name: 'Meyer Lemons',
    description: 'Sweet Meyer lemons, great for baking.',
    quantity: 12,
    unit: 'pieces',
    status: 'available',
    expiration_date: '2026-08-20',
    date_posted: '2026-08-02T09:00:00',
    pickup_location: '456 Oak Ave, side gate',
    category: 'fruits',
    photo_url: 'https://images.unsplash.com/lemons.jpg',
  },
  {
    listing_id: 3,
    user_id: 1,
    community_id: 2,
    name: 'Sourdough Bread',
    description: 'Freshly baked sourdough loaves.',
    quantity: 3,
    unit: 'loaves',
    status: 'reserved',
    expiration_date: '2026-08-12',
    date_posted: '2026-07-30T14:00:00',
    pickup_location: '789 Elm St',
    category: 'baked_goods',
    photo_url: null,
  },
  {
    listing_id: 4,
    user_id: 3,
    community_id: 1,
    name: 'Expired Lettuce',
    description: 'Wilted lettuce.',
    quantity: 0,
    unit: 'heads',
    status: 'closed',
    expiration_date: '2026-07-01',
    date_posted: '2026-06-25T08:00:00',
    pickup_location: '321 Pine Rd',
    category: 'vegetables',
    photo_url: null,
  },
];

const mockCommunities = {
  my_communities: [
    {
      community_id: 1,
      name: 'Manoa Garden Share',
      description: 'A garden exchange community.',
      location: 'Manoa Valley',
      guidelines: 'Share freely.',
      is_private: false,
      member_count: 12,
      banner_url: null,
    },
  ],
  public_communities: [
    {
      community_id: 2,
      name: 'Kaimuki Exchange',
      description: 'Neighborhood produce sharing.',
      location: 'Kaimuki',
      guidelines: 'Be kind.',
      is_private: false,
      member_count: 8,
      banner_url: null,
    },
  ],
};

const mockClaims = [
  {
    request_id: 1,
    listing_id: 1,
    requester_user_id: 2,
    quantity_requested: 3,
    status: 'requested',
    request_date: '2026-08-01T10:00:00',
    closed_date: null,
  },
  {
    request_id: 2,
    listing_id: 2,
    requester_user_id: 1,
    quantity_requested: 6,
    status: 'approved',
    request_date: '2026-07-28T09:00:00',
    closed_date: null,
  },
];

const mockClaimHistory = [
  {
    request_id: 1,
    listing_id: 1,
    listing_name: 'Fresh Tomatoes',
    listing_photo_url: 'https://images.unsplash.com/tomatoes.jpg',
    quantity_requested: 3,
    status: 'requested',
    request_date: '2026-07-01T10:00:00',
    closed_date: null,
    role: 'owner',
    other_user_id: 2,
    other_user_name: 'Oliver Lee',
    can_review: false,
    already_reviewed: false,
  },
  {
    request_id: 2,
    listing_id: 5,
    listing_name: 'Organic Zucchini',
    listing_photo_url: null,
    quantity_requested: 2,
    status: 'approved',
    request_date: '2026-06-28T09:00:00',
    closed_date: null,
    role: 'claimant',
    other_user_id: 3,
    other_user_name: 'Rose Johnson',
    can_review: false,
    already_reviewed: false,
  },
  {
    request_id: 3,
    listing_id: 7,
    listing_name: 'Strawberry Jam',
    listing_photo_url: 'https://images.unsplash.com/jam.jpg',
    quantity_requested: 1,
    status: 'completed',
    request_date: '2026-06-20T14:00:00',
    closed_date: '2026-06-25T11:00:00',
    role: 'claimant',
    other_user_id: 4,
    other_user_name: 'Glen Kim',
    can_review: true,
    already_reviewed: false,
  },
  {
    request_id: 4,
    listing_id: 3,
    listing_name: 'Sourdough Bread',
    listing_photo_url: null,
    quantity_requested: 2,
    status: 'completed',
    request_date: '2026-06-15T08:00:00',
    closed_date: '2026-06-18T10:00:00',
    role: 'owner',
    other_user_id: 5,
    other_user_name: 'Malia Nakamura',
    can_review: false,
    already_reviewed: true,
  },
];

const mockThreads = [
  {
    thread_id: 1,
    claim_request_id: 1,
    listing_id: 1,
    participant_ids: [1, 2],
    listing_name: 'Fresh Tomatoes',
    other_user_id: 2,
    other_user_name: 'Oliver Lee',
    messages: [
      { message_id: 1, thread_id: 1, sender_user_id: 2, content: 'Hi! Are the tomatoes still available?', timestamp: '2026-08-01T11:00:00' },
      { message_id: 2, thread_id: 1, sender_user_id: 1, content: 'Yes they are! When can you pick up?', timestamp: '2026-08-01T11:30:00' },
    ],
  },
  {
    thread_id: 2,
    claim_request_id: 2,
    listing_id: 2,
    participant_ids: [1, 3],
    listing_name: 'Meyer Lemons',
    other_user_id: 3,
    other_user_name: 'Rose Johnson',
    messages: [
      { message_id: 3, thread_id: 2, sender_user_id: 1, content: 'I would love some lemons!', timestamp: '2026-07-28T10:00:00' },
    ],
  },
];

const mockNotifications = [
  {
    notification_id: 1,
    user_id: 1,
    message_id: null,
    claim_request_id: 1,
    content: 'Oliver requested 3 lbs of your Fresh Tomatoes.',
    timestamp: '2026-08-10T10:00:00',
    is_read: false,
    type: 'claim',
  },
  {
    notification_id: 2,
    user_id: 1,
    message_id: null,
    claim_request_id: null,
    content: 'Your Zucchini listing expires tomorrow.',
    timestamp: '2026-08-10T08:00:00',
    is_read: false,
    type: 'listing',
  },
  {
    notification_id: 3,
    user_id: 1,
    message_id: 1,
    claim_request_id: null,
    content: 'New message from Oliver about Fresh Tomatoes.',
    timestamp: '2026-08-09T15:00:00',
    is_read: true,
    type: 'message',
  },
  {
    notification_id: 4,
    user_id: 1,
    message_id: null,
    claim_request_id: null,
    content: 'Rose joined Manoa Garden Share.',
    timestamp: '2026-08-08T09:00:00',
    is_read: true,
    type: 'community',
  },
];

const mockMembers = [
  { user_id: 1, community_id: 1, role: 'owner', date_joined: '2026-06-01T00:00:00' },
  { user_id: 2, community_id: 1, role: 'member', date_joined: '2026-06-15T00:00:00' },
];

const mockPosts = [
  { post_id: 1, community_id: 1, user_id: 1, content: 'Welcome to the community!', timestamp: '2026-08-01T10:00:00' },
];

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const handlers = [
  // Auth
  http.post(`${API_URL}/v1/register`, async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string };
    return HttpResponse.json({
      user_id: 1,
      name: body.name,
      email: body.email,
      profile_photo_id: null,
      profile_photo_url: null,
      location: null,
      rating: null,
      review_count: 0,
    });
  }),

  http.post(`${API_URL}/v1/login`, () => {
    return HttpResponse.json({ access_token: 'fake-jwt-token', token_type: 'bearer' });
  }),

  http.get(`${API_URL}/v1/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }
    return HttpResponse.json(mockUser);
  }),

  http.put(`${API_URL}/v1/me`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),

  http.get(`${API_URL}/v1/me/listings`, () => {
    return HttpResponse.json(mockListings.filter(l => l.user_id === 1));
  }),

  // Listings
  http.get(`${API_URL}/v1/listings`, () => {
    return HttpResponse.json(mockListings);
  }),

  http.get(`${API_URL}/v1/listings/:id`, ({ params }) => {
    const listing = mockListings.find(l => l.listing_id === Number(params.id));
    if (!listing) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(listing);
  }),

  http.post(`${API_URL}/v1/listings`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      listing_id: 99,
      user_id: 1,
      community_id: body.community_id || 1,
      name: body.name,
      description: body.description || null,
      quantity: body.quantity,
      unit: body.unit || null,
      status: 'available',
      expiration_date: body.expiration_date || null,
      date_posted: '2026-08-10T10:00:00',
      pickup_location: body.pickup_location || null,
      category: body.category || null,
      photo_url: null,
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/v1/listings/:id`, async ({ params, request }) => {
    const listing = mockListings.find(l => l.listing_id === Number(params.id));
    if (!listing) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...listing, ...body });
  }),

  http.delete(`${API_URL}/v1/listings/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Claims
  http.get(`${API_URL}/v1/listings/:id/claims`, () => {
    return HttpResponse.json(mockClaims);
  }),

  http.post(`${API_URL}/v1/listings/:id/claims`, async ({ request }) => {
    const body = await request.json() as { quantity_requested: number };
    return HttpResponse.json({
      request_id: 99,
      listing_id: 1,
      requester_user_id: 1,
      quantity_requested: body.quantity_requested,
      status: 'requested',
      request_date: '2026-08-10T10:00:00',
      closed_date: null,
    }, { status: 201 });
  }),

  http.get(`${API_URL}/v1/claims/mine`, () => {
    return HttpResponse.json(mockClaimHistory);
  }),

  http.put(`${API_URL}/v1/claims/:claimId/approve`, () => {
    return HttpResponse.json({ request_id: 1, status: 'approved' });
  }),

  http.put(`${API_URL}/v1/claims/:claimId/decline`, () => {
    return HttpResponse.json({ request_id: 1, status: 'denied' });
  }),

  http.put(`${API_URL}/v1/claims/:claimId/pickup`, () => {
    return HttpResponse.json({ request_id: 2, status: 'picked_up' });
  }),

  http.put(`${API_URL}/v1/claims/:claimId/complete`, () => {
    return HttpResponse.json({ request_id: 2, status: 'completed' });
  }),

  http.post(`${API_URL}/v1/claims/:claimId/reviews`, () => {
    return HttpResponse.json({
      review_id: 10,
      claim_request_id: 3,
      reviewer_user_id: 1,
      reviewer_name: 'Peter Pan',
      reviewed_user_id: 4,
      rating: 4,
      comment: 'Great jam!',
      review_date: '2026-07-10T10:00:00',
    });
  }),

  // Reviews
  http.get(`${API_URL}/v1/users/:userId/reviews`, () => {
    return HttpResponse.json({
      average_rating: 4.3,
      review_count: 2,
      reviews: [
        { review_id: 1, claim_request_id: 1, reviewer_user_id: 2, reviewer_name: 'Oliver Lee', reviewed_user_id: 1, rating: 5, comment: 'Tomatoes were super fresh!', review_date: '2026-07-01T10:00:00' },
        { review_id: 2, claim_request_id: 2, reviewer_user_id: 3, reviewer_name: 'Rose Johnson', reviewed_user_id: 1, rating: 4, comment: 'Great communication.', review_date: '2026-06-28T14:00:00' },
      ],
    });
  }),

  // Communities
  http.get(`${API_URL}/v1/communities`, () => {
    return HttpResponse.json(mockCommunities);
  }),

  http.get(`${API_URL}/v1/communities/:id`, ({ params }) => {
    const all = [...mockCommunities.my_communities, ...mockCommunities.public_communities];
    const community = all.find(c => c.community_id === Number(params.id));
    if (!community) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(community);
  }),

  http.post(`${API_URL}/v1/communities`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      community_id: 99,
      name: body.name,
      description: body.description,
      location: body.location,
      guidelines: body.guidelines,
      is_private: body.is_private,
      member_count: 1,
      banner_url: null,
    }, { status: 201 });
  }),

  http.post(`${API_URL}/v1/communities/:id/join`, () => {
    return HttpResponse.json({ user_id: 1, community_id: 2, role: 'member', date_joined: '2026-08-10T00:00:00' });
  }),

  http.post(`${API_URL}/v1/communities/:id/leave`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/v1/communities/:id/invite`, () => {
    return HttpResponse.json({ invitation_id: 1, community_id: 1, sender_user_id: 1, email: 'invite@test.com', status: 'pending', sent_date: '2026-08-10T00:00:00', expiration_date: '2026-08-17T00:00:00' });
  }),

  http.get(`${API_URL}/v1/communities/:id/members`, () => {
    return HttpResponse.json(mockMembers);
  }),

  http.delete(`${API_URL}/v1/communities/:communityId/members/:userId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.put(`${API_URL}/v1/communities/:communityId/members/:userId/role`, () => {
    return HttpResponse.json({ user_id: 2, community_id: 1, role: 'moderator', date_joined: '2026-06-15T00:00:00' });
  }),

  http.get(`${API_URL}/v1/communities/:id/posts`, () => {
    return HttpResponse.json(mockPosts);
  }),

  http.post(`${API_URL}/v1/communities/:id/posts`, async ({ request }) => {
    const body = await request.json() as { content: string };
    return HttpResponse.json({ post_id: 99, community_id: 1, user_id: 1, content: body.content, timestamp: '2026-08-10T10:00:00' }, { status: 201 });
  }),

  http.get(`${API_URL}/v1/communities/:id/join-requests`, () => {
    return HttpResponse.json([]);
  }),

  // Messages
  http.get(`${API_URL}/v1/me/threads`, () => {
    return HttpResponse.json(mockThreads);
  }),

  http.get(`${API_URL}/v1/claims/:claimId/thread`, ({ params }) => {
    const thread = mockThreads.find(t => t.claim_request_id === Number(params.claimId));
    if (!thread) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(thread);
  }),

  http.post(`${API_URL}/v1/claims/:claimId/thread/messages`, async ({ request, params }) => {
    const body = await request.json() as { content: string };
    return HttpResponse.json({
      message_id: 99,
      thread_id: 1,
      sender_user_id: 1,
      content: body.content,
      timestamp: '2026-08-10T12:00:00',
    }, { status: 201 });
  }),

  // Notifications
  http.get(`${API_URL}/v1/me/notifications`, () => {
    return HttpResponse.json(mockNotifications);
  }),

  http.put(`${API_URL}/v1/notifications/:id/read`, ({ params }) => {
    const n = mockNotifications.find(n => n.notification_id === Number(params.id));
    if (!n) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json({ ...n, is_read: true });
  }),

  http.put(`${API_URL}/v1/me/notifications/read-all`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Photos
  http.post(`${API_URL}/v1/photos`, () => {
    return HttpResponse.json({ photo_id: 50, image_link: 'https://images.unsplash.com/uploaded.jpg' });
  }),

  // Users
  http.get(`${API_URL}/v1/users/:id`, ({ params }) => {
    return HttpResponse.json({ user_id: Number(params.id), name: 'Other User', email: 'other@test.com', profile_photo_id: null, profile_photo_url: null, location: null, rating: null, review_count: 0 });
  }),
];
