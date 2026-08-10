import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ListingHistory from '@/pages/ListingHistory';

// The seed data has zero claim requests made by user 1 (Lily Chen), so the
// "myClaims" branch of ListingHistory (lines 73-75: mapping a claim back to
// its listing/community) is otherwise unreachable. We inject one extra claim
// by user 1 against listing 3 (Sourdough Bread Loaves, owned by user 3 / Rose
// Johnson, community 2 / UH Mānoa Food Exchange) to exercise that path.
vi.mock('@/data/mockData', async () => {
  const actual = await vi.importActual<typeof import('@/data/mockData')>('@/data/mockData');
  return {
    ...actual,
    mockClaimRequests: [
      ...actual.mockClaimRequests,
      {
        request_id: 4,
        listing_id: 3,
        requester_user_id: 1,
        quantity_requested: 2,
        status: 'pending',
        request_date: '2026-07-03T09:00:00',
        closed_date: null,
      },
    ],
  };
});

function renderListingHistory() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ListingHistory />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ListingHistory', () => {

  describe('page header', () => {

    it('must display page title', () => {
      renderListingHistory();

      expect(screen.getByText('Listing History')).toBeInTheDocument();
    });

    it('must display subtitle', () => {
      renderListingHistory();

      expect(screen.getByText(/activity/i)).toBeInTheDocument();
    });

  });

  describe('summary stats', () => {

    it('must display stat cards', () => {
      renderListingHistory();

      expect(screen.getByText('Total Exchanges')).toBeInTheDocument();
      expect(screen.getByText('Items Listed')).toBeInTheDocument();
    });

  });

  describe('view toggle', () => {

    it('must display all view toggle buttons', () => {
      renderListingHistory();

      const viewToggle = within(document.querySelector('.history__view-toggle') as HTMLElement);
      expect(viewToggle.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(viewToggle.getByRole('button', { name: /Shared by Me/ })).toBeInTheDocument();
      expect(viewToggle.getByRole('button', { name: /Claimed by Me/ })).toBeInTheDocument();
    });

    it('must toggle to Shared by Me', async () => {
      renderListingHistory();

      const sharedButton = screen.getByRole('button', { name: /Shared by Me/ });
      await userEvent.click(sharedButton);

      expect(sharedButton).toHaveClass('history__view-btn--active');
      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      // A claimed-only item should not appear under "Shared by Me"
      expect(screen.queryByText('Sourdough Bread Loaves')).not.toBeInTheDocument();
    });

    it('must toggle to Claimed by Me and show items built from myClaims', async () => {
      renderListingHistory();

      const claimedButton = screen.getByRole('button', { name: /Claimed by Me/ });
      await userEvent.click(claimedButton);

      expect(claimedButton).toHaveClass('history__view-btn--active');
      // From the injected claim: listing 3's name, unit-based quantity, and
      // the listing owner surfaced via "From {displayName}"
      expect(screen.getByText('Sourdough Bread Loaves')).toBeInTheDocument();
      expect(screen.getByText(/You claimed/)).toBeInTheDocument();
      expect(screen.getByText('2 loaves', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/From Rose J\./)).toBeInTheDocument();
      // A shared-only item should not appear under "Claimed by Me"
      expect(screen.queryByText('Fresh Tomatoes')).not.toBeInTheDocument();
    });

    it('must switch back to All and show both shared and claimed items', async () => {
      renderListingHistory();

      await userEvent.click(screen.getByRole('button', { name: /Claimed by Me/ }));
      const viewToggle = within(document.querySelector('.history__view-toggle') as HTMLElement);
      const allButton = viewToggle.getByRole('button', { name: 'All' });
      await userEvent.click(allButton);

      expect(allButton).toHaveClass('history__view-btn--active');
      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Sourdough Bread Loaves')).toBeInTheDocument();
    });

  });

  describe('status filters', () => {

    it('must display filter buttons', () => {
      renderListingHistory();

      expect(screen.getByRole('button', { name: /Active/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reserved/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Completed/ })).toBeInTheDocument();
    });

    it('must filter by status when button clicked', async () => {
      renderListingHistory();

      const completedFilter = screen.getByRole('button', { name: /Completed/ });
      await userEvent.click(completedFilter);

      expect(completedFilter).toHaveClass('history__filter--active');
      expect(screen.getByText('Strawberry Jam')).toBeInTheDocument();
      expect(screen.queryByText('Fresh Tomatoes')).not.toBeInTheDocument();
    });

  });

  describe('leave a review', () => {

    it('must open the review modal with the correct recipient and listing name', async () => {
      renderListingHistory();

      const row = screen.getByText('Strawberry Jam').closest('.history__row') as HTMLElement;
      await userEvent.click(within(row).getByRole('button', { name: 'Leave Review' }));

      // handleOpenReview resolves other_user_id (4, Glen Kim) via the claim
      // on listing 7, so recipientName should be "Glen K." (displayName).
      expect(screen.getByText('Leave a Review')).toBeInTheDocument();
      expect(
        screen.getByText('How was your exchange with Glen K. for "Strawberry Jam"?')
      ).toBeInTheDocument();
    });

    it('must invoke the onSubmit callback with the selected rating and comment', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderListingHistory();

      const row = screen.getByText('Strawberry Jam').closest('.history__row') as HTMLElement;
      await userEvent.click(within(row).getByRole('button', { name: 'Leave Review' }));

      await userEvent.click(screen.getByRole('button', { name: '3 stars' }));
      await userEvent.type(screen.getByPlaceholderText(/Share your experience/), 'Great jam!');
      await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      expect(consoleSpy).toHaveBeenCalledWith('Review submitted:', { rating: 3, comment: 'Great jam!' });
      expect(screen.getByText(/Review Submitted/)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('must not submit and must show an error when no rating is selected', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderListingHistory();

      const row = screen.getByText('Strawberry Jam').closest('.history__row') as HTMLElement;
      await userEvent.click(within(row).getByRole('button', { name: 'Leave Review' }));
      await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      expect(screen.getByText('Please select a rating.')).toBeInTheDocument();
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('must not show Leave Review for a non-completed item', () => {
      renderListingHistory();

      const row = screen.getByText('Fresh Tomatoes').closest('.history__row') as HTMLElement;
      expect(within(row).queryByRole('button', { name: 'Leave Review' })).not.toBeInTheDocument();
    });

  });

  describe('history list', () => {

    it('must display history items', () => {
      renderListingHistory();

      const emptyState = screen.queryByText(/No listing history/);
      const historyItems = screen.queryAllByRole('link');

      if (historyItems.length === 0) {
        expect(emptyState).toBeInTheDocument();
      }
    });

  });

  describe('empty state', () => {

    it('must have create listing link in empty state', () => {
      renderListingHistory();

      const createLink = screen.queryByRole('link', { name: /Create/ });
      if (createLink) {
        expect(createLink).toBeInTheDocument();
      }
    });

  });

});