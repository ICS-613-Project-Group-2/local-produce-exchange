from fastapi import APIRouter, Form
from fastapi.responses import HTMLResponse

from models import User
from schemas import RegisterUser

router = APIRouter()

@router.get("/")
def index():
    return {"message": "this is the main index page"}

@router.post("/register")
def register(user_form: RegisterUser):

    user = User(
        name=user_form.name,
        email=user_form.email,
        password_hash=user_form.password + "secret", # need to hash this password 
    )
    return {"name": user.name, "email": user.email, "password_hash": user.password_hash}