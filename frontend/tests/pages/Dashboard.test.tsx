import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Dashboard from '@/pages/Dashboard';

// Seed data has no listing 20 owned by user 1, and no claim with
// requester_user_id: 1 — so "reservedListings" and "pendingClaims" are
// always empty and the non-empty branch of the "Reserved & Pending"
// section (lines 217-236) never renders. We add one of each here so that
// branch renders on every test in this file.
vi.mock('@/data/mockData', async () => {
  const actual = await vi.importActual<typeof import('@/data/mockData')>('@/data/mockData');
  return {
    ...actual,
    mockListings: [
      ...actual.mockListings,
      {
        listing_id: 20,
        user_id: 1,
        community_id: 1,
        name: 'Canned Corn',
        description: 'Extra canned corn, reserved for a neighbor.',
        quantity: 4,
        unit: 'cans',
        category: 'Pantry Items',
        status: 'reserved',
        expiration_date: '2026-12-01',
        date_posted: '2026-07-01',
        pickup_location: 'Test Location',
        photo_url: 'https://images.unsplash.com/photo-0000000000000?w=400&h=300&fit=crop',
      },
    ],
    mockClaimRequests: [
      ...actual.mockClaimRequests,
      {
        request_id: 10,
        listing_id: 3,
        requester_user_id: 1,
        quantity_requested: 1,
        status: 'pending',
        request_date: '2026-07-03T09:00:00',
        closed_date: null,
      },
    ],
  };
});

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Dashboard', () => {

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('greeting', () => {

    it('must display welcome message', () => {
      renderDashboard();

      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      expect(screen.getByText(/happening with your food exchanges/)).toBeInTheDocument();
    });

  });

  describe('quick actions', () => {

    it('must display all quick action buttons', () => {
      renderDashboard();

      expect(screen.getByRole('link', { name: /Create Listing/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Browse Listings/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Messages/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Communities/ })).toBeInTheDocument();
    });

    it('must have correct navigation links', () => {
      renderDashboard();

      const createLink = screen.getByRole('link', { name: /Create Listing/ });
      expect(createLink).toHaveAttribute('href', '/listings/new');

      const browseLink = screen.getByRole('link', { name: /Browse Listings/ });
      expect(browseLink).toHaveAttribute('href', '/browse');
    });

  });

  describe('expiring soon alert', () => {

    it('must show an alert with the listing name when a listing expires within 2 days', () => {
      // Pin "now" so Organic Zucchini (listing 2, status "expiring-soon",
      // expires 2026-07-03) falls inside the 0-2 day window deterministically,
      // rather than depending on the real wall-clock date.
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-02T00:00:00'));

      renderDashboard();

      expect(screen.getByText(/expiring soon!/)).toBeInTheDocument();
      expect(
        screen.getByText(/Organic Zucchini — update or close before they expire\./)
      ).toBeInTheDocument();

      const manageLinks = screen.getAllByRole('link', { name: 'Manage' });
      const alertManageLink = manageLinks.find((l) => l.getAttribute('href') === '/listings/2/edit');
      expect(alertManageLink).toBeInTheDocument();
    });

    it('must not show the alert when nothing is expiring within 2 days', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00'));

      renderDashboard();

      expect(screen.queryByText(/expiring soon!/)).not.toBeInTheDocument();
    });

  });

  describe('stat cards', () => {

    it('must display stat cards with numbers', () => {
      renderDashboard();

      expect(screen.getByText('Active Listings')).toBeInTheDocument();
      expect(screen.getByText('Reserved', { selector: '.dashboard__stat-label' })).toBeInTheDocument();
      expect(screen.getByText('Unread Notifications')).toBeInTheDocument();
      expect(screen.getByText('Pending Claims')).toBeInTheDocument();
    });

  });

  describe('active listings section', () => {

    it('must display active listings section header', () => {
      renderDashboard();

      expect(screen.getByText('My Active Listings')).toBeInTheDocument();
    });

    it('must have link to view all history', () => {
      renderDashboard();

      const historyLink = screen.getByRole('link', { name: /View All History/ });
      expect(historyLink).toHaveAttribute('href', '/history');
    });

  });

  describe('my communities section', () => {

    it('must display my communities section', () => {
      renderDashboard();

      expect(screen.getByText('My Communities')).toBeInTheDocument();
    });

    it('must have browse all communities link', () => {
      renderDashboard();

      const browseAllLink = screen.getAllByRole('link', { name: /Browse All/ })[0];
      expect(browseAllLink).toHaveAttribute('href', '/communities');
    });

  });

  describe('reserved and pending section', () => {

    it('must display reserved and pending section', () => {
      renderDashboard();

      expect(screen.getByText('Reserved & Pending')).toBeInTheDocument();
    });

    it('must render a card for a reserved listing with a Manage link', () => {
      renderDashboard();

      expect(screen.getByText('Canned Corn')).toBeInTheDocument();
      expect(screen.getByText(/Your listing · 4 cans/)).toBeInTheDocument();

      const manageLinks = screen.getAllByRole('link', { name: 'Manage' });
      const reservedManageLink = manageLinks.find((l) => l.getAttribute('href') === '/listings/20/edit');
      expect(reservedManageLink).toBeInTheDocument();
    });

    it('must render a card for a pending claim with a View link', () => {
      renderDashboard();

      // The claim is against listing 3, Sourdough Bread Loaves.
      expect(screen.getByText('Sourdough Bread Loaves')).toBeInTheDocument();
      expect(screen.getByText(/Requested 1 loaves/)).toBeInTheDocument();

      const viewLinks = screen.getAllByRole('link', { name: 'View' });
      const claimViewLink = viewLinks.find((l) => l.getAttribute('href') === '/listings/3');
      expect(claimViewLink).toBeInTheDocument();
    });

  });

  describe('messages section', () => {

    it('must display recent messages section', () => {
      renderDashboard();

      expect(screen.getByText('Recent Messages')).toBeInTheDocument();
    });

    it('must have link to view all messages', () => {
      renderDashboard();

      const messageLinks = screen.getAllByRole('link', { name: /View All/ });
      const messagesLink = messageLinks.find(link => link.getAttribute('href') === '/messages');
      expect(messagesLink).toBeInTheDocument();
    });

  });

});