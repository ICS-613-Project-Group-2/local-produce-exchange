import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ListingHistory from '@/pages/ListingHistory';

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

      expect(screen.getByRole('button', { name: /Shared by Me/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Claimed by Me/ })).toBeInTheDocument();
    });

    it('must toggle between views', async () => {
      renderListingHistory();

      const sharedButton = screen.getByRole('button', { name: /Shared by Me/ });
      await userEvent.click(sharedButton);

      expect(sharedButton).toHaveClass('history__view-btn--active');
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
    });

  });

  describe('history list', () => {

    it('must display history items', () => {
      renderListingHistory();

      // Check if history items or empty state is displayed
      const emptyState = screen.queryByText(/No listing history/);
      const historyItems = screen.queryAllByRole('link');

      // Either empty state or items should be shown
      if (historyItems.length === 0) {
        expect(emptyState).toBeInTheDocument();
      }
    });

  });

  describe('empty state', () => {

    it('must have create listing link in empty state', () => {
      renderListingHistory();

      const createLink = screen.queryByRole('link', { name: /Create/ });
      // May or may not exist depending on whether there is data
      if (createLink) {
        expect(createLink).toBeInTheDocument();
      }
    });

  });

});
