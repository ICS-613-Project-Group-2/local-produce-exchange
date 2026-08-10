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
