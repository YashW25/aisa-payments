#!/usr/bin/env bash
set -e

BACKUP_DIR="/opt/aisa-payments/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/aisa_data_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "=== Starting Backup of Local Uploads & Data ==="

# Create compressed tarball of /opt/aisa-payments/data
tar -czf "$BACKUP_FILE" -C /opt/aisa-payments data

echo "Backup created at: ${BACKUP_FILE}"

# Keep only the last 14 daily backups to preserve disk space
find "$BACKUP_DIR" -type f -name "aisa_data_backup_*.tar.gz" -mtime +14 -exec rm {} \;

echo "=== Backup Complete ==="
