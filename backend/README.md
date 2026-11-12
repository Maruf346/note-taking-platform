# Noted API

Secure REST API for the Noted interview project, built with Express, MongoDB, Mongoose, JWT, and bcrypt.

## Features

- JWT registration, login, and authenticated profiles
- User-owned note CRUD
- Public posts with author-owned mutations
- Admin user management and global note visibility
- Pagination on every list operation
- Role-based access control
- Password hashing with bcrypt (cost factor 12)
- Helmet, CORS, request size limits, and rate limiting
- Required MongoDB aggregation scenarios
- Minimal explicit indexing strategy

## Local setup

```bash
npm install
copy .env.example .env
npm run seed:admin
npm run dev
```

The API runs at `http://localhost:8000`. Confirm it with `GET /api/health`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection URI |
| `JWT_SECRET` | Random secret of at least 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime, such as `1d` |
| `FRONTEND_URL` | Allowed CORS origin; comma-separate multiple origins |
| `PORT` | Local server port |

The `ADMIN_*` variables are only read by the admin seed script.

## API routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | User |
| GET, POST | `/api/notes` | User |
| GET, PATCH, DELETE | `/api/notes/:id` | Owner; admin may read any |
| GET | `/api/posts` | Public |
| POST | `/api/posts` | User |
| PATCH, DELETE | `/api/posts/:id` | Author |
| GET | `/api/users/:id/posts` | Public; aggregation with `$lookup` |
| GET, POST | `/api/admin/users` | Admin |
| GET, PATCH, DELETE | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/notes` | Admin |
| GET | `/api/admin/interests/groups` | Admin; aggregation |

List routes accept `page` and `limit`. The maximum page size is 100.

## Index rationale

Indexes are declared with `schema.index()` so they are visible during review.

| Collection | Index | Supports |
| --- | --- | --- |
| users | `{ email: 1 }`, unique | Login and unique account lookup |
| notes | `{ owner: 1, _id: -1 }` | A user's newest-first notes |
| posts | `{ author: 1, _id: -1 }` | `$lookup` and a user's newest-first posts |

MongoDB's automatic `_id` indexes support direct reads and global newest-first admin/public lists. There is intentionally no interests index: grouping every interest processes the full user collection, so a multikey index would add write/storage cost without helping that pipeline.

## Aggregations

`GET /api/admin/interests/groups` performs exactly one `User.aggregate()` call. It unwinds interests, groups users, sorts groups, and paginates with `$facet`.

`GET /api/users/:id/posts` performs exactly one `User.aggregate()` call. It matches the user, uses a pipeline `$lookup` against the indexed `posts.author` field, and paginates inside that lookup.

## Verification

```bash
npm run lint
npm run check
```

## Vercel deployment

Import the backend repository as a Vercel project and configure `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `FRONTEND_URL`. The Express application is exported from `src/app.js`; the MongoDB connection is cached across warm function invocations.
