import { useState } from "react";
import Modal, { ModalFooter } from "../ui/Modal";
import Button from "../ui/Button";
import FormField, { Textarea } from "../ui/FormField";
import "./ReviewModal.css";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  listingName: string;
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewModal({
  open,
  onOpenChange,
  recipientName,
  listingName,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError("");
    setSubmitted(true);
    onSubmit(rating, comment);
  }

  function handleClose() {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setRating(0);
      setHoverRating(0);
      setComment("");
      setError("");
      setSubmitted(false);
    }, 200);
  }

  if (submitted) {
    return (
      <Modal open={open} onOpenChange={handleClose} title="Review Submitted ✅">
        <div className="review-modal__success">
          <p>Thank you for your feedback! Your review for {recipientName} has been saved.</p>
        </div>
        <ModalFooter>
          <Button variant="primary" onClick={handleClose}>Done</Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Leave a Review"
      description={`How was your exchange with ${recipientName} for "${listingName}"?`}
    >
      <div className="review-modal__form">
        {/* Star Rating */}
        <div className="review-modal__stars" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`review-modal__star ${star <= (hoverRating || rating) ? "review-modal__star--filled" : ""}`}
              onClick={() => { setRating(star); if (error) setError(""); }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
          <span className="review-modal__rating-label">
            {rating > 0 ? `${rating}/5` : "Select a rating"}
          </span>
        </div>
        {error && <p className="review-modal__error" role="alert">{error}</p>}

        {/* Comment */}
        <FormField label="Comment (optional)" htmlFor="review-comment">
          <Textarea
            id="review-comment"
            placeholder="Share your experience — was the pickup easy? Was the food fresh?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </FormField>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Submit Review</Button>
      </ModalFooter>
    </Modal>
  );
}
