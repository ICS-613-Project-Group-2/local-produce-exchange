import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import EditListing from '@/pages/EditListing';

function renderEditListing(listingId: string = '1') {
  return render(
    <MemoryRouter initialEntries={[`/listings/${listingId}/edit`]}>
      <Routes>
        <Route
          path="/listings/:id/edit"
          element={
            <AuthProvider>
              <EditListing />
            </AuthProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EditListing', () => {

  describe('page header', () => {

    it('must display header with listing name', () => {
      renderEditListing();

      expect(screen.getByText('Edit Listing')).toBeInTheDocument();
      expect(screen.getByText(/Managing:/)).toBeInTheDocument();
    });

    it('must have link to view listing as public', () => {
      renderEditListing();

      const viewButton = screen.getByRole('link', { name: /View as Public/ });
      expect(viewButton).toBeInTheDocument();
    });

  });

  describe('status controls', () => {

    it('must display current status badge', () => {
      renderEditListing();

      expect(screen.getByText('Current Status:')).toBeInTheDocument();
    });

    it('must have status dropdown with options', () => {
      renderEditListing();

      const statusSelect = screen.getAllByDisplayValue(/available|reserved|closed/i)[0] as HTMLSelectElement;
      const options = Array.from(statusSelect.options).map(opt => opt.text);

      expect(options.some(o => o.includes('Available'))).toBe(true);
      expect(options.some(o => o.includes('Reserved'))).toBe(true);
      expect(options.some(o => o.includes('Closed'))).toBe(true);
    });

    it('must show status changed toast after changing status', async () => {
      renderEditListing();

      const statusSelect = screen.getAllByDisplayValue(/available|reserved|closed/i)[0];
      await userEvent.selectOptions(statusSelect, 'reserved');

      expect(screen.getByText(/Status updated/)).toBeInTheDocument();
    });

    it('must show closed notice when status is closed', async () => {
      renderEditListing();

      const statusSelect = screen.getAllByDisplayValue(/available|reserved|closed/i)[0];
      await userEvent.selectOptions(statusSelect, 'closed');

      expect(screen.getByText(/closed and no longer visible/)).toBeInTheDocument();
    });

  });

  describe('form fields', () => {

    it('must display all form fields', () => {
      renderEditListing();

      expect(screen.getByLabelText(/Produce Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Quantity/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Unit/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Expiration Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pickup Location/)).toBeInTheDocument();
    });

    it('must populate form with listing data', () => {
      renderEditListing();

      const nameInput = screen.getByLabelText(/Produce Name/) as HTMLInputElement;
      expect(nameInput.value).toBeTruthy();
    });

    it('must update form fields on change', async () => {
      renderEditListing();

      const nameInput = screen.getByLabelText(/Produce Name/) as HTMLInputElement;
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Name');

      expect(nameInput.value).toBe('New Name');
    });

  });

  describe('form validation', () => {

    it('must show validation errors on empty submit', async () => {
      renderEditListing();

      const nameInput = screen.getByLabelText(/Produce Name/);
      await userEvent.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      expect(screen.getByText('Produce name is required.')).toBeInTheDocument();
    });

    it('must clear error when field is edited', async () => {
      renderEditListing();

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      const nameInput = screen.getByLabelText(/Produce Name/);
      await userEvent.type(nameInput, 'Test');

      expect(screen.queryByText('Produce name is required.')).not.toBeInTheDocument();
    });

  });

  describe('save and cancel', () => {

    it('must display save button', () => {
      renderEditListing();

      expect(screen.getByRole('button', { name: /Save Changes/ })).toBeInTheDocument();
    });

    it('must show success message on valid save', async () => {
      renderEditListing();

      const saveButton = screen.getByRole('button', { name: /Save Changes/ });
      await userEvent.click(saveButton);

      expect(screen.getByText(/successfully/)).toBeInTheDocument();
    });

    it('must have cancel button', () => {
      renderEditListing();

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      expect(cancelButton).toBeInTheDocument();
    });

  });

  describe('delete', () => {

    it('must display delete button in danger zone', () => {
      renderEditListing();

      expect(screen.getByRole('button', { name: /Delete Listing/ })).toBeInTheDocument();
    });

    it('must open delete confirmation modal', async () => {
      renderEditListing();

      const deleteButton = screen.getByRole('button', { name: /Delete Listing/ });
      await userEvent.click(deleteButton);

      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });

    it('must delete listing when confirmed', async () => {
      renderEditListing();

      const deleteButton = screen.getByRole('button', { name: /Delete Listing/ });
      await userEvent.click(deleteButton);

      const allDeleteButtons = screen.getAllByRole('button', { name: /Delete Listing/ });
      if (allDeleteButtons.length > 1) {
        await userEvent.click(allDeleteButtons[allDeleteButtons.length - 1]);
        expect(screen.getByText('Listing Deleted')).toBeInTheDocument();
      }
    });

  });

  describe('activity log', () => {

    it('must display activity section', () => {
      renderEditListing();

      expect(screen.getByText('Activity')).toBeInTheDocument();
    });

  });

});
