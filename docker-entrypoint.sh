#!/bin/bash
set -e

echo "Starting Tech Pulse v2.0..."

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U ${POSTGRES_USER:-techpulseuser} > /dev/null 2>&1; do
    sleep 1
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if it doesn't exist
echo "Creating superuser (if needed)..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@techpulse.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
END

# Add sources if none exist
echo "Adding news sources (if needed)..."
python manage.py add_sources || echo "Sources already exist or command not available"

echo "Tech Pulse v2.0 is ready!"

# Execute the main command
exec "$@"