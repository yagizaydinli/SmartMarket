# SmartMarket

SmartMarket has two deployable parts:

- `smartmarket-client`: Vite React frontend. Deploy this to Vercel.
- `SmartMarket.API`: ASP.NET Core API. Deploy this to a .NET host such as Render, Railway, Azure App Service, or Fly.io.

## Local secrets

Real local values are stored in `SECRETS.local.md`. This file is ignored by Git.

Before publishing this repository, rotate any keys that were previously stored in source files.

## Frontend deploy on Vercel

Use these Vercel settings:

- Root Directory: `smartmarket-client`
- Build Command: `npm run build`
- Output Directory: `dist`

Add this environment variable in Vercel:

```bash
VITE_API_URL=https://your-api-host.example.com/api
```

For local frontend development, copy `smartmarket-client/.env.example` to `smartmarket-client/.env` and update `VITE_API_URL` if needed.

## API environment variables

Set these variables on the API host:

```bash
ConnectionStrings__DefaultConnection=your-postgres-connection-string
GroqApiKey=your-groq-api-key
```

The API intentionally does not store production secrets in `appsettings.json`.
