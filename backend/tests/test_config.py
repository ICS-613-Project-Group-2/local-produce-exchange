from config import settings


def test_settings_load_required_fields_from_environment():
    assert settings.DATABASE_URL
    assert settings.JWT_SECRET
    assert settings.SUPABASE_URL
    assert settings.SUPABASE_SECRET_KEY
    assert settings.SUPABASE_STORAGE_BUCKET
