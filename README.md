# AutoPrime Car Dealership

A full-stack car dealership website with a public inventory page and a private admin panel.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (via `better-sqlite3`) — easy to swap to PostgreSQL/Turso
- **Auth**: JWT + bcrypt
- **Images**: Local `/uploads` folder (structured for easy swap to Cloudflare R2 / Firebase Storage)

## Project Structure

```
/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   └── admin/
│       ├── api.js
│       └── App.jsx
├── server/          # Express backend
│   ├── db/
│   │   ├── schema.js   # SQLite schema + connection
│   │   └── seed.js     # Admin account seeder
│   ├── middleware/
│   │   ├── auth.js     # JWT verification
│   │   └── upload.js   # Multer image upload
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cars.js
│   │   └── inquiries.js
│   └── index.js
├── uploads/         # Uploaded car images (gitignored except .gitkeep)
├── data/            # SQLite database file (gitignored)
├── .env.example
└── README.md
```

## Setup

### 1. Prerequisites

- Node.js 18+
- npm 9+

### 2. Clone and install

```bash
git clone <repo>
cd CarDealership

# Install root + all workspaces
npm install
npm run install:all
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for the owner login
- Leave other values as-is for local dev

### 4. Seed the admin account

```bash
npm run seed
```

This creates the admin account using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Running it again is safe (idempotent).

### 5. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 6. Build for production

```bash
npm run build    # builds client/dist
npm run start    # serves API + static frontend on PORT
```

## Admin Panel

- URL: `/admin/login`
- Default credentials (from `.env`): `admin@dealership.com` / `changeme123`
- **Change these before deploying!**

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cars` | List available cars (filterable) |
| GET | `/api/cars/makes` | Distinct makes for filter UI |
| GET | `/api/cars/:id` | Single car detail |
| POST | `/api/inquiries` | Submit contact/inquiry form |

### Admin (Bearer token required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Obtain JWT |
| GET | `/api/cars/admin/all` | All cars incl. sold |
| POST | `/api/cars` | Create car (multipart) |
| PUT | `/api/cars/:id` | Update car (multipart) |
| PATCH | `/api/cars/:id/status` | Toggle available/sold |
| DELETE | `/api/cars/:id` | Remove car + images |
| GET | `/api/inquiries` | List all inquiries |

## Deployment

### Recommended: Render.com (free tier)

Render supports persistent Node.js processes with a disk mount — needed for SQLite and local image uploads.

1. Create a **Web Service** pointing to this repo
2. Set build command: `npm run install:all && npm run build`
3. Set start command: `npm start`
4. Add a **Disk** mount at `/uploads` (for image persistence)
5. Set environment variables from `.env.example`

### Migrating to Vercel / Netlify (serverless)

These platforms don't support SQLite or a persistent filesystem. To deploy there:

1. **Database**: Replace `better-sqlite3` with [Turso](https://turso.tech/) (free tier, libSQL/SQLite-compatible) or Neon/Supabase (PostgreSQL)
2. **Images**: Replace local `multer` storage with Cloudflare R2, Firebase Storage, or Uploadthing — the `upload.js` middleware is isolated for this reason
3. **Backend**: Deploy Express as Vercel serverless functions, or use Next.js API routes

The schema in `server/db/schema.js` uses standard SQL — swapping to PostgreSQL requires changing `better-sqlite3` to `pg` and adjusting date functions (`datetime('now')` → `NOW()`).

## Image Storage Migration

The upload logic is isolated in `server/middleware/upload.js`. To swap to cloud storage:

1. Replace `multer.diskStorage` with `multer-s3` (for R2/S3) or your provider's SDK
2. Update filename references from `/uploads/<filename>` to the cloud CDN URL
3. Update the delete logic in `routes/cars.js` to call the cloud storage delete API
