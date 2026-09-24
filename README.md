# Dough Reminder

A static, client-side sourdough countdown PWA. Production is hosted on Cloudflare Pages over HTTPS. No build step or server API is needed. For local testing, run `python -m http.server 8000` and open `http://localhost:8000/`.

Start autolyse, then mark each action done to start the next countdown: 30-minute autolyse, four 30-minute stretch-and-fold intervals, 2-hour bulk fermentation, then a fridge reminder at 8:00 AM the following day. Finish bake is a manual step. Progress and deadlines are stored in this browser's localStorage. Reset clears the current bake.

Enable notifications from the app using its button. Notification permission requires a secure context (HTTPS or localhost). On mobile, install through the browser's Add to Home Screen / Install app menu. **No background alarm is scheduled:** a notification fires only when the PWA is running at or after a deadline. A closed PWA, suspended page, or locked phone cannot reliably notify at the appointed time. Reopening restores the countdown and triggers an overdue notification once, if permission is granted. iOS Web Push for installed Home Screen apps requires a push server to deliver notifications when closed; this client-only app does not use Web Push. Use a separate alarm for critical reminders. Clearing browser data removes progress.

Photos and Instagram exports are not part of this reminder-only version.

## Cloudflare Pages deployment

The workflow in `.github/workflows/deploy.yml` publishes the exact tagged commit when a `v*` tag is pushed to GitHub. Ordinary branch pushes do not deploy. The deploy command sets `--branch=main`, so each tagged build becomes the production deployment rather than a preview.

1. In Cloudflare, create a **Direct Upload** Pages project named `dough-reminder` with production branch `main`. Do not connect the Git integration; GitHub Actions uploads the files.
2. Create a Cloudflare API token with **Account → Cloudflare Pages → Edit** permission scoped to your account. Find the account ID in the Cloudflare dashboard.
3. In `iqbalmineraltown/dough-reminder` on GitHub, set repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Allow GitHub Actions to run in repository settings.
4. Push this workflow and static files to the repository's `main` branch. Release from a commit containing the workflow: `git tag v1.0.0` then `git push origin v1.0.0`. Subsequent `v*` tags deploy automatically; check the **Deploy tagged release** workflow and the production URL `https://dough-reminder.pages.dev`.

Do not reuse a tag to deploy a different commit: create a new version tag. Keep Cloudflare credentials in GitHub Secrets, never in this repository.
