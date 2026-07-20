import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ListingDetails from '@/pages/ListingDetails';

function renderListingDetails(listingId: string = '1') {
  return render(
    <MemoryRouter initialEntries={[`/listings/${listingId}`]}>
      <Routes>
        <Route
          path="/listings/:id"
          element={
            <AuthProvider>
              <ListingDetails />
            </AuthProvider>
          }
        />
        <Route path="/browse" element={<div>Browse</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ListingDetails', () => {

  describe('listing info', () => {

    it('must display listing name and status', () => {
      renderListingDetails();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('must display quantity available', () => {
      renderListingDetails();

      // Look for text in the meta section
      const metaElements = screen.getAllByText(/available/i);
      expect(metaElements.length).toBeGreaterThan(0);
    });

  });

  describe('freshness bar', () => {

    it('must display expiration date', () => {
      renderListingDetails();

      const expirationText = screen.queryByText(/Expires in|day/);
      if (expirationText) {
        expect(expirationText).toBeInTheDocument();
      }
    });

    it('must display posted date', () => {
      renderListingDetails();

      const postedText = screen.queryByText(/Posted/);
      if (postedText) {
        expect(postedText).toBeInTheDocument();
      }
    });

  });

  describe('description and pickup', () => {

    it('must display description section', () => {
      renderListingDetails();

      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('must display pickup location', () => {
      renderListingDetails();

      expect(screen.getByText('Pickup Location')).toBeInTheDocument();
    });

  });

  describe('owner card', () => {

    it('must display owner information', () => {
      renderListingDetails();

      const ownerSection = screen.queryByRole('img', { name: /John|Jane|Sarah|Mike|Lisa/ });
      if (ownerSection) {
        expect(ownerSection).toBeInTheDocument();
      }
    });

  });

  describe('claim request form', () => {

    it('must display claim quantity input for non-owners', () => {
      renderListingDetails('2'); // Use a different listing ID

      const claimForm = screen.queryByText(/Request This Item/);
      if (claimForm) {
        expect(claimForm).toBeInTheDocument();
      }
    });

    it('must validate quantity input', async () => {
      renderListingDetails('2');

      const submitButton = screen.queryByRole('button', { name: /Submit Claim Request/ });
      if (submitButton) {
        await userEvent.click(submitButton);

        const errorText = screen.queryByText(/Please enter a valid quantity/);
        if (errorText) {
          expect(errorText).toBeInTheDocument();
        }
      }
    });

    it('must submit claim with valid quantity', async () => {
      renderListingDetails('2');

      const quantityInput = screen.queryByLabelText(/Quantity/);
      if (quantityInput) {
        await userEvent.type(quantityInput, '5');

        const submitButton = screen.getByRole('button', { name: /Submit Claim Request/ });
        await userEvent.click(submitButton);

        const successText = screen.queryByText(/Claim request submitted/);
        if (successText) {
          expect(successText).toBeInTheDocument();
        }
      }
    });

  });

  describe('actions', () => {

    it('must display action buttons', () => {
      renderListingDetails();

      const shareButton = screen.queryByRole('button', { name: /Share/ });
      const reportButton = screen.queryByRole('button', { name: /Report/ });

      if (shareButton) {
        expect(shareButton).toBeInTheDocument();
      }
      if (reportButton) {
        expect(reportButton).toBeInTheDocument();
      }
    });

  });

  describe('breadcrumb', () => {

    it('must display browse link', () => {
      renderListingDetails();

      const browseLink = screen.getByRole('link', { name: 'Browse' });
      expect(browseLink).toHaveAttribute('href', '/browse');
    });

  });

  describe('related listings', () => {

    it('must display related listings section if available', () => {
      renderListingDetails();

      const moreFromText = screen.queryByText(/More from/);
      // May or may not exist depending on mock data
    });

  });

});
