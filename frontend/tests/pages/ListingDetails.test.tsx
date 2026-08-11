import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import ListingDetails from '@/pages/ListingDetails';

const API_URL = 'http://127.0.0.1:8000';

function renderListingDetails(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/listings/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/listings/:id/edit" element={<div>Edit Page</div>} />
          <Route path="/browse" element={<div>Browse Page</div>} />
          <Route path="/messages" element={<div>Messages Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ListingDetails', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading and display', () => {
    it('shows loading state initially', () => {
      renderListingDetails();
      expect(screen.getByText('Loading listing...')).toBeInTheDocument();
    });

    it('displays listing name after loading', async () => {
      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Fresh Tomatoes' })).toBeInTheDocument();
      });
    });

    it('displays listing description', async () => {
      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByText('Vine-ripened tomatoes from the garden.')).toBeInTheDocument();
      });
    });

    it('displays quantity and unit', async () => {
      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByText(/8 lbs available/)).toBeInTheDocument();
      });
    });

    it('displays category', async () => {
      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByText('vegetables')).toBeInTheDocument();
      });
    });

    it('displays pickup location', async () => {
      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByText(/123 Main St, front porch/)).toBeInTheDocument();
      });
    });
  });

  describe('owner view (user_id=1 owns listing_id=1)', () => {
    it('shows Edit Listing button for listing owner', async () => {
      renderListingDetails('1');

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Edit Listing/ })).toBeInTheDocument();
      });
    });

    it('does not show claim form for owner', async () => {
      renderListingDetails('1');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Fresh Tomatoes' })).toBeInTheDocument();
      });
      expect(screen.queryByText('Request This Item')).not.toBeInTheDocument();
    });

    it('shows claim requests section for owner', async () => {
      renderListingDetails('1');

      await waitFor(() => {
        expect(screen.getByText('Claim Requests')).toBeInTheDocument();
      });
    });
  });

  describe('non-owner view (user_id=1 does NOT own listing_id=2)', () => {
    it('shows claim form for non-owners', async () => {
      renderListingDetails('2');

      await waitFor(() => {
        expect(screen.getByText('Request This Item')).toBeInTheDocument();
      });
    });

    it('does not show Edit button for non-owners', async () => {
      renderListingDetails('2');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Meyer Lemons' })).toBeInTheDocument();
      });
      expect(screen.queryByRole('link', { name: /Edit Listing/ })).not.toBeInTheDocument();
    });

    it('allows submitting a claim', async () => {
      renderListingDetails('2');

      await waitFor(() => {
        expect(screen.getByText('Request This Item')).toBeInTheDocument();
      });

      const qtyInput = screen.getByLabelText(/Quantity/);
      await userEvent.type(qtyInput, '5');
      await userEvent.click(screen.getByRole('button', { name: /Submit Claim Request/ }));

      await waitFor(() => {
        expect(screen.getByText(/Claim request submitted/)).toBeInTheDocument();
      });
    });
  });

  describe('not found', () => {
    it('shows not-found for invalid listing ID', async () => {
      server.use(
        http.get(`${API_URL}/v1/listings/:id`, () => {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        })
      );

      renderListingDetails('999');

      await waitFor(() => {
        expect(screen.getByText('Listing Not Found')).toBeInTheDocument();
      });
    });
  });
});
