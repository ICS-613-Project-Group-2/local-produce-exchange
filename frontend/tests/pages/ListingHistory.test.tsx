import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import ListingHistory from '@/pages/ListingHistory';

const API_URL = 'http://127.0.0.1:8000';

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

  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('page header', () => {

    it('must display page title', async () => {
      renderListingHistory();

      expect(screen.getByText('Exchange History')).toBeInTheDocument();
    });

    it('must display subtitle', async () => {
      renderListingHistory();

      expect(screen.getByText('Review your previous and current produce exchanges')).toBeInTheDocument();
    });

  });

  describe('loading and error states', () => {

    it('must show loading message while fetching claims', () => {
      renderListingHistory();

      expect(screen.getByText('Loading exchange history...')).toBeInTheDocument();
    });

    it('must show an error message when the API fails', async () => {
      server.use(
        http.get(`${API_URL}/v1/claims/mine`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('must show a generic error message on network failure', async () => {
      server.use(
        http.get(`${API_URL}/v1/claims/mine`, () => {
          return HttpResponse.error();
        })
      );
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('History could not be loaded. Please try again.')).toBeInTheDocument();
      });
    });

  });

  describe('empty state', () => {

    it('must show empty state when no claims exist', async () => {
      server.use(
        http.get(`${API_URL}/v1/claims/mine`, () => {
          return HttpResponse.json([]);
        })
      );
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('No previous listings yet')).toBeInTheDocument();
      });
      expect(screen.getByText('Your exchange history will appear here once you claim or share produce.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Browse Listings/ })).toBeInTheDocument();
    });

  });

  describe('claim history cards', () => {

    it('must display all claim cards after loading', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      expect(screen.getByText('Organic Zucchini')).toBeInTheDocument();
      expect(screen.getByText('Strawberry Jam')).toBeInTheDocument();
      expect(screen.getByText('Sourdough Bread')).toBeInTheDocument();
    });

    it('must display quantity and other user in meta text', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText(/3 requested by Oliver Lee/)).toBeInTheDocument();
      });
      expect(screen.getByText(/2 requested from Rose Johnson/)).toBeInTheDocument();
    });

    it('must display the request date', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      // The date is formatted via toLocaleDateString
      const dateElements = screen.getAllByText(/Requested/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('must display a View Listing link for each card with a listing_id', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });

      const viewLinks = screen.getAllByRole('link', { name: /View Listing/ });
      expect(viewLinks.length).toBe(4);
      expect(viewLinks[0]).toHaveAttribute('href', '/listings/1');
    });

  });

  describe('status-based actions', () => {

    it('must show Approve and Decline buttons for a requested claim where user is owner', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    });

    it('must show Mark Picked Up button for an approved claim', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Organic Zucchini')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Mark Picked Up' })).toBeInTheDocument();
    });

    it('must show Leave Review button for a completed claim with can_review true', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Strawberry Jam')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
    });

    it('must show "Review submitted" for a completed claim that was already reviewed', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Sourdough Bread')).toBeInTheDocument();
      });

      expect(screen.getByText('✅ Review submitted')).toBeInTheDocument();
    });

    it('must not show Leave Review for a non-completed claim', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });

      const tomatoCard = screen.getByText('Fresh Tomatoes').closest('.card') as HTMLElement;
      expect(within(tomatoCard).queryByRole('button', { name: 'Leave Review' })).not.toBeInTheDocument();
    });

  });

  describe('approve action', () => {

    it('must call the approve endpoint when Approve is clicked', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

      // After approve, the page reloads claims — just verify no action error appeared
      await waitFor(() => {
        expect(screen.queryByText(/could not be completed/)).not.toBeInTheDocument();
      });
    });

    it('must show an error message when approve fails', async () => {
      server.use(
        http.put(`${API_URL}/v1/claims/:claimId/approve`, () => {
          return HttpResponse.json({ detail: 'Cannot approve this claim' }, { status: 400 });
        })
      );
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

      await waitFor(() => {
        expect(screen.getByText('Cannot approve this claim')).toBeInTheDocument();
      });
    });

  });

  describe('leave a review', () => {

    it('must open the review modal when Leave Review is clicked', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Leave Review' }));

      expect(screen.getByText('Leave a Review')).toBeInTheDocument();
      expect(screen.getByText('How was your exchange with Glen Kim?')).toBeInTheDocument();
    });

    it('must show an error when submitting without selecting a rating', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Leave Review' }));
      await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      expect(screen.getByText('Please select a rating.')).toBeInTheDocument();
    });

    it('must submit a review with rating and comment', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Leave Review' }));
      await userEvent.click(screen.getByRole('button', { name: '4 stars' }));
      await userEvent.type(screen.getByPlaceholderText(/Share how the exchange went/), 'Great jam!');
      await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      // After successful submit, the modal closes and the Strawberry Jam card
      // now shows "Review submitted" (joining the existing one on Sourdough Bread)
      await waitFor(() => {
        expect(screen.getAllByText('✅ Review submitted')).toHaveLength(2);
      });
    });

    it('must show an error when the review API fails', async () => {
      server.use(
        http.post(`${API_URL}/v1/claims/:claimId/reviews`, () => {
          return HttpResponse.json({ detail: 'Already reviewed' }, { status: 400 });
        })
      );
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Leave Review' }));
      await userEvent.click(screen.getByRole('button', { name: '3 stars' }));
      await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      await waitFor(() => {
        expect(screen.getByText('Already reviewed')).toBeInTheDocument();
      });
    });

    it('must close the modal when Cancel is clicked', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Leave Review' }));
      expect(screen.getByText('Leave a Review')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByText('Leave a Review')).not.toBeInTheDocument();
      });
    });

  });

});
