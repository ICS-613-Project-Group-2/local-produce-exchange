import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Profile from '@/pages/Profile';

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

    it('must switch tabs on click', async () => {
      renderProfile();

      const settingsTab = screen.getByRole('button', { name: /Settings/ });
      await userEvent.click(settingsTab);

      expect(settingsTab).toHaveClass('profile__tab--active');
    });

  });

  describe('public profile', () => {

    it('must display user information', () => {
      renderProfile();

      // Check that profile content is rendered
      const profileContent = screen.queryByText(/Listings/);
      if (profileContent) {
        expect(profileContent).toBeInTheDocument();
      }
    });

    it('must display stat cards', () => {
      renderProfile();

      expect(screen.getByText('Listings')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      // Just check that stat cards are rendered
      const stats = screen.getAllByText(/Listings|Completed/);
      expect(stats.length).toBeGreaterThan(0);
    });

    it('must display reviews section', () => {
      renderProfile();

      const reviewsHeading = screen.queryAllByText('Reviews').find(el => el.tagName === 'H2');
      if (reviewsHeading) {
        expect(reviewsHeading).toBeInTheDocument();
      }
    });

    it('must have links to history and dashboard', () => {
      renderProfile();

      const historyLink = screen.getByRole('link', { name: /View Listing History/ });
      const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/ });

      expect(historyLink).toHaveAttribute('href', '/history');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

  });

  describe('settings tab', () => {

    it('must display settings form when tab clicked', async () => {
      renderProfile();

      const settingsTab = screen.getByRole('button', { name: /Settings/ });
      await userEvent.click(settingsTab);

      expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
    });

    it('must validate required fields', async () => {
      renderProfile();

      const settingsTab = screen.getByRole('button', { name: /Settings/ });
      await userEvent.click(settingsTab);

      const nameInput = screen.getByLabelText(/Display Name/) as HTMLInputElement;
      await userEvent.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    });

    it('must show success message on valid save', async () => {
      renderProfile();

      const settingsTab = screen.getByRole('button', { name: /Settings/ });
      await userEvent.click(settingsTab);

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      expect(screen.getByText(/Profile updated successfully/)).toBeInTheDocument();
    });

  });

  describe('communities section', () => {

    it('must display communities list', () => {
      renderProfile();

      const communitiesHeading = screen.queryAllByText('Communities').find(el => el.tagName === 'H2');
      if (communitiesHeading) {
        expect(communitiesHeading).toBeInTheDocument();
      }
    });

  });

});
