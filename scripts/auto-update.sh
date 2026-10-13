#!/bin/sh
# Pulls the latest site from GitHub and rebuilds it if anything changed.
# Run it from cron on the server, e.g. every 2 minutes:
#   */2 * * * * /path/to/repo/scripts/auto-update.sh >> /tmp/site-update.log 2>&1
set -e
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd "$(dirname "$0")/.."

git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && exit 0

echo "$(date -Is) updating to $(git rev-parse --short origin/main)"
git merge -q --ff-only origin/main
docker compose up -d --build
docker image prune -f >/dev/null
