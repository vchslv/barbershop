# Barbershop — haircut booking

A small web app for booking a haircut.

- **Frontend:** Vue 3 + TypeScript + Vite + Pinia + Vue Router + Axios + vue-i18n + Tailwind CSS
- **Backend:** Laravel 10 (API) + SQLite
- **Run:** Docker Compose, or PHP and Node locally

## Features

- choose a service and a barber
- see free slots (10:00–20:00)
- create a booking (signed-in clients only)
- a client can see and cancel their own upcoming bookings
- an admin panel at `/admin` to edit every booking
- UI language: English
- clients register with a phone number and a password
- the admin panel is limited to the admin role

### Client

- Register: http://localhost:8080/register (`name`, `phone`, `password`)
- Sign in: http://localhost:8080/login (`phone`, `password`)

### Admin

- Sign-in URL: http://localhost:8080/admin/login
- Email: `admin@barbershop.test`
- Password: `admin123`

Override these with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend `.env` before seeding.

## Frontend layout

```
frontend/src/
  components/       # shared UI
  modules/          # feature pages + colocated i18n
  plugins/          # pinia, i18n
  router/
  services/         # HTTP API
  shared/           # http client, i18n helpers
  store/            # Pinia stores
  style/
  utils/
```

## Quick start (Docker)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

Open http://localhost:8080

Stop:

```bash
docker compose down
```

The SQLite database lives in a Docker volume and survives container restarts.

Reset the database:

```bash
docker compose down -v
docker compose up --build
```

## Run locally (without Docker)

Requirements: PHP 8.1+, Composer, Node.js 22+, npm.

### Backend

```bash
cd backend
composer install
cp .env.example .env
touch database/database.sqlite
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API is available at http://127.0.0.1:8000.

`php artisan key:generate` writes `APP_KEY` into `.env`. Do not commit that file. `migrate --seed` creates the tables, the services, the barbers, and the admin user.

Optional: set `APP_TIMEZONE` in `backend/.env` (for example `Asia/Novosibirsk`) so past time slots are rejected in your local time. The default is `UTC`.

Admin login after seeding:

- URL: http://127.0.0.1:5173/admin/login
- Email: `admin@barbershop.test`
- Password: `admin123`

Override them with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before seeding.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173. The dev server calls the API at `http://127.0.0.1:8000/api`. To point it somewhere else, set `VITE_API_URL` in `frontend/.env`.

## API

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/register` | Register a client |
| POST | `/api/login` | Client sign-in |
| POST | `/api/admin/login` | Admin sign-in |
| GET | `/api/services` | List services |
| GET | `/api/barbers` | List active barbers |
| GET | `/api/appointments/slots` | Free slots |
| POST | `/api/appointments` | Create a booking (signed in) |
| GET | `/api/my/appointments` | The signed-in client's bookings |
| POST | `/api/my/appointments/{id}/cancel` | Cancel the client's own booking |
| GET | `/api/appointments` | All bookings (admin) |
| GET | `/api/appointments/{id}` | One booking (admin) |
| PUT | `/api/appointments/{id}` | Update a booking (admin) |
| DELETE | `/api/appointments/{id}` | Cancel a booking (admin) |

## Layout

```
barbershop/
├── docker-compose.yml
├── backend/          # Laravel API
│   ├── Dockerfile
│   └── docker/entrypoint.sh
└── frontend/         # Vue 3 + Nginx
    ├── Dockerfile
    └── nginx.conf
```
