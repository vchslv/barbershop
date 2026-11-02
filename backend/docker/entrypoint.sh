#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
  cp .env.example .env
fi

mkdir -p /data storage/framework/{cache,sessions,views} storage/logs bootstrap/cache storage/app
touch /data/database.sqlite
chmod -R 775 storage bootstrap/cache /data

sed -i 's/^APP_ENV=.*/APP_ENV=production/' .env
sed -i 's/^APP_DEBUG=.*/APP_DEBUG=false/' .env
sed -i 's|^APP_URL=.*|APP_URL=http://localhost:8080|' .env
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=sqlite/' .env

if grep -q '^DB_DATABASE=' .env; then
  sed -i 's|^DB_DATABASE=.*|DB_DATABASE=/data/database.sqlite|' .env
else
  echo 'DB_DATABASE=/data/database.sqlite' >> .env
fi

if [ -f /data/app_key ]; then
  APP_KEY_VALUE=$(cat /data/app_key)
  if grep -q '^APP_KEY=' .env; then
    sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY_VALUE}|" .env
  else
    echo "APP_KEY=${APP_KEY_VALUE}" >> .env
  fi
else
  php artisan key:generate --force --no-interaction
  grep '^APP_KEY=' .env | sed 's/^APP_KEY=//' > /data/app_key
fi

php artisan config:clear
php artisan migrate --force --no-interaction

php artisan db:seed --force --no-interaction

exec "$@"
