# Auth server (example)

This is a minimal example auth server for `gestion-equina`. It implements:

- `POST /api/auth/login` - validates username/password and returns `{ accessToken, user }` and sets a `refreshToken` cookie (HttpOnly).
- `POST /api/auth/refresh` - reads refresh token cookie and returns a new access token.
- `POST /api/auth/logout` - clears refresh token cookie.
- `GET /api/auth/me` - returns user info for a valid Authorization Bearer token.

## Run

1. Install dependencies:

```bash
cd examples/auth-server
npm install
```

2. Start the server:

```bash
npm run dev
```

Server listens on `http://localhost:4000` by default.

## Notes

- This server is a demo only. Do NOT use it in production as-is.
- Set `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` in environment variables for better security.
- The refresh tokens are stored in-memory; restart loses sessions.
