#!/bin/bash
set -e

echo "🚀 Starting application setup..."

# Run migrations and seed ONLY if RUN_SEED environment variable is true
if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Scaling database: Migrating fresh and seeding..."
    php artisan migrate:fresh --seed --force
else
    echo "📦 Running normal migrations..."
    php artisan migrate --force
fi

echo "🔗 Linking storage..."
php artisan storage:link

echo "🔥 Starting Apache"
exec apache2-foreground
