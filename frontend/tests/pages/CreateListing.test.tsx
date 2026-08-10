import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '@/context/AuthContext';
import { setToken, clearToken } from '@/lib/api';
import CreateListing from '@/pages/CreateListing';

const API_URL = 'http://127.0.0.1:8000';

function renderCreateListing() {
  return render(
    <MemoryRouter initialEntries={['/listings/new']}>
      <AuthProvider>
        <Routes>
          <Route path="/listings/new" element={<CreateListing />} />
          <Route path="/listings/:id" element={<div>Listing Details Page</div>} />
          <Route path="/browse" element={<div>Browse Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('CreateListing', () => {
  beforeEach(() => {
    setToken('fake-jwt-token');
  });

  afterEach(() => {
    clearToken();
  });

  describe('step indicator', () => {
    it('shows step indicator with all steps', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument();
      });
      expect(screen.getByText('Freshness & Pickup')).toBeInTheDocument();
      expect(screen.getByText('Photo')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
    });

    it('starts on the first step (Details)', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByText('Item Details')).toBeInTheDocument();
      });
      expect(screen.getByLabelText(/Produce Name/)).toBeInTheDocument();
    });
  });

  describe('step navigation', () => {
    it('can navigate to next step', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // Step 2 section heading appears
      expect(screen.getByRole('heading', { name: 'Freshness & Pickup' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Expiration Date/)).toBeInTheDocument();
    });

    it('can navigate back to previous step', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.getByLabelText(/Produce Name/)).toBeInTheDocument();
    });

    it('shows Publish button on the last step', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      });

      // Navigate to step 4 (Community)
      await userEvent.click(screen.getByRole('button', { name: 'Next' })); // -> step 2
      await userEvent.click(screen.getByRole('button', { name: 'Next' })); // -> step 3
      await userEvent.click(screen.getByRole('button', { name: 'Next' })); // -> step 4

      expect(screen.getByRole('button', { name: /Publish Listing/ })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows validation errors on empty submit at last step', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      });

      // Navigate to last step
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // Submit without filling anything
      await userEvent.click(screen.getByRole('button', { name: /Publish Listing/ }));

      // Should show error and redirect to step 1
      await waitFor(() => {
        expect(screen.getByText('Produce name is required.')).toBeInTheDocument();
      });
    });
  });

  describe('community dropdown', () => {
    it('populates community dropdown from API', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      });

      // Navigate to community step (step 4)
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(screen.getByText(/Manoa Garden Share/)).toBeInTheDocument();
      });
    });
  });

  describe('successful submission', () => {
    it('shows success screen after valid submission', async () => {
      renderCreateListing();

      await waitFor(() => {
        expect(screen.getByLabelText(/Produce Name/)).toBeInTheDocument();
      });

      // Fill step 1
      await userEvent.type(screen.getByLabelText(/Produce Name/), 'Test Tomatoes');
      // Select category
      const categoryButtons = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('Fruits'));
      if (categoryButtons.length > 0) await userEvent.click(categoryButtons[0]);
      await userEvent.type(screen.getByLabelText(/Quantity/), '5');
      await userEvent.type(screen.getByLabelText(/Unit/), 'lbs');
      await userEvent.type(screen.getByLabelText(/Description/), 'Delicious tomatoes');

      // Go to step 2
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await userEvent.type(screen.getByLabelText(/Expiration Date/), '2026-12-31');
      await userEvent.type(screen.getByLabelText(/Pickup Location/), '123 Test St');

      // Go to step 3 (photo - skip)
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // Go to step 4 (community)
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // Select community
      await waitFor(() => {
        expect(screen.getByText(/Manoa Garden Share/)).toBeInTheDocument();
      });
      const communitySelect = screen.getByLabelText(/Post to Community/);
      await userEvent.selectOptions(communitySelect, '1');

      // Submit
      await userEvent.click(screen.getByRole('button', { name: /Publish Listing/ }));

      await waitFor(() => {
        expect(screen.getByText(/Listing Published/)).toBeInTheDocument();
      });
    });
  });
});
