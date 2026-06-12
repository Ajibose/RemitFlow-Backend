# RemitFlow Backend

Node.js + Express backend for **RemitFlow**, a Stellar-powered cross-border
remittance demo. It exposes a small REST API for FX quotes and transfers and
uses an in-memory store, so no database is required. Anything Stellar-related
is mocked.

## Tech stack

- Node.js + Express
- In-memory store (data is lost on restart)
- `cors`, `dotenv`, `morgan`, `uuid`

## Getting started

```bash
npm install
cp .env.example .env
npm start
```

The server listens on `PORT` (default `3000`).

## Project layout

```
src/
  config/       configuration and mock FX rates
  controllers/  HTTP request handlers
  middleware/   logging, validation, error handling
  routes/       Express routers
  services/     business logic (rates, quotes, transfers, users)
  store/        in-memory store and seed data
  utils/        logger, ids, money, ApiError, asyncHandler
  validators/   request validators
  app.js        Express app assembly
  index.js      server bootstrap
```

## API overview

See the endpoint reference below. All responses are JSON. Errors use a
consistent envelope:

```json
{ "error": { "message": "...", "status": 400, "details": { } } }
```
