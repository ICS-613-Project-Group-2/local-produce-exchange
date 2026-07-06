from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import Base
from api.routers import login

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router)

@app.get("/")
def index():
    return {"message": "this is the main index page"}
