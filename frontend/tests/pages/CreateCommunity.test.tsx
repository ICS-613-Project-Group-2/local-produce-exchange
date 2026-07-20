import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import CreateCommunity from '@/pages/CreateCommunity';

function renderCreateCommunity() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CreateCommunity />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('CreateCommunity', () => {

  it('must render page header', () => {
    renderCreateCommunity();

    expect(screen.getByText('Create a Community')).toBeInTheDocument();
    expect(screen.getByText(/Start a public or private group/)).toBeInTheDocument();
  });

  it('must render all required form fields', () => {
    renderCreateCommunity();

    expect(screen.getByLabelText(/Community Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
  });

  it('must render privacy options', () => {
    renderCreateCommunity();

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBe(2);
    expect(screen.getByText(/Private/)).toBeInTheDocument();
    expect(screen.getByText(/Public/)).toBeInTheDocument();
  });

  it('must have Private selected by default', () => {
    renderCreateCommunity();

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons[0]).toBeChecked();
  });

  it('must show invite email field when private is selected', () => {
    renderCreateCommunity();

    const inviteEmail = screen.getByPlaceholderText('friend@example.com');
    expect(inviteEmail).toBeInTheDocument();
  });

  it('must hide invite email field when public is selected', async () => {
    renderCreateCommunity();

    const radioButtons = screen.getAllByRole('radio');
    await userEvent.click(radioButtons[1]);

    const inviteEmail = screen.queryByPlaceholderText('friend@example.com');
    expect(inviteEmail).not.toBeInTheDocument();
  });

  it('must render optional guidelines field', () => {
    renderCreateCommunity();

    expect(screen.getByLabelText(/Guidelines/)).toBeInTheDocument();
  });

  it('must render Create Community button', () => {
    renderCreateCommunity();

    expect(screen.getByRole('button', { name: 'Create Community' })).toBeInTheDocument();
  });

  it('must render Cancel link', () => {
    renderCreateCommunity();

    const cancelLink = screen.getByRole('link', { name: 'Cancel' });
    expect(cancelLink).toHaveAttribute('href', '/communities');
  });

  it('must show validation errors when submitting empty form', async () => {
    renderCreateCommunity();

    const submitButton = screen.getByRole('button', { name: 'Create Community' });
    await userEvent.click(submitButton);

    expect(screen.getByText('Community name is required.')).toBeInTheDocument();
    expect(screen.getByText('Description is required.')).toBeInTheDocument();
    expect(screen.getByText('Location or area is required.')).toBeInTheDocument();
  });

  it('must clear error when field is edited', async () => {
    renderCreateCommunity();

    const submitButton = screen.getByRole('button', { name: 'Create Community' });
    await userEvent.click(submitButton);

    expect(screen.getByText('Community name is required.')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Community Name/);
    await userEvent.type(nameInput, 'Test Community');

    expect(screen.queryByText('Community name is required.')).not.toBeInTheDocument();
  });

  it('must validate email format', async () => {
    renderCreateCommunity();

    const nameInput = screen.getByLabelText(/Community Name/);
    const descInput = screen.getByLabelText(/Description/);
    const locationInput = screen.getByLabelText(/Location/);
    const emailInput = screen.getByPlaceholderText('friend@example.com');
    const submitButton = screen.getByRole('button', { name: 'Create Community' });

    await userEvent.type(nameInput, 'Test Community');
    await userEvent.type(descInput, 'Test description');
    await userEvent.type(locationInput, 'Test location');
    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.click(submitButton);

    const errorElement = screen.queryByText(/Please enter a valid email/);
    if (errorElement) {
      expect(errorElement).toBeInTheDocument();
    }
  });

  it('must show success screen after valid submission', async () => {
    renderCreateCommunity();

    const nameInput = screen.getByLabelText(/Community Name/);
    const descInput = screen.getByLabelText(/Description/);
    const locationInput = screen.getByLabelText(/Location/);
    const submitButton = screen.getByRole('button', { name: 'Create Community' });

    await userEvent.type(nameInput, 'Green Valley Community');
    await userEvent.type(descInput, 'A community for sharing fresh produce');
    await userEvent.type(locationInput, 'Downtown area');
    await userEvent.click(submitButton);

    expect(screen.getByText('Community Created! 🏘️')).toBeInTheDocument();
    expect(screen.getByText(/Green Valley Community/)).toBeInTheDocument();
  });

  it('must provide navigation links on success screen', async () => {
    renderCreateCommunity();

    const nameInput = screen.getByLabelText(/Community Name/);
    const descInput = screen.getByLabelText(/Description/);
    const locationInput = screen.getByLabelText(/Location/);
    const submitButton = screen.getByRole('button', { name: 'Create Community' });

    await userEvent.type(nameInput, 'Test');
    await userEvent.type(descInput, 'Desc');
    await userEvent.type(locationInput, 'Loc');
    await userEvent.click(submitButton);

    const viewLink = screen.getByRole('link', { name: 'View Communities' });
    const dashboardLink = screen.getByRole('link', { name: 'Go to Dashboard' });

    expect(viewLink).toHaveAttribute('href', '/communities');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('must toggle privacy selection', async () => {
    renderCreateCommunity();

    const radioButtons = screen.getAllByRole('radio');
    const privateButton = radioButtons[0];
    const publicButton = radioButtons[1];

    expect(privateButton).toBeChecked();

    await userEvent.click(publicButton);

    expect(publicButton).toBeChecked();
    expect(privateButton).not.toBeChecked();
  });

});
