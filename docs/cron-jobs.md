---
title: Cron Job Setup
---

# Cron Job Setup

The Laravel scheduler runs recurring background tasks — attendance reminders, report generation, clearing expired sessions, and more. It requires a single cron entry to work.

---

## How It Works

Laravel uses one cron entry that runs every minute. Laravel itself then decides which scheduled tasks are due and runs them. You do not need a separate cron entry for each task.

---

## Setting Up on cPanel (Shared Hosting)

1. Log into **cPanel**.
2. Go to **Cron Jobs** (under Advanced).
3. Under **Add New Cron Job**, set the timing to **Every Minute**:

   | Field | Value |
   |---|---|
   | Minute | `*` |
   | Hour | `*` |
   | Day | `*` |
   | Month | `*` |
   | Weekday | `*` |

4. In the **Command** field, enter:

```
/usr/local/bin/php /home/yourusername/genius-sms/artisan schedule:run >> /dev/null 2>&1
```

Replace `yourusername` with your actual cPanel username and `genius-sms` with the folder name where you installed the app.

5. Click **Add New Cron Job**.

> **Finding the correct PHP path:** In cPanel Terminal, run `which php` or `which php8.3` to find the exact PHP binary path. Common paths are `/usr/local/bin/php` or `/usr/bin/php8.3`.

---

## Setting Up on VPS (Ubuntu with Supervisor)

On a VPS, add the cron entry for the `www-data` user:

```bash
sudo crontab -e -u www-data
```

Add this line:

```
* * * * * php /var/www/genius-sms/artisan schedule:run >> /dev/null 2>&1
```

Save and exit.

Verify the cron is registered:

```bash
sudo crontab -l -u www-data
```

---

## What the Scheduler Does

Once the cron is running, these tasks are automated:

| Task | Frequency | Description |
|---|---|---|
| Fee reminders | Daily | Sends SMS/email to parents with outstanding balances |
| Session cleanup | Daily | Clears expired user sessions from the database |
| Attendance summary | Weekly | Generates weekly attendance digest for admins |
| Log pruning | Daily | Removes old log entries to save disk space |
| Subscription checks | Daily | Checks and updates subscription/package status |

---

## Testing the Scheduler

To manually trigger the scheduler and confirm it works, run this in your SSH terminal:

```bash
cd ~/genius-sms
php artisan schedule:run
```

You should see output listing which tasks ran (or "No scheduled commands are ready to run" if nothing is due right now — that is normal).

To see all scheduled tasks defined in the application:

```bash
php artisan schedule:list
```

---

## Queue Worker Cron (Database Driver)

If you are on **shared hosting** and using `QUEUE_CONNECTION=database` (no Redis/Horizon), background jobs like PDF generation and email blasts are processed via a queue worker. Add a second cron entry to process the queue:

**In cPanel Cron Jobs**, add another entry (every minute):

```
/usr/local/bin/php /home/yourusername/genius-sms/artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

> `--stop-when-empty` makes the worker exit after processing all pending jobs, which is safe for shared hosting where long-running processes may be killed.

---

## Queue Worker on VPS (Laravel Horizon)

On a VPS, Laravel Horizon manages the queue worker as a persistent process via Supervisor — you do not need a cron entry for the queue. See the [VPS Installation Guide](./installation#step-16-set-up-the-queue-worker-laravel-horizon) for setup details.

---

## Verifying Cron Is Running

After adding the cron, wait a few minutes and check the Laravel log for scheduler activity:

```bash
tail -f ~/genius-sms/storage/logs/laravel.log
```

You can also check cPanel → **Cron Jobs** to confirm the entry is saved.
