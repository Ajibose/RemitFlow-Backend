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

## Endpoints

### Health

- `GET /api/health` — liveness probe.

### Rates & quotes

- `GET /api/rates` — list supported currencies and their USD rate.
- `GET /api/quote?amount=&from=&to=` — FX quote with fee breakdown.

### Transfers

- `POST /api/transfers` — create a transfer.
  Body: `{ senderName, recipientName, amount, from, to }`
- `GET /api/transfers` — list transfers (optional `?status=`).
- `GET /api/transfers/:id` — fetch one transfer.
- `POST /api/transfers/:id/claim` — recipient claims the transfer.
- `POST /api/transfers/:id/cancel` — sender cancels a pending transfer.

### Users

- `GET /api/users` — list users.
- `GET /api/users/:id` — fetch one user.
- `POST /api/users` — create a user. Body: `{ name, email, country? }`

## Transfer lifecycle

```
pending ──▶ claimed
   │
   └──────▶ cancelled
```

A transfer starts as `pending` and can move to either `claimed` or
`cancelled`. Terminal states cannot transition further.

## Examples

```bash
# Get a quote for sending 100 USD to INR
curl "http://localhost:3000/api/quote?amount=100&from=USD&to=INR"

# Create a transfer
curl -X POST http://localhost:3000/api/transfers \
  -H "Content-Type: application/json" \
  -d '{"senderName":"Alice","recipientName":"Bob","amount":100,"from":"USD","to":"INR"}'

# Claim a transfer
curl -X POST http://localhost:3000/api/transfers/<id>/claim
```
