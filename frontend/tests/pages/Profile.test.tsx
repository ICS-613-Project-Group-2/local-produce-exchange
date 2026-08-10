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
    // Seed a token so AuthProvider fetches /v1/me and populates user
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading state', () => {

    it('must show loading message when user is not yet available', () => {
      // Clear the token so user stays null
      clearToken();
      renderProfile();

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

  });

  describe('page header and tabs', () => {

    it('must display the Profile page header', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
      });
    });

    it('must display Public Profile and Settings tabs', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Public Profile' })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    });

    it('must open on the Public Profile tab by default', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Public Profile' })).toHaveClass('profile__tab--active');
      });
      expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveClass('profile__tab--active');
    });

    it('must switch to Settings tab on click', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

      expect(screen.getByRole('button', { name: 'Settings' })).toHaveClass('profile__tab--active');
      expect(screen.getByRole('button', { name: 'Public Profile' })).not.toHaveClass('profile__tab--active');
    });

    it('must switch back to Public Profile tab', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
      await userEvent.click(screen.getByRole('button', { name: 'Public Profile' }));

      expect(screen.getByRole('button', { name: 'Public Profile' })).toHaveClass('profile__tab--active');
    });

  });

  describe('public profile', () => {

    it('must display the user name as a heading', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Peter Pan' })).toBeInTheDocument();
      });
    });

    it('must display the user email', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('peter@example.com')).toBeInTheDocument();
      });
    });

    it('must display a placeholder avatar when no photo URL exists', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('P')).toBeInTheDocument();
      });
    });

    it('must display a photo avatar when the user has a profile photo', async () => {
      server.use(
        http.get(`${API_URL}/v1/me`, () => {
          return HttpResponse.json({
            user_id: 1,
            name: 'Peter Pan',
            email: 'peter@example.com',
            profile_photo_id: 1,
            profile_photo_url: 'https://example.com/photo.jpg',
            location: null,
            rating: null,
          });
        })
      );
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Peter Pan' })).toHaveAttribute(
          'src',
          'https://example.com/photo.jpg'
        );
      });
    });

    it('must display the average rating and review count', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('⭐ 4.3 rating (2 reviews)')).toBeInTheDocument();
      });
    });

    it('must display review cards with reviewer names and comments', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Oliver Lee')).toBeInTheDocument();
      });
      expect(screen.getByText('Tomatoes were super fresh! Easy pickup.')).toBeInTheDocument();
      expect(screen.getByText('Rose Johnson')).toBeInTheDocument();
      expect(screen.getByText('Great communication, would trade again.')).toBeInTheDocument();
    });

    it('must display star ratings using repeated ⭐ emoji', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('⭐⭐⭐⭐⭐')).toBeInTheDocument(); // 5 stars
      });
      expect(screen.getByText('⭐⭐⭐⭐')).toBeInTheDocument(); // 4 stars
    });

    it('must show empty state when user has no reviews', async () => {
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
      expect(screen.getByText('Reviews will appear here after you complete exchanges.')).toBeInTheDocument();
    });

    it('must show an error message when the reviews API fails', async () => {
      server.use(
        http.get(`${API_URL}/v1/users/:userId/reviews`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('must have a link to View Listing History', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /View Listing History/ })).toHaveAttribute('href', '/history');
      });
    });

    it('must have a link to Go to Dashboard', async () => {
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

    it('must display the settings form when Settings tab is clicked', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Bio/)).toBeInTheDocument();
    });

    it('must prefill name and email from the authenticated user', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Display Name/)).toHaveValue('Peter Pan');
      expect(screen.getByLabelText(/Email/)).toHaveValue('peter@example.com');
    });

    it('must show an error when Display Name is empty on submit', async () => {
      renderProfile();
      await openSettings();

      await userEvent.clear(screen.getByLabelText(/Display Name/));
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    });

    it('must show an error when Email is empty on submit', async () => {
      renderProfile();
      await openSettings();

      await userEvent.clear(screen.getByLabelText(/Email/));
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });

    it('must show an error when Email format is invalid', async () => {
      renderProfile();
      await openSettings();

      const emailInput = screen.getByLabelText(/Email/);
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'peter@example');
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    it('must clear a field error once the user edits that field', async () => {
      renderProfile();
      await openSettings();

      await userEvent.clear(screen.getByLabelText(/Display Name/));
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));
      expect(screen.getByText('Display name is required.')).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/Display Name/), 'New Name');

      expect(screen.queryByText('Display name is required.')).not.toBeInTheDocument();
    });

    it('must show success message on valid save', async () => {
      renderProfile();
      await openSettings();

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();
    });

    it('must hide the success message once the form is edited again', async () => {
      renderProfile();
      await openSettings();

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));
      expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/Bio/), 'I love gardening.');

      expect(screen.queryByText(/Profile updated successfully/)).not.toBeInTheDocument();
    });

  });

});
