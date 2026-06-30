#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== AutoPrime Car Dealership ==="
echo ""

# Check .env exists
if [ ! -f "$ROOT/.env" ]; then
  echo "[setup] Copying .env.example → .env"
  cp "$ROOT/.env.example" "$ROOT/.env"
fi

# Install deps if missing
if [ ! -d "$ROOT/server/node_modules" ]; then
  echo "[setup] Installing server dependencies..."
  npm install --prefix "$ROOT/server"
fi
if [ ! -d "$ROOT/client/node_modules" ]; then
  echo "[setup] Installing client dependencies..."
  npm install --prefix "$ROOT/client"
fi
if [ ! -d "$ROOT/node_modules" ]; then
  echo "[setup] Installing root dependencies..."
  npm install --prefix "$ROOT"
fi

# Seed admin
echo "[setup] Seeding admin account..."
node "$ROOT/server/db/seed.js"

echo ""
echo "Starting servers..."
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:5000"
echo "  Admin    → http://localhost:5173/admin/login"
echo ""

# Start backend in background
node "$ROOT/server/index.js" &
SERVER_PID=$!

# Start frontend (foreground, Ctrl+C stops both)
trap "kill $SERVER_PID 2>/dev/null" EXIT
npm run dev --prefix "$ROOT/client"
