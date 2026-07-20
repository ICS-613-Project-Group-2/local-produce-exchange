import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  getToken,
  setToken,
  clearToken,
  registerUser,
  loginUser,
  getMe,
  ApiError,
} from '@/lib/api';

const API_URL = 'http://127.0.0.1:8000';

describe('token storage', () => {                                   // Test Suite

  afterEach(() => {                                                 // Test Fixture (teardown)
    clearToken();
  });

  it('must return null when no token is set', () => {               // Test Case
    expect(getToken()).toBeNull();
  });

  it('must store and retrieve a token', () => {
    setToken('abc123');

    expect(getToken()).toBe('abc123');
  });

  it('must remove the token when cleared', () => {
    setToken('abc123');
    clearToken();

    expect(getToken()).toBeNull();
  });
});

describe('registerUser', () => {                                    // Test Suite

  it('must return the created user on success', async () => {       // Test Case
    const user = await registerUser({
      name: 'Peter Pan',
      email: 'peter@example.com',
      password: 'secret123',
    });

    expect(user).toEqual({
      user_id: 1,
      name: 'Peter Pan',
      email: 'peter@example.com',
      profile_photo_id: null,
      profile_photo_url: null,
      location: null,
      rating: null,
    });
  });

  it('must throw an ApiError when the server responds with an error', async () => {
    server.use(                                                     // override handler for this test only
      http.post(`${API_URL}/v1/register`, () => {
        return HttpResponse.json({ detail: 'Email already registered' }, { status: 400 });
      })
    );

    await expect(
      registerUser({ name: 'Peter Pan', email: 'peter@example.com', password: 'secret123' })
    ).rejects.toThrow(ApiError);
  });
});

describe('loginUser', () => {

  it('must return an access token on success', async () => {
    const result = await loginUser({ email: 'peter@example.com', password: 'secret123' });

    expect(result).toEqual({
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
    });
  });
});

describe('getMe', () => {

  beforeEach(() => {                                                // Test Fixture (setup)
    setToken('fake-jwt-token');
  });

  afterEach(() => {                                                 // Test Fixture (teardown)
    clearToken();
  });

  it('must return the current user when authenticated', async () => {
    const user = await getMe();

    expect(user.name).toBe('Peter Pan');
  });

  it('must throw an ApiError when no token is present', async () => {
    clearToken();

    await expect(getMe()).rejects.toThrow(ApiError);
  });
});