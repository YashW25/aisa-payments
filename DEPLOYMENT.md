# AISA Payment Portal — Ubuntu 24.04 LTS Docker Deployment Guide

This document outlines step-by-step instructions for deploying, updating, securing, and backing up the **AISA Payment Portal** on an Ubuntu 24.04 LTS server.

---

## 1. Prerequisites & Server Setup

### Target Directory Structure
Create the production application root at `/opt/aisa-payments`:

```bash
sudo mkdir -p /opt/aisa-payments
sudo chown -R $USER:$USER /opt/aisa-payments
cd /opt/aisa-payments
```

### Required Firewall Ports (UFW)
Ensure UFW allows only necessary public ports:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> **DO NOT** expose internal container ports (`3000`, `5432`, `9090`) to the public internet.

---

## 2. SSL Certificate Setup (Let's Encrypt + Certbot)

Initial SSL Certificate issuance:

```bash
sudo apt update
sudo apt install certbot -y

# Obtain SSL Certificate
sudo certbot certonly --standalone -d payments.isbmcoe.in --non-interactive --agree-tos --email admin@isbm.co.in

# Copy cert files to docker deployment directories
mkdir -p deployment/certbot/conf/live/payments.isbmcoe.in
sudo cp -L /etc/letsencrypt/live/payments.isbmcoe.in/* deployment/certbot/conf/live/payments.isbmcoe.in/
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env` and fill in production secrets:

```bash
cp .env.example .env
nano .env
```

Ensure `DATABASE_URL` points to your Supabase PostgreSQL database and `JWT_SECRET` is set securely.

---

## 4. Docker Deployment Commands

### Build and Start Services
```bash
docker compose build --no-cache
docker compose up -d
```

### Verify Container Health & Status
```bash
docker compose ps
docker compose logs -f app
```

---

## 5. Application Management Commands

### Viewing Logs
```bash
# App logs
docker compose logs -f app

# Nginx logs
docker compose logs -f nginx
```

### Updating the Application
Run the deployment script:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Restarting Services
```bash
docker compose restart
```

---

## 6. Backup & Recovery Procedure

### Manual Backup Command
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

Backups are saved to `/opt/aisa-payments/backups/aisa_data_backup_<TIMESTAMP>.tar.gz`.

### Restore Procedure
```bash
# Stop containers
docker compose down

# Restore uploads and data directory
tar -xzf /opt/aisa-payments/backups/aisa_data_backup_20260908_120000.tar.gz -C /opt/aisa-payments/

# Restart containers
docker compose up -d
```

---

## 7. DNS Configuration
Set an `A` record in your DNS manager pointing to your server's IPv4:

- **Type**: `A`
- **Name**: `payments.isbmcoe.in`
- **Value**: `<YOUR_UBUNTU_SERVER_PUBLIC_IPV4>`
