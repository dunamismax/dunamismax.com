#!/bin/bash
# 02 — Migrate data: apply the MySQL schema and grant the publisher.
#
# No PostgreSQL rows are copied. The legacy database holds only the page_view
# analytics table, which is intentionally dropped; the old site had no blog
# posts; about, contact, and project content now live in views/. This script
# verifies that inventory so nothing unexpected is left behind.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_root
cd /   # postgres must be able to read the working directory

[ "$(mysql_root -e "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$DB_NAME'")" = 1 ] \
    || { echo "MySQL database $DB_NAME is missing; run 01-provision.sh first." >&2; exit 1; }
mysql_user_exists "$DB_PUBLISH_USER" \
    || { echo "$DB_PUBLISH_USER is missing; run 01-provision.sh first." >&2; exit 1; }

log "Legacy PostgreSQL inventory"
if runuser -u postgres -- psql -lqtA 2>/dev/null | cut -d'|' -f1 | grep -x "$DB_NAME" >/dev/null; then
    printf '    tables: %s\n' "$(pg_base_tables | tr '\n' ' ')"
    unexpected=$(pg_unexpected_tables)
    if [ -n "$unexpected" ]; then
        echo "Unexpected PostgreSQL tables need a migration plan before continuing: $unexpected" >&2
        exit 1
    fi
    if pg_base_tables | grep -x public.page_view >/dev/null; then
        printf '    page_view rows (not migrated, by request): %s\n' \
            "$(runuser -u postgres -- psql -d "$DB_NAME" -tAc 'SELECT COUNT(*) FROM page_view')"
    fi
else
    log "No PostgreSQL $DB_NAME database found; nothing to inventory."
fi

log "Backing up the MySQL database before schema changes"
install -d -m 0700 "$BACKUP_DIR"
mysqldump --single-transaction --no-tablespaces --set-gtid-purged=OFF "$DB_NAME" | gzip > "$BACKUP_DIR/mysql-$DB_NAME-before-schema.sql.gz"
gzip -t "$BACKUP_DIR/mysql-$DB_NAME-before-schema.sql.gz"

log "Applying database/schema.sql (CREATE TABLE IF NOT EXISTS; safe to re-run)"
mysql_root "$DB_NAME" < "$DEPLOY_DIR/../database/schema.sql"
mysql_root -e "GRANT SELECT, INSERT, UPDATE ON $DB_NAME.posts TO '$DB_PUBLISH_USER'@'127.0.0.1'"

cat <<EOF

Migration complete.
Verify:
  mysql -e "SHOW CREATE TABLE $DB_NAME.posts\\G; SELECT COUNT(*) FROM $DB_NAME.posts;"
  mysql -e "SHOW GRANTS FOR '$DB_WEB_USER'@'127.0.0.1'; SHOW GRANTS FOR '$DB_PUBLISH_USER'@'127.0.0.1';"
  sudo -u $OWNER php $REPO/bin/posts.php list      # prints []
Posts in MySQL now: $(mysql_root -e "SELECT COUNT(*) FROM $DB_NAME.posts")
Next: sudo bash $DEPLOY_DIR/03-deploy.sh
Rollback (only while posts is empty):
  mysql -e "REVOKE SELECT, INSERT, UPDATE ON $DB_NAME.posts FROM '$DB_PUBLISH_USER'@'127.0.0.1'; DROP TABLE $DB_NAME.posts;"
EOF
