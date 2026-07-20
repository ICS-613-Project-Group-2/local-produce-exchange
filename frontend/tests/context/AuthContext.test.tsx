import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { clearToken } from '@/lib/api';

const API_URL = 'http://127.0.0.1:8000';

// A minimal component that exposes AuthContext state/actions for testing
function AuthConsumer() {
  const { user, isLoggedIn, isLoading, login, register, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div>Logged in: {isLoggedIn ? 'yes' : 'no'}</div>
      <div>User: {user?.name ?? 'none'}</div>
      <button onClick={() => login('peter@example.com', 'secret123')}>Login</button>
      <button onClick={() => register('Peter Pan', 'peter@example.com', 'secret123')}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('AuthProvider', () => {                                        // Test Suite

  beforeEach(() => {                                                    // Test Fixture (setup)
    clearToken();
  });

  it('must resolve to logged out when no token exists', async () => {
    renderWithAuth();

    await waitFor(() => {
        expect(screen.getByText('Logged in: no')).toBeInTheDocument();
    });
  });

  it('must log the user in and update context state when login succeeds', async () => {
    renderWithAuth();
    await waitFor(() => screen.getByText('Logged in: no'));

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Logged in: yes')).toBeInTheDocument();
    });
    expect(screen.getByText('User: Peter Pan')).toBeInTheDocument();
  });

  it('must register and then log the user in when register succeeds', async () => {
    renderWithAuth();
    await waitFor(() => screen.getByText('Logged in: no'));

    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Logged in: yes')).toBeInTheDocument();
    });
  });

  it('must clear the user and log out when logout is called', async () => {
    renderWithAuth();
    await waitFor(() => screen.getByText('Logged in: no'));
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => screen.getByText('Logged in: yes'));

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(screen.getByText('Logged in: no')).toBeInTheDocument();
    expect(screen.getByText('User: none')).toBeInTheDocument();
  });

  it('must restore the logged-in user on mount when a valid token already exists', async () => {
    server.use(
      http.get(`${API_URL}/v1/me`, () => {
        return HttpResponse.json({
          user_id: 2,
          name: 'Wendy Darling',
          email: 'wendy@example.com',
          profile_photo_id: null,
          profile_photo_url: null,
          location: null,
          rating: null,
        });
      })
    );
    localStorage.setItem('greenbeans_access_token', 'existing-token');

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('User: Wendy Darling')).toBeInTheDocument();
    });
  });

  it('must clear an invalid token when the initial getMe call fails', async () => {
    server.use(
      http.get(`${API_URL}/v1/me`, () => {
        return HttpResponse.json({ detail: 'Invalid token' }, { status: 401 });
      })
    );
    localStorage.setItem('greenbeans_access_token', 'expired-token');

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Logged in: no')).toBeInTheDocument();
    });
    expect(localStorage.getItem('greenbeans_access_token')).toBeNull();
  });
});