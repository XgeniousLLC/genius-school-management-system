---
title: cPanel / Shared Hosting Installation
---

# cPanel / Shared Hosting Installation

This guide walks you through installing Genius SMS on a shared hosting account that uses cPanel. Most popular hosting providers (Namecheap, Hostinger, SiteGround, GreenGeeks, etc.) use cPanel.

> **Before you start** — Shared hosting must support **PHP 8.3** and allow **SSH terminal access** (or at minimum allow running Composer). If your host only offers PHP 7.x, you cannot run this application.

---

## What You Need

- A hosting account with cPanel access
- SSH / Terminal access (check your cPanel for "Terminal" under Advanced)
- PHP 8.3 enabled for your account
- A domain or subdomain pointed to your hosting

---

## Step 1 — Create a MySQL Database

1. Log into **cPanel**.
2. Go to **MySQL Databases**.
3. Under **Create New Database**, enter a name (e.g. `youruser_geniussms`) and click **Create Database**.
4. Under **MySQL Users**, create a new user with a strong password.
5. Under **Add User to Database**, add the new user to the new database and grant **All Privileges**.

Write down:
- Database name
- Database username
- Database password
- Host (usually `localhost`)

---

## Step 2 — Set PHP Version to 8.3

1. In cPanel, go to **MultiPHP Manager** (or **PHP Selector / Select PHP Version**).
2. Find your domain in the list.
3. Set the PHP version to **8.3**.
4. Save.

Also go to **MultiPHP INI Editor** and set:
```
memory_limit = 256M
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
```

---

## Step 3 — Upload the Application Files

### Option A — Upload via File Manager (no SSH needed for upload)

1. Download the Genius SMS release ZIP from GitHub.
2. In cPanel, open **File Manager**.
3. Navigate to your home directory (`/home/yourusername/`).
4. Create a new folder called `genius-sms` (outside `public_html` — this is important for security).
5. Upload the ZIP file into `genius-sms` and extract it.

Your structure should look like:
```
/home/yourusername/
  genius-sms/          ← application files live here
    app/
    bootstrap/
    config/
    database/
    public/            ← this folder goes into public_html
    resources/
    storage/
    .env
    artisan
    composer.json
    ...
  public_html/         ← web root (currently empty or existing site)
```

### Option B — Clone via SSH

If your host allows Git:

```bash
cd ~
git clone https://github.com/xgenious/genius-sms.git genius-sms
```

---

## Step 4 — Point Your Domain to the Public Folder

The Laravel `public/` directory must be the web root for your domain. You have two options:

### Option A — Use a Subdomain Pointed to the Public Folder

1. In cPanel, go to **Subdomains** (or **Addon Domains**).
2. Create a subdomain like `school.yourdomain.com`.
3. Set the **Document Root** to `/home/yourusername/genius-sms/public`.
4. Save.

### Option B — Use Your Main Domain

1. In cPanel, go to **File Manager** and open `public_html`.
2. Move or copy everything from `genius-sms/public/` into `public_html/`.
3. Edit `public_html/index.php` — change the two paths at the top to point to your app folder:

```php
require __DIR__.'/../genius-sms/vendor/autoload.php';
$app = require_once __DIR__.'/../genius-sms/bootstrap/app.php';
```

4. Move the `.htaccess` from `genius-sms/public/` into `public_html/` as well.

> **Option A (subdomain) is simpler and recommended.**

---

## Step 5 — Configure the Environment File

In **File Manager**, navigate to `/home/yourusername/genius-sms/`.

1. Find `.env.example`, copy it, and rename the copy to `.env`.
2. Right-click `.env` and click **Edit**.

Update these values:

```
APP_NAME="Genius SMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://school.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=youruser_geniussms
DB_USERNAME=youruser_dbuser
DB_PASSWORD=your_db_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_FROM_ADDRESS=noreply@yourdomain.com

SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=your_admin_password
```

> **Note:** On shared hosting, Redis may not be available. Use `CACHE_DRIVER=file`, `SESSION_DRIVER=file`, and `QUEUE_CONNECTION=database` as shown above.

Save the file.

---

## Step 6 — Install PHP Dependencies via SSH

Open **Terminal** in cPanel (under Advanced → Terminal) or connect via SSH:

```bash
ssh yourusername@yourdomain.com
```

Navigate to the app folder:

```bash
cd ~/genius-sms
```

Install Composer dependencies:

```bash
composer install --no-dev --optimize-autoloader
```

If Composer is not installed on the server, install it first:

```bash
curl -sS https://getcomposer.org/installer | php
php composer.phar install --no-dev --optimize-autoloader
```

---

## Step 7 — Generate Application Key

```bash
php artisan key:generate
```

---

## Step 8 — Run Migrations and Seeders

```bash
php artisan migrate --force
php artisan db:seed --force
```

This creates all the database tables and sets up the initial super admin account.

---

## Step 9 — Build Frontend Assets

If Node.js is available on your server:

```bash
npm install
npm run build
```

**If Node.js is not available on the server** (common on shared hosting), build locally on your computer and upload the compiled files:

On your local machine:
```bash
npm install
npm run build
```

Then upload the entire `public/build/` folder to `genius-sms/public/build/` on the server using File Manager or FTP.

---

## Step 10 — Set File Permissions

In the SSH terminal:

```bash
chmod -R 775 ~/genius-sms/storage
chmod -R 775 ~/genius-sms/bootstrap/cache
```

Or in **File Manager**: right-click the `storage` folder → **Change Permissions** → set to `755` recursively.

---

## Step 11 — Create the Storage Symlink

```bash
cd ~/genius-sms
php artisan storage:link
```

This links `public/storage` to `storage/app/public` so uploaded files (logos, profile photos) are accessible.

---

## Step 12 — Optimise for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Step 13 — Set Up Cron Job

See the [Cron Job Setup](./cron-jobs) guide to configure the Laravel scheduler in cPanel.

---

## First Login

Open your browser and go to your domain (e.g. `https://school.yourdomain.com`).

Log in with:
- **Email:** value of `SUPER_ADMIN_EMAIL` in your `.env`
- **Password:** value of `SUPER_ADMIN_PASSWORD`

---

## Updating the Application

When a new version is released:

```bash
cd ~/genius-sms
git pull origin main

composer install --no-dev --optimize-autoloader

# Rebuild frontend (or upload the new public/build/ folder)
npm install && npm run build

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Troubleshooting

### 500 Internal Server Error

Check the Laravel log:
```bash
tail -f ~/genius-sms/storage/logs/laravel.log
```
Also check cPanel → **Error Logs**.

### "Class not found" or composer errors
```bash
composer dump-autoload --optimize
```

### Uploaded images not showing
```bash
php artisan storage:link
```
Make sure the `public/storage` symlink exists.

### .htaccess not working
In cPanel → **File Manager**, make sure the `.htaccess` file exists in your web root (`public_html` or the domain's document root). Enable **Show Hidden Files** in File Manager to see it.

### Sessions or cache not working
On shared hosting, set `CACHE_DRIVER=file` and `SESSION_DRIVER=file` in `.env` — Redis is often not available.
