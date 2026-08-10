import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Profile from '@/pages/Profile';
import { mockUsers, mockListings, mockMemberships, mockCommunities } from '@/data/mockData';

// Profile.tsx hardcodes mockUsers[0] as the signed-in user.
const currentUser = mockUsers[0];

// Reviews live in a module-local array inside Profile.tsx, so the count is fixed.
const REVIEW_COUNT = 3;

const myListings = mockListings.filter((l) => l.user_id === currentUser.user_id);
const myCompleted = myListings.filter((l) => l.status === 'completed');
const myMemberships = mockMemberships.filter((m) => m.user_id === currentUser.user_id);
const myCommunities = mockCommunities.filter((c) =>
  myMemberships.some((m) => m.community_id === c.community_id)
);

function renderProfile() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </MemoryRouter>
  );
}

/** Reads the number rendered next to a stat label, e.g. statValue('Listings') -> '3'. */
function statValue(label: string) {
  const labelEl = screen.getByText(label, { selector: '.profile__stat-label' });
  return labelEl.parentElement?.querySelector('.profile__stat-number')?.textContent;
}

async function openSettings() {
  await userEvent.click(screen.getByRole('button', { name: /Settings/ }));
}

describe('Profile', () => {

  describe('page header', () => {

    it('must display profile title', () => {
      renderProfile();

      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

  });

  describe('tabs', () => {

    it('must display public profile and settings tabs', () => {
      renderProfile();

      expect(screen.getByRole('button', { name: /Public Profile/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Settings/ })).toBeInTheDocument();
    });

    it('must open on the public profile tab', () => {
      renderProfile();

      expect(screen.getByRole('button', { name: /Public Profile/ })).toHaveClass('profile__tab--active');
      expect(screen.getByRole('button', { name: /Settings/ })).not.toHaveClass('profile__tab--active');
    });

    it('must switch tabs on click', async () => {
      renderProfile();

      const settingsTab = screen.getByRole('button', { name: /Settings/ });
      await userEvent.click(settingsTab);

      expect(settingsTab).toHaveClass('profile__tab--active');
    });

    it('must switch back to the public profile tab', async () => {
      renderProfile();

      await openSettings();

      const profileTab = screen.getByRole('button', { name: /Public Profile/ });
      await userEvent.click(profileTab);

      expect(profileTab).toHaveClass('profile__tab--active');
      expect(screen.getByRole('button', { name: /Settings/ })).not.toHaveClass('profile__tab--active');
      expect(screen.queryByLabelText(/Display Name/)).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: currentUser.name })).toBeInTheDocument();
    });

  });

  describe('public profile', () => {

    it('must display user information', () => {
      renderProfile();

      expect(screen.getByRole('heading', { name: currentUser.name })).toBeInTheDocument();
      expect(screen.getByText(currentUser.email)).toBeInTheDocument();
      expect(screen.getByText(`📍 ${currentUser.location}`)).toBeInTheDocument();
      expect(
        screen.getByText(`⭐ ${currentUser.rating} rating (${REVIEW_COUNT} reviews)`)
      ).toBeInTheDocument();
    });

    it('must display the profile photo when the user has one', () => {
      renderProfile();

      const avatars = screen.getAllByRole('img', { name: currentUser.name });
      expect(avatars[0]).toHaveAttribute('src', currentUser.profile_photo_url);
    });

    it('must display stat cards with the correct counts', () => {
      renderProfile();

      expect(statValue('Listings')).toBe(String(myListings.length));
      expect(statValue('Completed')).toBe(String(myCompleted.length));
      expect(statValue('Communities')).toBe(String(myCommunities.length));
      expect(statValue('Reviews')).toBe(String(REVIEW_COUNT));
    });

    it('must display reviews section', () => {
      renderProfile();

      expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument();
      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
      expect(screen.getByText('Glen K.')).toBeInTheDocument();
      expect(screen.getByText('Rose J.')).toBeInTheDocument();
      expect(screen.getByText('Tomatoes were super fresh! Easy pickup.')).toBeInTheDocument();
    });

    it('must render star ratings out of five', () => {
      renderProfile();

      // Rose J. left 4 stars -> four filled, one empty.
      expect(screen.getByText('★★★★☆')).toBeInTheDocument();
    });

    it('must have links to history and dashboard', () => {
      renderProfile();

      const historyLink = screen.getByRole('link', { name: /View Listing History/ });
      const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/ });

      expect(historyLink).toHaveAttribute('href', '/history');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

  });

  describe('communities section', () => {

    it('must display communities list', () => {
      renderProfile();

      expect(screen.getByRole('heading', { name: 'Communities' })).toBeInTheDocument();

      myCommunities.forEach((community) => {
        expect(screen.getByRole('link', { name: community.name })).toHaveAttribute(
          'href',
          `/communities/${community.community_id}`
        );
      });
    });

  });

  describe('settings tab', () => {

    it('must display settings form when tab clicked', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Bio/)).toBeInTheDocument();
    });

    it('must prefill the form with the current user values', async () => {
      renderProfile();
      await openSettings();

      expect(screen.getByLabelText(/Display Name/)).toHaveValue(currentUser.name);
      expect(screen.getByLabelText(/Email/)).toHaveValue(currentUser.email);
      expect(screen.getByLabelText(/Location/)).toHaveValue(currentUser.location);
      expect(screen.getByLabelText(/Bio/)).toHaveValue('');
    });

    it('must validate required fields', async () => {
      renderProfile();
      await openSettings();

      const nameInput = screen.getByLabelText(/Display Name/) as HTMLInputElement;
      await userEvent.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      expect(screen.getByText('Display name is required.')).toBeInTheDocument();
      expect(screen.queryByText(/Profile updated successfully/)).not.toBeInTheDocument();
    });

    it('must show an error when email is empty', async () => {
      renderProfile();
      await openSettings();

      await userEvent.clear(screen.getByLabelText(/Email/));
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.queryByText(/Profile updated successfully/)).not.toBeInTheDocument();
    });

    it('must show an error when email format is invalid', async () => {
      renderProfile();
      await openSettings();

      const emailInput = screen.getByLabelText(/Email/);
      await userEvent.clear(emailInput);
      // Passes the native type="email" check (no dot required by HTML spec),
      // but fails the stricter regex in validate().
      await userEvent.type(emailInput, 'lily@example');
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      expect(screen.queryByText(/Profile updated successfully/)).not.toBeInTheDocument();
    });

    it('must clear a field error once the user edits that field', async () => {
      renderProfile();
      await openSettings();

      const nameInput = screen.getByLabelText(/Display Name/);
      await userEvent.clear(nameInput);
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));
      expect(screen.getByText('Display name is required.')).toBeInTheDocument();

      await userEvent.type(nameInput, 'Lily C.');

      expect(screen.queryByText('Display name is required.')).not.toBeInTheDocument();
    });

    it('must show success message on valid save', async () => {
      renderProfile();
      await openSettings();

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();
    });

    it('must hide the success message once the form is edited again', async () => {
      renderProfile();
      await openSettings();

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));
      expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/Bio/), 'Backyard gardener.');

      expect(screen.queryByText(/Profile updated successfully/)).not.toBeInTheDocument();
    });

  });

});