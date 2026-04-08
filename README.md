# Lumi Panel

## 1. Project Overview

Lumi Panel is the Lumix-hosted game server management panel based on Pterodactyl, with backend services in Laravel and frontend assets built with TypeScript and webpack.

## 2. Prerequisites

- PHP 8.2 or 8.3
- Composer 2.x
- Node.js 22+
- Yarn 1.x (Classic)
- MySQL or MariaDB (for local app data)
- OS: Windows, macOS, or Linux

## 3. Installation

Run these commands from the project root:

```bash
composer install
yarn install
```

Set up your app key and database schema:

```bash
php artisan key:generate
php artisan migrate
```

## 4. Running the Project (Development)

Run local build steps, then test on the VM.

Build assets before upload:

```bash
yarn run build
```

Prepare backend files before upload:

```bash
composer install --no-dev --optimize-autoloader
```

Expected result:

- Project files are ready to upload to the VM
- VM serves the updated panel after upload

## 5. Building for Production

```bash
yarn run build:production
```

This generates optimized assets in `public/assets`.

## 6. Preview or Start Production Build

This project does not use localhost preview for team workflow.

Deploy and validate on the VM:

```bash
# from your local repo after changes
yarn run build:production
```

Upload the updated project to the VM and restart required services on the VM.

Use this rule for pushes:

- Push only after the VM works as expected
- If deployment breaks, re-download a clean copy from GitHub and re-upload to the VM

## 7. Environment Variables

Configure environment variables on the VM.

You need a `.env` file in the VM project directory.

If `.env.example` exists on the VM:

```bash
cp .env.example .env
```

If you must edit `.env` from Windows before upload:

```powershell
Copy-Item .env.example .env
```

Minimum required keys:

```env
APP_NAME="Lumi Panel"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-panel-domain

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

Then run:

```bash
php artisan key:generate
```

## 8. Project Structure

- `app/`: Laravel application code (controllers, services, models, jobs)
- `config/`: Framework and application configuration
- `database/`: Migrations, seeders, and factories
- `resources/scripts/`: React/TypeScript frontend source
- `resources/views/`: Blade templates
- `routes/`: Route definitions
- `public/`: Public web root and compiled frontend assets
- `storage/`: Logs, cache, and runtime files

## 9. Common Issues / Troubleshooting

- Missing frontend manifest or asset errors:

```bash
yarn run build:production
```

- Dependency issues after branch switch:

```bash
rm -rf vendor node_modules
composer install
yarn install
```

- Windows PowerShell cleanup alternative:

```powershell
Remove-Item -Recurse -Force vendor,node_modules
composer install
yarn install
```

- VM deploy fails after upload:

```text
1. Re-download a clean copy from GitHub.
2. Apply the same change again.
3. Rebuild assets.
4. Re-upload to the VM.
```

- Push safety rule:

```text
Only push when the VM deployment is confirmed working.
```

- Migration errors:

```bash
php artisan migrate:fresh
```
