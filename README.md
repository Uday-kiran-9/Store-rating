# Store Rating Platform

A full-stack web app where users rate stores from 1 to 5. A single login serves three roles, and each role sees different features.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, bcrypt password hashing |

## Roles and Features

**System Administrator**
- Dashboard with total users, stores and ratings
- Add users (any role) and stores
- View, filter and sort users (Name, Email, Address, Role) and stores (Name, Email, Address, Rating)
- View user details (store owners also show their rating)

**Normal User**
- Sign up and log in
- Search stores by name or address
- Submit and modify a 1-5 rating for any store
- See each store's overall rating and their own rating
- Change password

**Store Owner**
- Log in and change password
- Dashboard with the store's average rating and the list of users who rated it

All tables support ascending/descending sorting.

## Project Structure

```
store-rating/
├── backend/
│   ├── schema.sql
│   └── src/
│       ├── config/        database connection
│       ├── controllers/   request logic
│       ├── middleware/    JWT auth and role checks
│       ├── routes/        API routes
│       ├── validators/    input validation
│       ├── seed.js        creates the first admin
│       └── server.js
└── frontend/
    └── src/
        ├── components/    reusable UI (table, forms, layout)
        └── pages/         one file per screen
```

## Prerequisites

- Node.js (LTS)
- PostgreSQL 16

## Setup

### 1. Database
Create a database named `store_rating`, then run the schema:
```bash
psql -U postgres -c "CREATE DATABASE store_rating;"
psql -U postgres -d store_rating -f backend/schema.sql
```
(Or paste `backend/schema.sql` into pgAdmin's Query Tool.)

### 2. Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and fill in your values:
```
PORT=5000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/store_rating
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=1d
```
Create the first admin account and start the server:
```bash
npm run seed
npm run dev
```
The API runs at `http://localhost:5000`.

### 3. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

## Default Admin Login

| Email | Password |
|---|---|
| admin@example.com | Admin@12345 |

Sign up through the app to create normal users. Use the admin account to create store owners and stores.

## Form Validation

Applied on both frontend and backend:

| Field | Rule |
|---|---|
| Name | 20-60 characters |
| Address | Max 400 characters |
| Password | 8-16 characters, at least one uppercase letter and one special character |
| Email | Standard email format |
| Rating | Whole number from 1 to 5 |

## API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| PUT | `/api/auth/password` | Any logged-in user |
| GET | `/api/admin/stats` | Admin |
| GET, POST | `/api/admin/users` | Admin |
| GET | `/api/admin/users/:id` | Admin |
| GET, POST | `/api/admin/stores` | Admin |
| GET | `/api/stores` | Normal user |
| PUT | `/api/stores/:id/rating` | Normal user |
| GET | `/api/owner/dashboard` | Store owner |

List endpoints accept filter and sort query parameters, for example `?name=abc&sortBy=email&order=desc`.

## Design Notes

- **Security:** passwords are hashed with bcrypt, and role checks are enforced in backend middleware, not only in the UI. Signup always creates a normal user, so a role can't be chosen from the client.
- **Database:** foreign keys, a unique constraint on (user, store) so each user has one rating per store, and a check constraint limiting ratings to 1-5.
- **Ratings:** average ratings are calculated in SQL on request, so they never go stale. Submitting and modifying a rating is a single upsert.
- **Queries:** filtering and sorting run in SQL. Sortable columns are whitelisted, and all queries are parameterized to prevent SQL injection.