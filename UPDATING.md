# Updating lumi-panel

This is a Pterodactyl fork with a **full custom theme**. Updating needs care so the
UI survives and (on the live server) so customer data is never touched.

## ⚠️ Never do this
- **Do not** update the live server by extracting the stock `panel.tar.gz`. That reverts
  the theme to basic Pterodactyl (both compiled assets *and* source). It is what caused
  the "basic looks" incident.
- **Do not** `git merge` an upstream tag — the fork has unrelated history; it errors out.
  (Don't force it with `--allow-unrelated-histories`.)

## Updating the code (local) to a new Pterodactyl version

```bash
git fetch --tags upstream              # upstream = https://github.com/pterodactyl/panel.git
git checkout -B update-<NEW> main
# CURRENT = version main is on now; NEW = target tag, e.g. v1.12.5
git diff v<CURRENT> v<NEW> -- . ':(exclude)tests/' ':(exclude).github/' | git apply --whitespace=nowarn
# bump 'version' in config/app.php to <NEW>
git add -A -- ':(exclude).claude/settings.local.json'
git commit -m "Update to Pterodactyl <NEW>"
git checkout main && git merge --ff-only update-<NEW>
```

The `tests/` and `.github/` excludes are required (those files were removed from the fork).
Upstream patch versions only touch backend files — the theme is never affected.

## Deploying to the live server (has customers)

Rule: **overlay the code, never the data.**

**Drag/upload:** `app/ resources/ public/ routes/ config/ database/ bootstrap/`
`composer.json composer.lock package.json yarn.lock webpack.config.js tailwind.config.js`
`tsconfig.json babel.config.js postcss.config.js artisan`

**Never upload:** `.env`, `storage/`, `vendor/`, `node_modules/`, `.git/`, `tests/`, `panel.tar.gz`

```bash
mysqldump -u pterodactyl -p panel > ~/panel-db-backup.sql   # back up first
tar -czf ~/panel-files-backup.tar.gz /var/www/pterodactyl
cd /var/www/pterodactyl && php artisan down
#  --- upload files (overlay; do not delete the folder first) ---
composer install --no-dev --optimize-autoloader
yarn install
yarn build:production        # rebuilds the custom theme into public/assets
php artisan migrate --force
php artisan view:clear && php artisan config:clear && php artisan route:clear
php artisan queue:restart
chown -R www-data:www-data /var/www/pterodactyl
php artisan up
```
