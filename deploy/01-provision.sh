#!/bin/bash
# 01 — Provision dunamismax.com on the PHP stack: system user, directories,
# MySQL database and accounts, protected configuration, and the PHP-FPM pool.
# Idempotent: existing accounts and configuration files are kept.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_root

for command in php php-fpm8.5 mysql runuser "$CADDY"; do
    command -v "$command" >/dev/null || { echo "Missing required command: $command" >&2; exit 1; }
done
id caddy >/dev/null

log "System user"
if id "$SITE_USER" >/dev/null 2>&1; then
    log "Reusing existing $SITE_USER user ($(getent passwd "$SITE_USER" | cut -d: -f6)); 05-decommission moves its home off /opt."
else
    useradd --system --user-group --home-dir /nonexistent --no-create-home --shell /usr/sbin/nologin "$SITE_USER"
fi

log "Directories"
install -d -o root -g root -m 0755 "$BASE" "$BASE/releases" "$BASE/shared"
install -d -o root -g "$OWNER" -m 0750 "$BASE/shared/storage"
install -d -o "$OWNER" -g "$OWNER" -m 0700 "$BASE/shared/storage/drafts"
# Other-execute lets the owner reach publishing.env by name without listing.
install -d -o root -g root -m 0751 "$ETC"
install -d -o root -g "$OWNER" -m 0750 "$BACKUPS"

log "MySQL database"
mysql_root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"

# provision_account USER ENV_FILE FILE_OWNER FILE_GROUP FILE_MODE
# Creates the account and its env file together. The password is generated
# here, passed to MySQL on stdin, and never printed or placed in argv.
provision_account() {
    local user=$1 file=$2 file_owner=$3 file_group=$4 mode=$5 password tmp
    if mysql_user_exists "$user" && [ -f "$file" ]; then
        log "$user and $file already exist; keeping them."
    else
        password=$(php -r 'echo bin2hex(random_bytes(32));')
        backup "$file"
        if mysql_user_exists "$user"; then
            log "$user exists without $file; rotating its password."
            mysql_root <<<"ALTER USER '$user'@'127.0.0.1' IDENTIFIED BY '$password';"
        else
            mysql_root <<<"CREATE USER '$user'@'127.0.0.1' IDENTIFIED BY '$password';"
        fi
        tmp=$(mktemp "$ETC/.env.XXXXXX")
        {
            if [ "$user" = "$DB_WEB_USER" ]; then
                printf 'APP_ENV=production\nAPP_URL=https://%s\n' "$DOMAIN"
            fi
            printf 'DB_HOST=127.0.0.1\nDB_PORT=3306\nDB_NAME=%s\nDB_USER=%s\nDB_PASSWORD=%s\n' "$DB_NAME" "$user" "$password"
        } > "$tmp"
        chown "$file_owner:$file_group" "$tmp"
        chmod "$mode" "$tmp"
        mv -f "$tmp" "$file"
        log "Created $user and $file (password not shown)."
    fi
    chown "$file_owner:$file_group" "$file"
    chmod "$mode" "$file"
}

log "MySQL accounts"
provision_account "$DB_WEB_USER" "$ETC/site.env" root "$SITE_USER" 0640
provision_account "$DB_PUBLISH_USER" "$ETC/publishing.env" "$OWNER" "$OWNER" 0600
# The website only reads. The publisher's table grant is added by 02 once the
# posts table exists.
mysql_root -e "GRANT SELECT ON $DB_NAME.* TO '$DB_WEB_USER'@'127.0.0.1'"

log "PHP-FPM pool"
backup "$ETC/php-fpm.conf" "$POOL_LINK"
pool_link_existed=no
if [ -e "$POOL_LINK" ] || [ -L "$POOL_LINK" ]; then
    pool_link_existed=yes
fi
install -o root -g root -m 0644 "$DEPLOY_DIR/php-fpm.conf" "$ETC/php-fpm.conf"
ln -sfn "$ETC/php-fpm.conf" "$POOL_LINK"
restore_pool() {
    echo "PHP-FPM check or reload failed; restoring the previous pool configuration." >&2
    if [ -e "$BACKUP_DIR$ETC/php-fpm.conf" ]; then cp -a "$BACKUP_DIR$ETC/php-fpm.conf" "$ETC/php-fpm.conf"; else rm -f "$ETC/php-fpm.conf"; fi
    if [ "$pool_link_existed" = yes ]; then cp -a "$BACKUP_DIR$POOL_LINK" "$POOL_LINK"; else rm -f "$POOL_LINK"; fi
    php-fpm8.5 -t && systemctl reload php8.5-fpm
    exit 1
}
php_fpm_reload || restore_pool
for _ in $(seq 1 50); do
    [ -S "$SOCKET" ] && break
    sleep 0.1
done
[ -S "$SOCKET" ] || { echo "Socket $SOCKET did not appear." >&2; restore_pool; }
socket_state=$(stat -c '%U:%G %a' "$SOCKET")
[ "$socket_state" = "caddy:caddy 600" ] || { echo "Unexpected socket ownership/mode: $socket_state" >&2; restore_pool; }

cat <<EOF

Provisioning complete.
Verify:
  ls -la $BASE $ETC
  stat -c '%U:%G %a %n' $SOCKET $ETC/site.env $ETC/publishing.env
  mysql -e "SHOW GRANTS FOR '$DB_WEB_USER'@'127.0.0.1'; SHOW GRANTS FOR '$DB_PUBLISH_USER'@'127.0.0.1';"
Backups of changed files (if any): $BACKUP_DIR
Next: sudo bash $DEPLOY_DIR/02-migrate-data.sh
Rollback (before cutover only; nothing public uses this yet):
  rm -f $POOL_LINK && php-fpm8.5 -t && systemctl reload php8.5-fpm
  mysql -e "DROP USER IF EXISTS '$DB_WEB_USER'@'127.0.0.1', '$DB_PUBLISH_USER'@'127.0.0.1'; DROP DATABASE IF EXISTS $DB_NAME;"
  rm -rf $ETC $BASE
EOF
