# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Error tracking integration hook (`src/services/errorTrackingService.js`)
  that captures every error through a replaceable transport (console by
  default) and enriches it with request context (id, method, url).
  Controlled via `ERROR_TRACKING_ENABLED` and `ERROR_TRACKING_LEVEL`
  environment variables.
- Liveness (`GET /api/health/live`) and readiness (`GET /api/health/ready`)
  probe endpoints.
- Single currency pair rate endpoint `GET /api/rates/:pair`.
- Aggregate transfer statistics endpoint `GET /api/transfers/stats`.
- Free-text name search on transfer listing via `?q=`.
- Security headers middleware (nosniff, frame, referrer, CSP).
- Request timeout middleware returning 503 when a handler stalls.
- Configurable JSON request body size limit (413 on overflow).
- Configurable maximum transfer amount with validation.
- `percentage` helper on the money util and a `strings` utility module, both
  covered by `node:test` suites.
- `unprocessable` (422) and `serviceUnavailable` (503) `ApiError` factories.
- Structured key-value fields in request logs.
- Expanded demo seed data with additional users and transfers.

### Changed

- User validation now enforces a name length limit and a two-letter country
  code.
- Fee calculation reuses the shared `money.percentage` helper.

## [0.1.0]

- Initial RemitFlow backend: FX quotes, transfers, users, health, rates,
  in-memory store, rate limiting, request id correlation and pagination.
