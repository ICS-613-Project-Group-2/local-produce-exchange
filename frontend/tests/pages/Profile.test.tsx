import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import Profile from '@/pages/Profile';

const API_URL = 'http://127.0.0.1:8000';

function renderProfile() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Profile', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading state', () => {
    it('shows loading message when user is not yet available', () => {
      clearToken();
      renderProfile();
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });

  describe('page header and tabs', () => {
    it('displays the Profile page header', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });

    it('displays Public Profile and Settings tabs', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Public Profile' })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    });

    it('opens on the Public Profile tab by default', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Public Profile' })).toHaveClass('profile__tab--active');
      });
    });

    it('switches to Settings tab on click', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

      expect(screen.getByRole('button', { name: 'Settings' })).toHaveClass('profile__tab--active');
      expect(screen.getByRole('button', { name: 'Public Profile' })).not.toHaveClass('profile__tab--active');
    });
  });

  describe('public profile', () => {
    it('displays the user name as a heading', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Peter Pan' })).toBeInTheDocument();
      });
    });

    it('displays the user email', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('peter@example.com')).toBeInTheDocument();
      });
    });

    it('displays the average rating and review count', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText(/4.3 rating/)).toBeInTheDocument();
      });
    });

    it('displays review cards with reviewer names and comments', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Oliver Lee')).toBeInTheDocument();
      });
      expect(screen.getByText('Tomatoes were super fresh!')).toBeInTheDocument();
      expect(screen.getByText('Rose Johnson')).toBeInTheDocument();
      expect(screen.getByText('Great communication.')).toBeInTheDocument();
    });

    it('shows empty state when user has no reviews', async () => {
      server.use(
        http.get(`${API_URL}/v1/users/:userId/reviews`, () => {
          return HttpResponse.json({
            average_rating: null,
            review_count: 0,
            reviews: [],
          });
        })
      );
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('No reviews yet')).toBeInTheDocument();
      });
    });

    it('shows no reviews section when the reviews API fails', async () => {
      server.use(
        http.get(`${API_URL}/v1/users/:userId/reviews`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );
      renderProfile();

      // The page catches review errors gracefully and shows "No reviews yet"
      await waitFor(() => {
        expect(screen.getByText('No reviews yet')).toBeInTheDocument();
      });
    });

    it('has a link to View Listing History', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /View Listing History/ })).toHaveAttribute('href', '/history');
      });
    });

    it('has a link to Go to Dashboard', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Go to Dashboard/ })).toHaveAttribute('href', '/dashboard');
      });
    });
  });

  describe('settings tab', () => {
    async function openSettings() {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
      });
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    }

    it('displays the settings form when Settings tab is clicked', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Bio/)).toBeInTheDocument();
    });

    it('prefills name and email from the authenticated user', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Display Name/)).toHaveValue('Peter Pan');
      expect(screen.getByLabelText(/Email/)).toHaveValue('peter@example.com');
    });

    it('has email field disabled (not editable)', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Email/)).toBeDisabled();
    });

    it('shows an error when Display Name is empty on submit', async () => {
      renderProfile();
      await openSettings();

      await userEvent.clear(screen.getByLabelText(/Display Name/));
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    });

    it('clears a field error once the user edits that field', async () => {
      renderProfile();
      await openSettings();

      await userEvent.clear(screen.getByLabelText(/Display Name/));
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));
      expect(screen.getByText('Display name is required.')).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/Display Name/), 'New Name');

      expect(screen.queryByText('Display name is required.')).not.toBeInTheDocument();
    });

    it('shows success message on valid save', async () => {
      renderProfile();
      await openSettings();

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      await waitFor(() => {
        expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();
      });
    });

    it('hides the success message once the form is edited again', async () => {
      renderProfile();
      await openSettings();

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));
      await waitFor(() => {
        expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText(/Bio/), 'I love gardening.');

      expect(screen.queryByText(/Profile updated successfully/)).not.toBeInTheDocument();
    });
  });
});
