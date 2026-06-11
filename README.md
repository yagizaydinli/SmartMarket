# SmartMarket

SmartMarket has two deployable parts:

- `smartmarket-client`: Vite React frontend. Deploy this to Vercel.
- `SmartMarket.API`: ASP.NET Core API. Deploy this to Google Cloud Run with Docker.

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

Set these variables on the API host. For Google Cloud Run, add them during service creation or under Service > Edit & deploy new revision > Variables & Secrets.

```bash
ConnectionStrings__DefaultConnection=your-postgres-connection-string
GroqApiKey=your-groq-api-key
```

The API intentionally does not store production secrets in `appsettings.json`.

## API deploy on Google Cloud Run

Use `SmartMarket.API/Dockerfile` as the container definition.

One simple path is:

1. Open Google Cloud Console.
2. Create or select a project.
3. Enable billing, Cloud Run, Cloud Build, and Artifact Registry.
4. Go to Cloud Run > Create Service.
5. Choose source from GitHub or deploy from a container built from `SmartMarket.API`.
6. Set container port to `8080`.
7. Add environment variables:

```bash
ConnectionStrings__DefaultConnection=your-postgres-connection-string
GroqApiKey=your-groq-api-key
```

After Cloud Run gives you a URL, set this in Vercel:

```bash
VITE_API_URL=https://your-cloud-run-url.run.app/api
```
