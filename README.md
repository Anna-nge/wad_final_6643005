# Online Course Service

Online course management application with a Vite/React frontend, a Next.js API backend, and MongoDB storage.

## Requirements

- Node.js 20 or newer
- MongoDB connection string

## Run locally

### Backend

```bash
cd next-backend
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `MONGODB_URI` and a long random `JWT_SECRET`. Then seed the grading users and start the API:

```bash
npm run seed:users
npm run dev
```

The API runs at `http://localhost:3000`. `DB_NAME` defaults to `wad_final`.

### Frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env.development
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`. The frontend API origin is set by `VITE_API_URL`.

## Grading accounts

Run `npm run seed:users` in `next-backend` against the MongoDB database you intend to grade. The script creates or resets these six accounts. Passwords are stored as bcrypt hashes.

| Role | Username | Email | Password |
|---|---|---|---|
| Student | `student1` | `student1@example.com` | `Student123!` |
| Student | `student2` | `student2@example.com` | `Student123!` |
| Student | `student3` | `student3@example.com` | `Student123!` |
| Teacher | `teacher1` | `teacher1@example.com` | `Teacher123!` |
| Teacher | `teacher2` | `teacher2@example.com` | `Teacher123!` |
| Teacher | `teacher3` | `teacher3@example.com` | `Teacher123!` |

Use the teacher accounts to create courses. Student registration through the frontend creates Student accounts only.

## Deployment

Deploy each folder as a separate Vercel project from the same repository:

1. Set the backend project root directory to `next-backend`.
2. Set backend environment variables: `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, and `FRONTEND_ORIGIN` (the deployed frontend origin, without a trailing slash).
3. Set the frontend project root directory to `frontend`.
4. Set frontend environment variable `VITE_API_URL` to the deployed backend origin, without a trailing slash.
5. Deploy both projects, set the final frontend origin in the backend's `FRONTEND_ORIGIN`, and redeploy the backend.
6. Seed the deployed MongoDB database by running `npm run seed:users` from `next-backend` with its deployment `MONGODB_URI` and `DB_NAME` configured locally.

The frontend stores the bearer token and also uses the backend's HTTP-only auth cookie. Backend CORS is limited to `FRONTEND_ORIGIN`.

## Submission links

- Backend repository: _add link_
- Frontend repository: _add link_
- Deployed backend: _add URL_
- Deployed frontend: _add URL_
- Screen recording: _add link_
