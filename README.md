# GlobalTrotters — Travel Planning App

Full-stack app: **React (Vite)** frontend + **Node.js/Express + SQLite** backend.

Matches the problem statement: login/signup, multi-city itineraries, activities & budgets,
search/discover, cost breakdowns, and public/shared trips.

## Folder structure

```
globaltrotters/
  backend/     -> Express API + SQLite database
  frontend/    -> React app (Vite)
```

## How to run (steps)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit JWT_SECRET to any random string
npm run dev
```

Runs on **http://localhost:5000**. A `globaltrotters.db` SQLite file is created
automatically on first run — no separate database server needed.

### 2. Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** and proxies `/api` calls to the backend.

### 3. Open the app

Visit **http://localhost:5173**, sign up for an account, and start building a trip.

## What each screen does

| Screen | Route | Maps to problem statement |
|---|---|---|
| Login / Signup | `/login`, `/signup` | Screen 1 — auth entry point |
| Dashboard | `/` | Trip list, create new trip |
| Trip detail | `/trips/:id` | Multi-city itinerary builder, activities, budget breakdown, share toggle |
| Discover | `/search` | Search destinations & activities |
| Shared trips | `/shared` | Public trips from other users |

## Database schema

- `users` — id, name, email, password (hashed)
- `trips` — id, user_id, title, dates, is_public
- `trip_cities` — id, trip_id, city_name, country, dates, order_index (the multi-city route)
- `activities` — id, trip_city_id, name, category, date, cost, notes (drives the budget breakdown)

## Deploying / getting a shareable link

This is a two-part app (API + frontend), so it needs two hosts:

- **Backend**: deploy the `backend/` folder to Render, Railway, or Fly.io (all have free tiers).
  Set the `JWT_SECRET` environment variable there.
- **Frontend**: deploy the `frontend/` folder to Vercel or Netlify. Set an environment
  variable or update `vite.config.js`'s proxy target to point at your live backend URL
  instead of `localhost:5000`.

Once both are deployed, the frontend's live URL is the link you can share with anyone.
