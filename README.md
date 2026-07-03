# Local Produce Exchange

A web application to reduce food waste through a local food exchange platform. Users can post listings for surplus produce, browse available food, join communities, and coordinate exchanges.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python (FastAPI, SQLAlchemy, Pydantic)
- **Database:** PostgreSQL

## Getting Started

### Frontend

```bash
./frontend/start.sh
```

This installs dependencies and starts the dev server at `http://localhost:5173`.

Or manually:

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Project Structure

```
├── backend/        API server, models, schemas, routing
├── frontend/       React app (components, features, pages, styles, data)
├── deployment/     SQL schema and deploy configs
└── docs/           Design documentation
```
