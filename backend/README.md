# WalletIQ Backend

Node.js + Express 5 (ESM) · MongoDB · Redis · Zod · Cloudinary · JWT.

## Quick start
```bash
cp .env.example .env   # fill in the secrets
npm install
npm run dev
```

Health check: `GET http://localhost:8000/healthz`

## Layout
```
src/
  config/         connectors loaded once at boot (db, redis, cloudinary)
  utils/          ApiResponse, ApiError, asyncHandler, logger
  middlewares/    error handler, 404, zod validator
  models/         mongoose schemas (added per feature branch)
  controllers/    route handlers (added per feature branch)
  routes/         express routers (added per feature branch)
  validators/     zod schemas (added per feature branch)
  services/       cross-cutting business logic
  jobs/           node-cron schedulers
  app.js          express wiring
  index.js        boot
```

## Conventions
- Controllers wrap with `asyncHandler` — no try/catch in handlers.
- Success responses go through `ApiResponse`. Failures throw `ApiError`.
- Request payloads validated via `validate({ body?, params?, query? })`; validated data lives on `req.validated`.
- All routes mounted under `/api/v1`.
