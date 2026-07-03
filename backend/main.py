from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import Base
from api.routers import login

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[""], # TO DO: NEED TO INSERT FRONTEND URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router)

@app.get("/")
def index():
    return {"message": "this is the main index page"}
