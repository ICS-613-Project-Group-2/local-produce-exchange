import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import EditListing from '@/pages/EditListing';

const API_URL = 'http://127.0.0.1:8000';

function renderEditListing(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/listings/${id}/edit`]}>
      <AuthProvider>
        <Routes>
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/listings/:id" element={<div>Listing Details</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('EditListing', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('loading and data population', () => {
    it('shows loading state initially', () => {
      renderEditListing();
      expect(screen.getByText('Loading listing...')).toBeInTheDocument();
    });

    it('populates form with listing data after loading', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      expect(screen.getByDisplayValue('lbs')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Vine-ripened tomatoes from the garden.')).toBeInTheDocument();
    });

    it('shows the page header with listing name', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByText(/Managing: Fresh Tomatoes/)).toBeInTheDocument();
      });
    });
  });

  describe('not found state', () => {
    it('shows not found for invalid listing ID', async () => {
      server.use(
        http.get(`${API_URL}/v1/listings/:id`, () => {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        })
      );

      renderEditListing('999');

      await waitFor(() => {
        expect(screen.getByText('Listing Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('form editing', () => {
    it('allows editing the produce name', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Fresh Tomatoes');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Organic Tomatoes');

      expect(screen.getByDisplayValue('Organic Tomatoes')).toBeInTheDocument();
    });

    it('has a status dropdown with options', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      const statusSelect = screen.getByDisplayValue('Available');
      expect(statusSelect).toBeInTheDocument();
      expect(statusSelect.querySelectorAll('option').length).toBe(3);
    });
  });

  describe('save functionality', () => {
    it('shows success message after saving', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      await waitFor(() => {
        expect(screen.getByText(/Listing updated successfully/)).toBeInTheDocument();
      });
    });

    it('shows validation error when name is empty', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Fresh Tomatoes');
      await userEvent.clear(nameInput);
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      expect(screen.getByText('Produce name is required.')).toBeInTheDocument();
    });
  });

  describe('delete functionality', () => {
    it('has a delete button in the danger zone', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Delete Listing/ })).toBeInTheDocument();
    });

    it('opens confirmation modal on delete click', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete Listing/ }));

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      });
    });

    it('deletes the listing when confirmed in modal', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Fresh Tomatoes')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete Listing/ }));

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      });

      // Click the delete button inside the modal
      const modalButtons = screen.getAllByRole('button', { name: /Delete Listing/ });
      const confirmButton = modalButtons[modalButtons.length - 1];
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('claims summary', () => {
    it('shows claim requests summary when claims exist', async () => {
      renderEditListing();

      await waitFor(() => {
        expect(screen.getByText('Claim Requests')).toBeInTheDocument();
      });
    });
  });
});
