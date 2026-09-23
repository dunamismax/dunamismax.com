#!/bin/bash
# Installed as /usr/local/sbin/dunamismax-backup by 03-deploy.sh and run daily
# by dunamismax-backup.timer. Archives contain credentials; never commit them.
set -euo pipefail
umask 077

base=/srv/www/dunamismax.com
destination=/var/backups/dunamismax
install -d -o root -g sawyer -m 0750 "$destination"
work=$(mktemp -d "$destination/.building.XXXXXXXX")
trap 'rm -rf -- "$work"' EXIT
stamp=$(date -u +%Y%m%dT%H%M%SZ)

mysqldump --single-transaction --no-tablespaces --set-gtid-purged=OFF \
    --routines --events --triggers dunamismax | gzip > "$work/database.sql.gz"
gzip -t "$work/database.sql.gz"
cp /etc/dunamismax/site.env "$work/site.env"
if [ -f /etc/dunamismax/publishing.env ]; then
    cp /etc/dunamismax/publishing.env "$work/publishing.env"
fi
cp /etc/dunamismax/php-fpm.conf "$work/php-fpm.conf"
if [ -f /etc/caddy/sites/dunamismax.com.caddy ]; then
    cp /etc/caddy/sites/dunamismax.com.caddy "$work/dunamismax.com.caddy"
fi
cp /usr/local/sbin/dunamismax-backup "$work/backup.sh"
cp /etc/systemd/system/dunamismax-backup.{service,timer} "$work/"
readlink -f "$base/current" > "$work/release.txt"
tar -czf "$work/application.tar.gz" -C "$base/current" --exclude='./.env' \
    --exclude='./storage' .
tar -czf "$work/storage.tar.gz" -C "$base/shared/storage" .
tar -czf "$destination/.dunamismax-$stamp.partial" -C "$work" .
mv "$destination/.dunamismax-$stamp.partial" "$destination/dunamismax-$stamp.tar.gz"
cd "$destination"
sha256sum "dunamismax-$stamp.tar.gz" > "dunamismax-$stamp.tar.gz.sha256"
chown root:sawyer "dunamismax-$stamp.tar.gz" "dunamismax-$stamp.tar.gz.sha256"
chmod 0640 "dunamismax-$stamp.tar.gz" "dunamismax-$stamp.tar.gz.sha256"
find "$destination" -maxdepth 1 -type f -name 'dunamismax-*.tar.gz*' -mtime +30 -delete
printf 'Backup created: %s/dunamismax-%s.tar.gz\n' "$destination" "$stamp"
