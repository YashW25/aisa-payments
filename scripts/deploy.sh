#!/usr/bin/env bash
set -e

echo "=== Deploying AISA Payment Portal ==="

# 1. Pull latest code
echo "Pulling latest code from Git..."
git pull origin main

# 2. Build and start containers
echo "Building and starting Docker containers..."
docker compose build --no-cache app
docker compose up -d

# 3. Check container status
echo "Checking status..."
docker compose ps

echo "=== Deployment Completed Successfully ==="
