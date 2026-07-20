import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal, { ModalFooter } from '@/components/ui/Modal';

describe('Modal', () => {                                              // Test Suite

  it('must not render its content when open is false', () => {        // Test Case
    render(
      <Modal open={false} onOpenChange={() => {}} title="Confirm delete">
        Content
      </Modal>
    );

    expect(screen.queryByText('Confirm delete')).not.toBeInTheDocument();
  });

  it('must render the title when open is true', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Confirm delete">
        Content
      </Modal>
    );

    expect(screen.getByText('Confirm delete')).toBeInTheDocument();
  });

  it('must render the description when provided', () => {
    render(
      <Modal
        open={true}
        onOpenChange={() => {}}
        title="Confirm delete"
        description="This action cannot be undone."
      >
        Content
      </Modal>
    );

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('must not render a description when none is provided', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Confirm delete">
        Content
      </Modal>
    );

    expect(document.querySelector('.modal__description')).not.toBeInTheDocument();
  });

  it('must render its children inside the modal body', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Confirm delete">
        <p>Are you sure?</p>
      </Modal>
    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('must call onOpenChange with false when the close button is clicked', async () => {
    const handleOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={handleOpenChange} title="Confirm delete">
        Content
      </Modal>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('must call onOpenChange with false when Escape is pressed', async () => {
    const handleOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={handleOpenChange} title="Confirm delete">
        Content
      </Modal>
    );

    await userEvent.keyboard('{Escape}');

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('ModalFooter', () => {                                          // Test Suite

  it('must render its children', () => {                                // Test Case
    render(<ModalFooter>Footer actions</ModalFooter>);

    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });
});