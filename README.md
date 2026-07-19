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

## Configuration

The application is configured using environment variables (typically defined in a `.env` file). The following variables are supported:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | The port the server listens on | `3000` |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `DEFAULT_BASE_CURRENCY` | Default base currency for rates | `USD` |
| `TRANSFER_FEE_PERCENT` | Percentage fee charged per transfer | `1.5` |
| `TRANSFER_FEE_FLAT` | Flat fee charged per transfer | `0.30` |
| `MAX_TRANSFER_AMOUNT` | Maximum single transfer amount accepted | `50000` |
| `STELLAR_NETWORK` | Stellar network environment (`testnet`, `public`) | `testnet` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `RATE_LIMIT_WINDOW_MS` | Time window for rate limiting (ms) | `60000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `BODY_LIMIT` | Max JSON request body size | `100kb` |
| `REQUEST_TIMEOUT_MS` | Request timeout before returning 503 (ms) | `15000` |
| `DB_POOL_MIN` | Minimum database connections in pool | `2` |
| `DB_POOL_MAX` | Maximum database connections in pool | `10` |
| `DB_POOL_IDLE_TIMEOUT_MS` | How long a connection can be idle before being closed (ms) | `30000` |
| `DB_POOL_CONNECTION_TIMEOUT_MS` | Time to wait for a connection before timing out (ms) | `2000` |


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
{ "error": { "message": "...", "status": 400, "details": { }, "requestId": "...", "at": "..." } }
```

Every response carries an `X-Request-Id` header (echoed from the request when
supplied) so logs and errors can be correlated.

## Endpoints

### Health

- `GET /api/health` — service health snapshot (version, uptime, env).
- `GET /api/health/live` — liveness probe.
- `GET /api/health/ready` — readiness probe with dependency checks.
- `GET /api/version` — service name and version.

### Rates & quotes

- `GET /api/rates` — list supported currencies and their USD rate.
- `GET /api/rates/:pair` — rate for one pair, e.g. `/api/rates/USD-INR`.
- `GET /api/quote?amount=&from=&to=` — FX quote with fee breakdown.

### Transfers

- `POST /api/transfers` — create a transfer.
  Body: `{ senderName, recipientName, amount, from, to }`
- `GET /api/transfers` — list transfers. Supports `?status=`, `?q=` (name
  search) and `?limit=`/`?offset=` pagination.
- `GET /api/transfers/stats` — aggregate counts and volume by currency.
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

# Search transfers by name and view aggregate stats
curl "http://localhost:3000/api/transfers?q=alice"
curl "http://localhost:3000/api/transfers/stats"
```
