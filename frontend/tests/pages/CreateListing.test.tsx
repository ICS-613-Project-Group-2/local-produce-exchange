import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CreateListing from '@/pages/CreateListing';

function renderCreateListing() {
  return render(
    <MemoryRouter>
      <CreateListing />
    </MemoryRouter>
  );
}

// Fills step 0 (Details) with valid values
async function fillDetailsStep() {
  await userEvent.type(screen.getByLabelText(/^Produce Name/), 'Fresh Tomatoes');
  await userEvent.click(screen.getByRole('button', { name: /Vegetables/ }));
  await userEvent.type(screen.getByLabelText(/^Quantity/), '5');
  await userEvent.type(screen.getByLabelText(/^Unit/), 'lbs');
  await userEvent.type(screen.getByLabelText(/^Description/), 'Fresh off the vine, ripe and ready.');
}

// Fills step 1 (Freshness & Pickup) with valid values
function fillFreshnessStep() {
  fireEvent.change(screen.getByLabelText(/^Expiration Date/), {
    target: { value: '2026-12-31' },
  });
  return userEvent.type(screen.getByLabelText(/^Pickup Location/), '2845 Oahu Ave, front porch');
}

// Uploads a fake photo on step 2
async function fillPhotoStep() {
  const file = new File(['fake-image-content'], 'tomato.png', { type: 'image/png' });
  const fileInput = screen.getByLabelText(/upload a photo/i);
  await userEvent.upload(fileInput, file);
}

// Selects the first real community option on step 3
async function fillCommunityStep() {
  const select = screen.getByLabelText(/^Post to Community/) as HTMLSelectElement;
  const options = Array.from(select.querySelectorAll('option')).filter((o) => o.value !== '');
  await userEvent.selectOptions(select, options[0].value);
}

// Navigates through all 4 steps filling valid data, ending back on the last step
async function fillEntireForm() {
  await fillDetailsStep();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await fillFreshnessStep();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await fillPhotoStep();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await fillCommunityStep();
}

describe('CreateListing', () => {                                        // Test Suite

  beforeEach(() => {                                                     // Test Fixture (setup)
    // jsdom doesn't implement these — required for photo upload/preview
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {                                                      // Test Fixture (teardown)
    vi.restoreAllMocks();
  });

  describe('step navigation', () => {                                   // Nested Test Suite

    it('must render all 4 step labels with the first step active', () => {  // Test Case
      renderCreateListing();

      expect(screen.getByText('Details')).toBeInTheDocument();
      expect(screen.getByText('Freshness & Pickup')).toBeInTheDocument();
      expect(screen.getByText('Photo')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Item Details')).toBeInTheDocument();
    });

    it('must not show a Back button on the first step', () => {
      renderCreateListing();

      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    });

    it('must advance to the next step when Next is clicked', async () => {
      renderCreateListing();

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByText('Freshness & Pickup', { selector: 'h2' })).toBeInTheDocument();
    });

    it('must go back to the previous step when Back is clicked', async () => {
      renderCreateListing();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      await userEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.getByText('Item Details')).toBeInTheDocument();
    });

    it('must jump directly to a step when its step indicator is clicked', async () => {
      renderCreateListing();

      await userEvent.click(screen.getByRole('button', { name: /Photo/ }));

      expect(screen.getByText('Photo', { selector: 'h2' })).toBeInTheDocument();
    });

    it('must show Preview and Publish Listing buttons only on the last step', async () => {
      renderCreateListing();
      expect(screen.queryByRole('button', { name: 'Preview' })).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Community/ }));

      expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Publish Listing' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    });

  });

  describe('details step', () => {                                      // Nested Test Suite

    it('must update the character count as the description is typed', async () => {  // Test Case
      renderCreateListing();

      await userEvent.type(screen.getByLabelText(/^Description/), 'Fresh');

      expect(screen.getByText('5 characters')).toBeInTheDocument();
    });

    it('must highlight a category button when selected', async () => {
      renderCreateListing();

      const categoryButton = screen.getByRole('button', { name: /Vegetables/ });
      await userEvent.click(categoryButton);

      expect(categoryButton).toHaveClass('create-listing__category-btn--active');
    });

  });

  describe('photo step', () => {                                        // Nested Test Suite

    it('must show an upload prompt when no photo is selected', async () => {  // Test Case
      renderCreateListing();

      await userEvent.click(screen.getByRole('button', { name: /Photo/ }));

      expect(screen.getByText(/Click or drag to upload a photo/)).toBeInTheDocument();
    });

    it('must show a preview image after uploading a photo', async () => {
      renderCreateListing();
      await userEvent.click(screen.getByRole('button', { name: /Photo/ }));

      await fillPhotoStep();

      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    it('must remove the photo and show the upload prompt again when Remove is clicked', async () => {
      renderCreateListing();
      await userEvent.click(screen.getByRole('button', { name: /Photo/ }));
      await fillPhotoStep();

      await userEvent.click(screen.getByRole('button', { name: /Remove/ }));

      expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
      expect(screen.getByText(/Click or drag to upload a photo/)).toBeInTheDocument();
    });

  });

  describe('community step', () => {                                    // Nested Test Suite

    it('must render a community dropdown with a placeholder option', async () => {  // Test Case
      renderCreateListing();

      await userEvent.click(screen.getByRole('button', { name: /Community/ }));

      expect(screen.getByText('Select a community')).toBeInTheDocument();
    });

  });

  describe('validation on submit', () => {                              // Nested Test Suite

    it('must show all step-1 errors and jump back to step 1 when submitting an empty form', async () => {  // Test Case
      renderCreateListing();
      await userEvent.click(screen.getByRole('button', { name: /Community/ }));

      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));

      expect(screen.getByText('Item Details')).toBeInTheDocument();
      expect(screen.getByText('Produce name is required.')).toBeInTheDocument();
      expect(screen.getByText('Category is required.')).toBeInTheDocument();
      expect(screen.getByText('Quantity must be greater than zero.')).toBeInTheDocument();
      expect(screen.getByText('Unit is required (e.g., lbs, pieces, bunches).')).toBeInTheDocument();
      expect(screen.getByText('Description is required.')).toBeInTheDocument();
    });

    it('must jump to step 2 when only freshness/pickup fields are missing', async () => {
      renderCreateListing();
      await fillDetailsStep();
      await userEvent.click(screen.getByRole('button', { name: /Community/ }));

      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));

      expect(screen.getByText('Freshness & Pickup', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Expiration date is required.')).toBeInTheDocument();
      expect(screen.getByText('Pickup location is required.')).toBeInTheDocument();
    });

    it('must jump to step 3 when only the photo is missing', async () => {
      renderCreateListing();
      await fillDetailsStep();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await fillFreshnessStep();
      await userEvent.click(screen.getByRole('button', { name: /Community/ }));

      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));

      expect(screen.getByText('Photo', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Please upload a photo.')).toBeInTheDocument();
    });

    it('must clear a field error once the user fixes that field', async () => {
      renderCreateListing();
      await userEvent.click(screen.getByRole('button', { name: /Community/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));
      expect(screen.getByText('Produce name is required.')).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/^Produce Name/), 'T');

      expect(screen.queryByText('Produce name is required.')).not.toBeInTheDocument();
    });

  });

  describe('preview', () => {                                           // Nested Test Suite

    it('must show entered data on the preview screen', async () => {    // Test Case
      renderCreateListing();
      await fillEntireForm();

      await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

      expect(screen.getByText('Preview Listing')).toBeInTheDocument();
      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      expect(screen.getByText(/5 lbs · Vegetables/)).toBeInTheDocument();
      expect(screen.getByText('2845 Oahu Ave, front porch', { exact: false })).toBeInTheDocument();
    });

    it('must return to the edit form when Back to Edit is clicked', async () => {
      renderCreateListing();
      await fillEntireForm();
      await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

      await userEvent.click(screen.getByRole('button', { name: 'Back to Edit' }));

      expect(screen.getByText('Community', { selector: 'h2' })).toBeInTheDocument();
    });

    it('must publish the listing from the preview screen', async () => {
      renderCreateListing();
      await fillEntireForm();
      await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));

      expect(screen.getByText('Listing Published! 🎉')).toBeInTheDocument();
    });

  });

  describe('successful submission', () => {                             // Nested Test Suite

    it('must show the success screen with the listing name after publishing directly', async () => {  // Test Case
      renderCreateListing();
      await fillEntireForm();

      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));

      expect(screen.getByText('Listing Published! 🎉')).toBeInTheDocument();
      expect(
        screen.getByText('Your listing "Fresh Tomatoes" has been posted to your community.')
      ).toBeInTheDocument();
    });

    it('must show links to browse listings and the dashboard after publishing', async () => {
      renderCreateListing();
      await fillEntireForm();
      await userEvent.click(screen.getByRole('button', { name: 'Publish Listing' }));

      expect(screen.getByRole('link', { name: 'View Listings' })).toHaveAttribute('href', '/browse');
      expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/dashboard');
    });

  });

  describe('page content', () => {                                      // Nested Test Suite

    it('must display the draft auto-saved note', () => {                // Test Case
      renderCreateListing();

      expect(screen.getByText('💾 Draft auto-saved locally')).toBeInTheDocument();
    });

  });

});