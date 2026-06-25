from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(255), unique=True)
    password_hash = Column(Text)
    profile_photo_id = Column(Integer, nullable=True)
