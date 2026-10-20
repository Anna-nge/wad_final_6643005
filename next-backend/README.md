# Online Course Service backend

This Next.js project exposes the authenticated API and stores data in MongoDB. For full setup, grading account credentials, and Vercel deployment instructions, see the [project README](../README.md).

Configure `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, and `FRONTEND_ORIGIN` in `.env.local`. Seed the six grading accounts with `npm run seed:users`, then start the API with:

```bash
npm install
npm run dev
```
