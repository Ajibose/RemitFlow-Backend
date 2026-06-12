# Contributing to RemitFlow Backend

Thanks for your interest in improving RemitFlow. This is a small demo service,
so the guidelines below are deliberately lightweight.

## Getting set up

```bash
npm install
cp .env.example .env
npm start
```

## Project conventions

- Every source file starts with `'use strict';`.
- Code is plain CommonJS (`require`/`module.exports`), no transpilation.
- Public functions carry a short JSDoc block describing parameters and return
  values.
- Layering is one-way: `routes` -> `controllers` -> `services` -> `store`.
  Controllers stay thin; business logic lives in services.
- Throw `ApiError` (see `src/utils/ApiError.js`) for client-facing failures so
  the central error handler can render a consistent envelope.
- Configuration is read once in `src/config` from environment variables with
  sensible defaults; never read `process.env` elsewhere.

## Tests

The test suite uses the built-in Node test runner — no extra dependencies.

```bash
npm test
```

Add a `test/<name>.test.js` file alongside any new utility module.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/), e.g.
`feat: add foo endpoint`, `fix: handle empty body`, `docs: update README`.
Keep each commit focused on a single change.

## Before opening a pull request

- Run `npm test` and make sure it passes.
- Run `node --check` on any new file.
- Update the README and `.env.example` when you add endpoints or config.
