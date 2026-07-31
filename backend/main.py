from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from models import Base
from api.routers import login, listings, photos, communities, claims, messages

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router)
app.include_router(listings.router)
app.include_router(photos.router)
app.include_router(communities.router)
app.include_router(claims.router)
app.include_router(messages.router)

@app.get("/")
def index():
    return {"message": "this is the main index page"}
