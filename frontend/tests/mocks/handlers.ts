import { http, HttpResponse } from 'msw';

const API_URL = 'http://127.0.0.1:8000';

export const handlers = [
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
    });
  }),

  http.post(`${API_URL}/v1/login`, () => {
    return HttpResponse.json({
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
    });
  }),

  http.get(`${API_URL}/v1/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }
    return HttpResponse.json({
      user_id: 1,
      name: 'Peter Pan',
      email: 'peter@example.com',
      profile_photo_id: null,
      profile_photo_url: null,
      location: null,
      rating: null,
    });
  }),

  http.get(`${API_URL}/v1/claims/mine`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }
    return HttpResponse.json([
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
    ]);
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

  http.get(`${API_URL}/v1/users/:userId/reviews`, () => {
    return HttpResponse.json({
      average_rating: 4.3,
      review_count: 2,
      reviews: [
        {
          review_id: 1,
          claim_request_id: 1,
          reviewer_user_id: 2,
          reviewer_name: 'Oliver Lee',
          reviewed_user_id: 1,
          rating: 5,
          comment: 'Tomatoes were super fresh! Easy pickup.',
          review_date: '2026-07-01T10:00:00',
        },
        {
          review_id: 2,
          claim_request_id: 2,
          reviewer_user_id: 3,
          reviewer_name: 'Rose Johnson',
          reviewed_user_id: 1,
          rating: 4,
          comment: 'Great communication, would trade again.',
          review_date: '2026-06-28T14:00:00',
        },
      ],
    });
  }),
];
