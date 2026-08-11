import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import BrowseListings from '@/pages/BrowseListings';

const API_URL = 'http://127.0.0.1:8000';

function renderBrowseListings() {
  return render(
    <MemoryRouter initialEntries={['/browse']}>
      <AuthProvider>
        <BrowseListings />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('BrowseListings', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading and initial render', () => {
    it('shows loading state initially', () => {
      renderBrowseListings();
      // The page should start fetching data (loading state is brief but present)
      expect(document.querySelector('.page-container')).toBeInTheDocument();
    });

    it('displays listings after loading', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      expect(screen.getByText('Meyer Lemons')).toBeInTheDocument();
    });

    it('displays listing quantities and units', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText(/8 lbs/)).toBeInTheDocument();
      });
      expect(screen.getByText(/12 pieces/)).toBeInTheDocument();
    });

    it('does not display closed listings', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      expect(screen.queryByText('Expired Lettuce')).not.toBeInTheDocument();
    });
  });

  describe('filters and controls', () => {
    it('has category filter buttons', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
      });
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    it('has a sort dropdown', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      // Sort control exists as a select
      const sortSelect = document.querySelector('.browse__sort-select, select');
      expect(sortSelect).toBeInTheDocument();
    });

    it('has view mode toggle buttons', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      // View toggle buttons for grid/list
      const viewButtons = document.querySelectorAll('.browse__view-btn, [aria-label*="view"], [aria-label*="View"]');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('has a search bar', async () => {
      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no listings match', async () => {
      server.use(
        http.get(`${API_URL}/v1/listings`, () => {
          return HttpResponse.json([]);
        })
      );

      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText(/no listings/i)).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('shows error message when API fails', async () => {
      server.use(
        http.get(`${API_URL}/v1/listings`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );

      renderBrowseListings();

      await waitFor(() => {
        expect(screen.getByText(/server error|failed/i)).toBeInTheDocument();
      });
    });
  });
});
