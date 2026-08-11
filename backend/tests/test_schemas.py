import pytest
from pydantic import ValidationError

from schemas import CreateListing, CreateReview, RegisterUser


def test_create_review_rejects_out_of_range_rating():
    with pytest.raises(ValidationError):
        CreateReview(rating=6)

    with pytest.raises(ValidationError):
        CreateReview(rating=0)


def test_create_review_rejects_unknown_fields():
    with pytest.raises(ValidationError):
        CreateReview(rating=5, unexpected_field="nope")


def test_register_user_rejects_invalid_name_pattern():
    with pytest.raises(ValidationError):
        RegisterUser(name="invalid name!", email="user@example.com", password="secret")


def test_create_listing_requires_positive_quantity():
    with pytest.raises(ValidationError):
        CreateListing(name="Item", quantity=0)
