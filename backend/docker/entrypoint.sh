#!/bin/sh

set -eu

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ -z "${APP_KEY:-}" ]; then
    php artisan key:generate --force
fi

attempt=1

until php artisan migrate --force; do
    if [ "$attempt" -ge 10 ]; then
        exit 1
    fi

    attempt=$((attempt + 1))
    sleep 2
done

exec "$@"
