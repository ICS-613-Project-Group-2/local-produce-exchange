import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ListingDetails from '@/pages/ListingDetails';

// CURRENT_USER_ID = 1 (Lily Chen) in the component.
// listing 1 (Fresh Tomatoes) — owned by user 1, has 1 pending claim (from user 2)
// listing 2 (Organic Zucchini) — owned by user 1, 0 claims
// listing 3 (Sourdough Bread) — owned by user 3, available, non-owner + active
// listing 5 (Canned Vegetables) — owned by user 4, available, qty 12 cans — used for claim form tests
// listing 6 (Meyer Lemons) — owned by user 3, status "reserved" — non-owner + inactive
// listing 7 (Strawberry Jam) — owned by user 1, status "completed", has 1 completed claim (user 4)
function renderListingDetails(listingId: number | string) {
  return render(
    <MemoryRouter initialEntries={[`/listings/${listingId}`]}>
      <Routes>
        <Route path="/listings/:id" element={<ListingDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ListingDetails', () => {                                       // Test Suite

  beforeEach(() => {                                                     // Test Fixture (setup)
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {                                                      // Test Fixture (teardown)
    vi.restoreAllMocks();
  });

  it('must show "Listing Not Found" for a nonexistent listing id', () => {  // Test Case
    renderListingDetails(999);

    expect(screen.getByText('Listing Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Browse' })).toHaveAttribute('href', '/browse');
  });

  describe('basic listing info', () => {                                // Nested Test Suite

    it('must render the listing name, category, and quantity', () => {  // Test Case
      renderListingDetails(3);

      // The listing name also appears as plain text in the breadcrumb's last crumb —
      // target the h1 specifically rather than matching on text alone.
      expect(
        screen.getByRole('heading', { name: 'Sourdough Bread Loaves', level: 1 })
      ).toBeInTheDocument();
      expect(screen.getByText('Baked Goods')).toBeInTheDocument();
      expect(screen.getByText('3 loaves available')).toBeInTheDocument();
    });

    it('must render breadcrumb links to Browse and the community', () => {
      renderListingDetails(3);

      // The community name is linked in two places on this page (breadcrumb + the
      // "🏘️ Community" section below) — scope to the nav to target the breadcrumb one.
      const breadcrumb = within(screen.getByRole('navigation'));
      expect(breadcrumb.getByRole('link', { name: 'Browse' })).toHaveAttribute('href', '/browse');
      expect(breadcrumb.getByRole('link', { name: 'UH Mānoa Food Exchange' })).toHaveAttribute(
        'href',
        '/communities/2'
      );
    });

    it('must render the description and pickup location', () => {
      renderListingDetails(3);

      expect(screen.getByText(/Baked fresh this morning/)).toBeInTheDocument();
      expect(screen.getByText(/Campus Center, Room 104/)).toBeInTheDocument();
    });

    it('must show either an "Expires in" or "Expired" freshness message', () => {
      // Not asserting an exact day count — mock expiration dates are fixed and will
      // drift into the past over time relative to whenever this test actually runs.
      renderListingDetails(3);

      expect(screen.getByText(/Expires in \d+ days?|❌ Expired/)).toBeInTheDocument();
    });

    it('must render the owner\'s display name', () => {
      renderListingDetails(3);

      expect(screen.getByText('Rose J.')).toBeInTheDocument();
    });

  });

  describe('non-owner, active listing', () => {                         // Nested Test Suite

    it('must show a Message Owner button and no Edit Listing link', () => {  // Test Case
      renderListingDetails(3); // owned by user 3, not user 1

      expect(screen.getByRole('button', { name: 'Message Owner' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Edit Listing' })).not.toBeInTheDocument();
    });

    it('must show the claim request form', () => {
      renderListingDetails(5); // owned by user 4, status "available"

      expect(screen.getByText('Request This Item')).toBeInTheDocument();
      expect(screen.getByLabelText(/^Quantity \(cans\)/)).toBeInTheDocument();
    });

    it('must show an error when submitting an empty quantity', async () => {
      renderListingDetails(5);

      await userEvent.click(screen.getByRole('button', { name: 'Submit Claim Request' }));

      expect(screen.getByText('Please enter a valid quantity.')).toBeInTheDocument();
    });

    it('must show an error when the requested quantity exceeds what is available', async () => {
      renderListingDetails(5); // quantity: 12 cans, input has max="12"

      // The input's max="12" matches this exact business rule, so typing a value over
      // 12 and clicking Submit gets blocked by the browser's own native HTML5 range
      // validation before React's onSubmit ever runs — meaning this custom error
      // message is not actually reachable through normal user interaction in a
      // spec-compliant browser. Bypassing via a direct form submit to still verify
      // the underlying validation logic itself behaves correctly.
      await userEvent.type(screen.getByLabelText(/^Quantity \(cans\)/), '999');
      const form = screen.getByRole('button', { name: 'Submit Claim Request' }).closest('form')!;
      fireEvent.submit(form);

      expect(
        screen.getByText('Quantity exceeds available amount (12 cans).')
      ).toBeInTheDocument();
    });

    it('must show a success message and a link to Messages after a valid claim', async () => {
      renderListingDetails(5);

      await userEvent.type(screen.getByLabelText(/^Quantity \(cans\)/), '5');
      await userEvent.click(screen.getByRole('button', { name: 'Submit Claim Request' }));

      expect(screen.getByText(/Claim request submitted!/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to Messages' })).toHaveAttribute(
        'href',
        '/messages'
      );
      expect(screen.queryByText('Request This Item')).not.toBeInTheDocument();
    });

  });

  describe('non-owner, inactive listing', () => {                       // Nested Test Suite

    it('must show an inactive message instead of the claim form', () => {  // Test Case
      renderListingDetails(6); // status: "reserved", owned by user 3

      expect(
        screen.getByText('This listing is no longer active and cannot accept new claims.')
      ).toBeInTheDocument();
      expect(screen.queryByText('Request This Item')).not.toBeInTheDocument();
    });

    it('must not show a Message Owner button', () => {
      renderListingDetails(6);

      expect(screen.queryByRole('button', { name: 'Message Owner' })).not.toBeInTheDocument();
    });

    it('must still show the owner card', () => {
      renderListingDetails(6);

      expect(screen.getByText('Rose J.')).toBeInTheDocument();
    });

  });

  describe('owner view', () => {                                        // Nested Test Suite

    it('must show an Edit Listing link and no claim form or Message Owner button', () => {  // Test Case
      renderListingDetails(1); // owned by user 1

      expect(screen.getByRole('link', { name: 'Edit Listing' })).toHaveAttribute(
        'href',
        '/listings/1/edit'
      );
      expect(screen.queryByText('Request This Item')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Message Owner' })).not.toBeInTheDocument();
    });

    it('must show the claim requests summary when claims exist', () => {
      renderListingDetails(1); // has 1 pending claim from user 2

      expect(screen.getByText('Claim Requests')).toBeInTheDocument();
      expect(screen.getByText('Oliver L.')).toBeInTheDocument();
      expect(screen.getByText('3 lbs')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('must not show a claim requests summary when there are no claims', () => {
      renderListingDetails(2); // owned by user 1, 0 claims

      expect(screen.queryByText('Claim Requests')).not.toBeInTheDocument();
    });

    it('must show the claims summary and Edit Listing link even for a completed listing', () => {
      renderListingDetails(7); // owned by user 1, status "completed", 1 completed claim

      expect(screen.getByRole('link', { name: 'Edit Listing' })).toBeInTheDocument();
      expect(screen.getByText('Claim Requests')).toBeInTheDocument();
      expect(screen.getByText('Glen K.')).toBeInTheDocument();
      expect(screen.getByText('2 jars')).toBeInTheDocument();

      // Listing 7's own status badge is *also* "Completed" — scope to the claim row
      // itself rather than querying the whole page for that text.
      const claimRow = screen.getByText('Glen K.').closest('.listing-details__claim-item')!;
      expect(within(claimRow).getByText('Completed')).toBeInTheDocument();

      expect(
        screen.queryByText('This listing is no longer active and cannot accept new claims.')
      ).not.toBeInTheDocument();
    });

  });

  describe('share and report actions', () => {                         // Nested Test Suite

    it('must alert a share confirmation when Share is clicked', async () => {  // Test Case
      renderListingDetails(3);

      await userEvent.click(screen.getByRole('button', { name: 'Share' }));

      expect(window.alert).toHaveBeenCalledWith('Share link copied!');
    });

    it('must alert a report confirmation when Report is clicked', async () => {
      renderListingDetails(3);

      await userEvent.click(screen.getByRole('button', { name: 'Report' }));

      expect(window.alert).toHaveBeenCalledWith('Report submitted.');
    });

  });

  describe('related listings', () => {                                  // Nested Test Suite

    it('must show other active listings from the same community, excluding itself and closed/completed ones', () => {  // Test Case
      renderListingDetails(1); // community 1: listing 2 (expiring-soon) and 6 (reserved) qualify; 7 is completed, excluded

      expect(screen.getByText('More from Mānoa Valley Garden Share')).toBeInTheDocument();
      expect(screen.getByText('Organic Zucchini')).toBeInTheDocument();
      expect(screen.getByText('Meyer Lemons')).toBeInTheDocument();
    });

    it('must link each related listing to its own details page', () => {
      renderListingDetails(1);

      const viewLinks = screen.getAllByRole('link', { name: 'View' });
      const hrefs = viewLinks.map((link) => link.getAttribute('href'));
      expect(hrefs).toContain('/listings/2');
      expect(hrefs).toContain('/listings/6');
    });

  });

});