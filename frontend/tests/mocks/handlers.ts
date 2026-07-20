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
];