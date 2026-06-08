# FlipSwitch Website

Laravel 11 + Inertia + React project template for the FlipSwitch company website.

## Stack

- Laravel 11
- Inertia Laravel
- React 19 + TypeScript
- Vite
- GSAP, Lenis, Framer Motion
- Filament admin panel
- Spatie Sitemap / Sluggable
- Ziggy

## Project Docs

- `architecture.md` — technical architecture
- `messaging.md` — brand messaging and copy rules
- `Brand Identity Doc.md` — brand foundation
- `design.md` — to be created after design assets are provided

## Local Setup

```bash
composer install
npm install
php artisan key:generate
php artisan migrate
npm run dev
php artisan serve
```

Admin panel:

```bash
php artisan make:filament-user
```

Then visit `/admin`.

## Verification

```bash
php artisan route:list --except-vendor
npm run typecheck
npm run build
```

## Local Database Note

The scaffold currently uses SQLite through `.env`.

If `php artisan migrate` fails with `could not find driver`, enable the PHP SQLite extension (`pdo_sqlite`) or switch `.env` to MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flipswitch
DB_USERNAME=root
DB_PASSWORD=
```

## Current Template Scope

The public site includes starter routes for:

- `/`
- `/about`
- `/services`
- `/services/{slug}`
- `/work`
- `/contact`

The admin panel includes a starter Lead Inbox resource for contact submissions.
