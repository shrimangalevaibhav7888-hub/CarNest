# CareNest AI — Production Backend Deployment Guide (Render & Vercel)

This document provides complete, verified, repository-specific instructions for deploying the **CareNest AI** backend on [Render](https://render.com) and linking it with the deployed [Vercel](https://vercel.com) frontend.

---

## 1. Repository Structure & Active Backend

The repository is structured as a monorepo:

- **Active Backend Application**: `apps/backend/` (with a repository root junction/symlink at `backend/`).
  - Framework: **FastAPI** (ASGI).
  - Main ASGI Application: `app.main:app` (aliased as `app.main:application`).
  - Active Entrypoints: `app/main.py`, `run.py`.
  - Dependency File: `apps/backend/requirements.txt`.
- **Frontend Application**: `apps/frontend/` (Next.js 14, deployed on Vercel).

---

## 2. Render Service Configuration

When creating the backend service in the [Render Dashboard](https://dashboard.render.com):

| Setting | Value / Recommended Choice | Notes |
| :--- | :--- | :--- |
| **Service Type** | **Web Service** | Standard HTTP/HTTPS ASGI server |
| **Environment** | **Python 3** | Python 3.11+ |
| **Region** | Choose region closest to your Vercel deployment (e.g., Oregon, Frankfurt, Singapore) | Minimizes API latency |
| **Branch** | `main` | Or your production release branch |
| **Root Directory** | `apps/backend` | **Crucial:** Render changes directory into `apps/backend` before running build and start commands |
| **Build Command** | `pip install -r requirements.txt` | Installs FastAPI, Uvicorn, SQLAlchemy, Psycopg2, etc. |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Starts the production ASGI server bound to Render's assigned port |
| **Auto-Deploy** | `Yes` (Recommended) | Automatically deploys when you push to the Git branch |
| **Health Check Path** | `/api/health` (or leave **blank** for instant TCP check) | Leaving blank uses Render's instant TCP port probe (recommended for fastest deploy); setting `/api/health` pings the dedicated ASGI health check |

> **Alternative Start Command:** `python run.py` also works because `run.py` dynamically binds to `0.0.0.0`, loads `$PORT` from environment variables, and disables reload when `APP_ENV=production`. However, the direct `uvicorn` command is standard on Render.

---

## 3. Required Environment Variables on Render

In the Render Dashboard, navigate to your Web Service -> **Environment** tab, and configure the following variables:

### Core Application Variables

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `PROJECT_NAME` | No | `CareNest AI Backend` | Display name in API docs and health checks |
| `APP_ENV` | **Yes** | `production` | Enforces production mode (disables debug reload) |
| `DEBUG` | **Yes** | `false` | Disables debug stack traces in public responses |
| `API_PREFIX` | No | `/api` | Base prefix for all API routes (defaults to `/api`) |
| `HOST` | No | `0.0.0.0` | IP interface to bind server |
| `PORT` | Auto | *(Injected by Render automatically)* | Defaults to 10000 on Render; Uvicorn reads `$PORT` |

### Database & Persistence Variables

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres` | PostgreSQL connection URL. Render `postgres://` prefix is automatically sanitized to `postgresql://`. If using Render Disk with SQLite: `sqlite:////var/data/carenest.db` |
| `AUTO_SEED` | No | `true` (or `false`) | When `true`, automatically creates initial demo accounts (Dr. Clara, David RN, Eleanor Vance, etc.) if database is empty. Safe: skips seeding if records exist. Set to `false` for a blank database. |

### Security & Authentication Variables

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `SECRET_KEY` | **Yes** | `8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b` | Secret key for signing JWT tokens. **Generate with `openssl rand -hex 32`**. Never use the development default in production! |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm (default `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` | JWT token validity in minutes (10080 = 7 days) |

### CORS Variables (Connecting Frontend to Backend)

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `ALLOWED_ORIGINS` | **Yes** | `https://your-carenest-app.vercel.app,http://localhost:3000` | Comma-separated or JSON list of allowed origins. **Do not put trailing slashes**. The backend automatically strips trailing slashes defensively. |

### Optional Service Variables

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | No | `AIzaSy...` | For AI daily summaries, medication insights, and Q&A |
| `OPENAI_API_KEY` | No | `sk-...` | Optional alternative for hybrid AI engine |
| `AI_PROVIDER` | No | `hybrid` | `hybrid`, `gemini`, `openai`, or `clinical_rule_engine` |
| `SUPABASE_URL` | No | `https://[PROJECT-REF].supabase.co` | Optional Supabase cloud integration |
| `SUPABASE_KEY` | No | `eyJhb...` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | `eyJhb...` | Supabase service role key (backend only) |

---

## 4. Database Strategy & Data Safety

The CareNest AI database layer is built with **SQLAlchemy 2.0**, allowing seamless operation with both **SQLite** and **PostgreSQL**.

### Option A: Cloud PostgreSQL (Recommended for Production)
Render Web Services run in ephemeral containers. When containers restart or deploy, any files written inside the container (including local SQLite `.db` files) are discarded unless a Persistent Disk is attached.

- **Recommended Provider**: Supabase (Free tier PostgreSQL) or Render Managed PostgreSQL.
- **Connection Format**: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]`
  *(Note: Render PostgreSQL supplies URLs starting with `postgres://`. The backend code automatically sanitizes `postgres://` to `postgresql://` so SQLAlchemy 2.0 connects without errors).*
- **Connection Pooling**: The backend has pre-configured connection pooling (`pool_pre_ping=True`, `pool_recycle=300`, `pool_size=5`, `max_overflow=10`) to prevent dropped SSL connections and handle reconnects gracefully.
- **Schema Initialization**: On startup, `Base.metadata.create_all(bind=engine)` automatically checks and creates all missing tables. It **never drops or overwrites existing tables or data**.

### Option B: SQLite with Render Persistent Disk
If you choose to retain SQLite in production:
1. In the Render Dashboard under **Disks**, click **Add Disk**.
2. Name: `carenest-data`
3. Mount Path: `/var/data`
4. Size: 1 GB (or as needed)
5. Set `DATABASE_URL` to `sqlite:////var/data/carenest.db`
6. *Note*: Persistent Disks are only available on Render Paid instances, and limit your service to 1 instance (no horizontal scaling).

---

## 5. Connecting Vercel Frontend to Render Backend

Your frontend is deployed on **Vercel**. To direct API calls to your newly deployed Render backend:

### Step 1: Copy Your Render Web Service URL
Once Render deploys your Web Service, Render assigns a public HTTPS URL:
`https://carenest-ai-backend.onrender.com` (example)

### Step 2: Configure Environment Variables in Vercel
1. Open the [Vercel Dashboard](https://vercel.com/dashboard) and select your CareNest AI project.
2. Go to **Settings** -> **Environment Variables**.
3. Add or update the following variable:

| Variable Name | Environment | Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Production, Preview, Development** | `https://[YOUR-RENDER-SERVICE-NAME].onrender.com/api` |
| `BACKEND_INTERNAL_URL` *(Optional)* | **Production, Preview, Development** | `https://[YOUR-RENDER-SERVICE-NAME].onrender.com` |

> [!IMPORTANT]
> The frontend's `apps/frontend/src/lib/constants.ts` and `apps/frontend/next.config.mjs` have been defensively enhanced so that even if you accidentally enter `https://[YOUR-RENDER-SERVICE-NAME].onrender.com` (omitting `/api`), or include a trailing slash, the code automatically appends `/api` and removes trailing slashes.

### Step 3: Trigger a Redeployment on Vercel
**A new Vercel deployment IS required.**
Next.js bakes environment variables prefixed with `NEXT_PUBLIC_*` into client-side JavaScript bundles **at build time**. Changing `NEXT_PUBLIC_API_URL` in the Vercel dashboard will not affect the live site until you trigger a rebuild:
1. In the Vercel Dashboard, navigate to the **Deployments** tab.
2. Click the three dots (`...`) next to your latest production deployment.
3. Select **Redeploy**.
4. Confirm without changing settings. Once finished, your frontend will communicate with your live Render backend.

---

## 6. Verification and Health Checks

### 1. Verify Service Root
```bash
curl -i https://[YOUR-RENDER-SERVICE-NAME].onrender.com/
```
Expected response:
```json
HTTP/2 200
{
  "name": "CareNest AI",
  "version": "1.0.0",
  "status": "online",
  "docs": "/docs",
  "health": "/api/health"
}
```

### 2. Verify Health & Database Connectivity
```bash
curl -i https://[YOUR-RENDER-SERVICE-NAME].onrender.com/api/health
```
Expected response:
```json
HTTP/2 200
{
  "status": "healthy",
  "app_name": "CareNest AI Backend",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "api": "operational",
    "database": "operational",
    "ai_engine": "ready"
  }
}
```

### 3. Verify Authentication & CORS
Run from a terminal or browser console:
```bash
curl -i -X POST https://[YOUR-RENDER-SERVICE-NAME].onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://[YOUR-VERCEL-DOMAIN].vercel.app" \
  -d '{"email": "patient@carenest.ai", "password": "Password123!"}'
```
Expected response:
- Status: `HTTP/2 200 OK`
- Header: `access-control-allow-origin: https://[YOUR-VERCEL-DOMAIN].vercel.app`
- Header: `access-control-allow-credentials: true`
- Body contains `access_token` and the user profile for `Eleanor Vance`.

---

## 7. Inspecting Logs & Monitoring

- **Build Logs**: In Render Dashboard -> Web Service -> **Events** -> click on the latest build to see dependency installation and build status.
- **Runtime Logs**: In Render Dashboard -> Web Service -> **Logs**. Displays live application output, incoming requests, and any unhandled errors.
- **Render Health Alerts**: If `/api/health` returns anything other than HTTP 200 during health checks, Render flags the service and preserves the previous stable release until the new release passes.

---

## 8. Common Troubleshooting & Resolutions

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **Build fails: `ModuleNotFoundError` during startup** | Root Directory not set | Set **Root Directory** to `apps/backend` in Render Web Service settings. |
| **Error: `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres`** | Database URL begins with `postgres://` | The backend already converts `postgres://` to `postgresql://` automatically in `app/config.py` and `app/database/session.py`. Ensure your `DATABASE_URL` is properly set. |
| **Browser CORS Error: `No 'Access-Control-Allow-Origin' header`** | Vercel domain not in `ALLOWED_ORIGINS` | In Render Environment Variables, add your exact Vercel frontend URL to `ALLOWED_ORIGINS` (e.g. `https://carenest-ai.vercel.app`). Do not use trailing slashes. Redeploy Render service. |
| **API requests return 404 on Vercel frontend** | Frontend sending requests to Vercel origin instead of Render | Ensure `NEXT_PUBLIC_API_URL` is set to `https://[RENDER-URL].onrender.com/api` in Vercel settings and **redeploy** your Vercel project. |
| **Health check fails with 404 on Render (`/api/health 404`)** | Stale build cache or trailing probe mismatch | **1.** Go to **Manual Deploy** -> **Clear build cache & deploy** to purge cached bytecode.<br>**2.** Or go to **Settings** -> **Health Check Path** and leave it **blank** so Render uses an instant TCP port check on port 10000. |
| **Free tier cold start delay (50+ seconds)** | Render Free Web Service spins down after 15 min of inactivity | When a request arrives, Render spins the container up (takes ~30-50s). Once awake, subsequent requests respond in milliseconds. For 24/7 instant response, upgrade the Web Service to Render Starter ($7/mo). |
| **Database records disappear after redeploy** | Using SQLite on ephemeral disk without Persistent Disk | Use a cloud PostgreSQL database (Supabase or Render PostgreSQL) by setting `DATABASE_URL="postgresql://..."`, or attach a Render Persistent Disk. |

---

## 9. Rollback Procedure

If a deployed version experiences unexpected issues:
1. In the **Render Dashboard**, open your Web Service.
2. Go to the **Deploys** tab.
3. Locate the previous successfully deployed commit/build.
4. Click the three dots (`...`) on the right side of that deployment entry.
5. Click **Rollback to this deploy**.
Render will instantly point live traffic to the selected previous deployment image.

