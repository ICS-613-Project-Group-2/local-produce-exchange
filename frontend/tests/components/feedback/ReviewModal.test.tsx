import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewModal from '@/components/feedback/ReviewModal';

function renderReviewModal(overrides: Partial<React.ComponentProps<typeof ReviewModal>> = {}) {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    recipientName: 'Wendy Darling',
    listingName: 'Fresh Tomatoes',
    onSubmit: vi.fn(),
  };
  return render(<ReviewModal {...defaultProps} {...overrides} />);
}

describe('ReviewModal', () => {                                          // Test Suite

  it('must render the recipient and listing name in the description', () => {  // Test Case
    renderReviewModal();

    expect(
      screen.getByText('How was your exchange with Wendy Darling for "Fresh Tomatoes"?')
    ).toBeInTheDocument();
  });

  it('must render 5 star buttons', () => {
    renderReviewModal();

    expect(screen.getByRole('group', { name: 'Rating' }).querySelectorAll('button')).toHaveLength(5);
  });

  it('must show "Select a rating" before any star is clicked', () => {
    renderReviewModal();

    expect(screen.getByText('Select a rating')).toBeInTheDocument();
  });

  it('must update the rating label when a star is clicked', async () => {
    renderReviewModal();

    await userEvent.click(screen.getByRole('button', { name: '3 stars' }));

    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('must highlight stars up to the hovered star, and un-highlight them on mouse leave', async () => {
    renderReviewModal();

    const star3 = screen.getByRole('button', { name: '3 stars' });
    await userEvent.hover(star3);
    expect(star3).toHaveClass('review-modal__star--filled');

    // Firing the mouseleave DOM event directly on star3, rather than relying
    // on userEvent to infer a pointer transition to a sibling element (which
    // proved unreliable here) or to document.body (blocked by the modal's
    // pointer-events: none overlay while open).
    fireEvent.mouseLeave(star3);

    expect(star3).not.toHaveClass('review-modal__star--filled');
  });

  it('must show an error when submitting without selecting a rating', async () => {
    const handleSubmit = vi.fn();
    renderReviewModal({ onSubmit: handleSubmit });

    await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please select a rating.');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('must clear the error once a star is selected after a failed submit', async () => {
    renderReviewModal();

    await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '4 stars' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('must call onSubmit with the selected rating and comment', async () => {
    const handleSubmit = vi.fn();
    renderReviewModal({ onSubmit: handleSubmit });

    await userEvent.click(screen.getByRole('button', { name: '5 stars' }));
    await userEvent.type(
      screen.getByPlaceholderText(/share your experience/i),
      'Great produce!'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(handleSubmit).toHaveBeenCalledWith(5, 'Great produce!');
  });

  it('must show the success view after a valid submit', async () => {
    renderReviewModal();

    await userEvent.click(screen.getByRole('button', { name: '4 stars' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Review Submitted ✅')).toBeInTheDocument();
    expect(
      screen.getByText('Thank you for your feedback! Your review for Wendy Darling has been saved.')
    ).toBeInTheDocument();
  });

  it('must call onOpenChange with false when Cancel is clicked', async () => {
    const handleOpenChange = vi.fn();
    renderReviewModal({ onOpenChange: handleOpenChange });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('must call onOpenChange with false when Done is clicked after submitting', async () => {
    const handleOpenChange = vi.fn();
    renderReviewModal({ onOpenChange: handleOpenChange });

    await userEvent.click(screen.getByRole('button', { name: '4 stars' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('must reset rating, comment, and error after the close animation delay elapses', () => {
    // onOpenChange here is a no-op stub, so the component stays mounted and
    // "open" for the rest of the test — which lets us observe handleClose's
    // deferred setTimeout reset directly, without needing to re-open anything.
    // Using fireEvent (synchronous) rather than userEvent here, since mixing
    // userEvent's internal async delays with fake timers can deadlock.
    vi.useFakeTimers();

    renderReviewModal();

    fireEvent.click(screen.getByRole('button', { name: '4 stars' }));
    fireEvent.change(screen.getByPlaceholderText(/share your experience/i), {
      target: { value: 'Loved it' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // Before the 200ms timeout fires, the previous selections are still visible.
    expect(screen.getByText('4/5')).toBeInTheDocument();

    // vi.advanceTimersByTime runs the setTimeout callback synchronously but
    // outside of React's act(), so the resulting setState calls need to be
    // explicitly wrapped to flush and re-render.
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('Select a rating')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/share your experience/i)).toHaveValue('');

    vi.useRealTimers();
  });

  it('must not render its content when open is false', () => {
    renderReviewModal({ open: false });

    expect(screen.queryByText('Leave a Review')).not.toBeInTheDocument();
  });
});