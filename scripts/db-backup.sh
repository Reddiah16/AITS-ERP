#!/bin/sh
# Database backup script for PostgreSQL
# Runs inside the Postgres/Host environment and uploads backups to AWS S3

DB_NAME="aits_erp_production"
DB_USER="aits_admin"
S3_BUCKET="aits-erp-db-backups"
BACKUP_DIR="/tmp/db_backups"

mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%F_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

echo "Starting database backup for $DB_NAME at $(date)"

# Take Postgres Dump and compress it
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "✓ Database dump created successfully: $BACKUP_FILE"
  
  # Upload to S3 if aws CLI is installed/configured
  if command -v aws >/dev/null 2>&1; then
    aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/
    if [ $? -eq 0 ]; then
      echo "✓ Backup successfully uploaded to S3 bucket: s3://$S3_BUCKET/"
      rm -f $BACKUP_FILE
    else
      echo "❌ Failed to upload backup to AWS S3"
    fi
  else
    echo "⚠ AWS CLI not detected. Backup stored locally at $BACKUP_FILE"
  fi
else
  echo "❌ Database backup dump failed!"
  exit 1
fi
