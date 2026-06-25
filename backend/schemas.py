from pydantic import BaseModel, EmailStr, Field

class RegisterUser(BaseModel):
    name: str = Field(..., min_length=1, max_length=128, pattern="^[A-Za-z0-9-_]+$")
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

    model_config = {"extra": "forbid"}
