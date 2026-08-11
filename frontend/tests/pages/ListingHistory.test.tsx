import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import ListingHistory from '@/pages/ListingHistory';

const API_URL = 'http://127.0.0.1:8000';

function renderListingHistory() {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <AuthProvider>
        <Routes>
          <Route path="/history" element={<ListingHistory />} />
          <Route path="/listings/:id" element={<div>Listing Page</div>} />
          <Route path="/browse" element={<div>Browse Page</div>} />
        </Routes>
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

  describe('loading and display', () => {
    it('shows loading state initially', () => {
      renderListingHistory();
      expect(screen.getByText('Loading history...')).toBeInTheDocument();
    });

    it('displays the page title', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Exchange History')).toBeInTheDocument();
      });
    });

    it('shows claim cards with listing names', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      expect(screen.getByText('Organic Zucchini')).toBeInTheDocument();
      expect(screen.getByText('Strawberry Jam')).toBeInTheDocument();
      expect(screen.getByText('Sourdough Bread')).toBeInTheDocument();
    });

    it('shows other user names on claim cards', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText(/Oliver Lee/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Rose Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/Glen Kim/)).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('shows Approve and Decline buttons for requested claims where user is owner', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    });

    it('shows Mark Picked Up for approved claims', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Mark Picked Up' })).toBeInTheDocument();
      });
    });

    it('shows Leave Review button for completed claims with can_review=true', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Leave Review' })).toBeInTheDocument();
      });
    });

    it('shows Review submitted badge for already_reviewed claims', async () => {
      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText(/Review submitted/)).toBeInTheDocument();
      });
    });
  });

  describe('actions call API', () => {
    it('approve button calls the approve API', async () => {
      let approveCalled = false;
      server.use(
        http.put(`${API_URL}/v1/claims/:claimId/approve`, () => {
          approveCalled = true;
          return HttpResponse.json({ request_id: 1, status: 'approved' });
        })
      );

      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

      await waitFor(() => {
        expect(approveCalled).toBe(true);
      });
    });
  });

  describe('empty state', () => {
    it('shows empty state when no claims exist', async () => {
      server.use(
        http.get(`${API_URL}/v1/claims/mine`, () => {
          return HttpResponse.json([]);
        })
      );

      renderListingHistory();

      await waitFor(() => {
        expect(screen.getByText(/No previous listings yet/)).toBeInTheDocument();
      });
    });
  });
});
