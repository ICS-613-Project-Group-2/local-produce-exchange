from models import Base


def test_declarative_base_registers_all_expected_tables():
    table_names = set(Base.metadata.tables.keys())

    expected = {
        "users",
        "communities",
        "memberships",
        "listings",
        "claim_requests",
        "message_threads",
        "messages",
        "notifications",
        "reviews",
        "invitations",
        "listing_photos",
        "photos",
        "community_posts",
        "join_requests",
    }

    assert expected <= table_names
