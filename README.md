# Dough Reminder

A static, client-side sourdough countdown PWA. Production is hosted on Cloudflare Pages over HTTPS. No build step or server API is needed. For local testing, run `python -m http.server 8000` and open `http://localhost:8000/`.

Start autolyse, then mark each action done to start the next countdown: 30-minute autolyse, four 30-minute stretch-and-fold intervals, 2-hour bulk fermentation, then a fridge reminder at 8:00 AM the following day. Finish bake is a manual step. Progress and deadlines are stored in this browser's localStorage. Reset clears the current bake.

Enable notifications from the app using its button. Notification permission requires a secure context (HTTPS or localhost). On mobile, install through the browser's Add to Home Screen / Install app menu. **No background alarm is scheduled:** a notification fires only when the PWA is running at or after a deadline. A closed PWA, suspended page, or locked phone cannot reliably notify at the appointed time. Reopening restores the countdown and triggers an overdue notification once, if permission is granted. iOS Web Push for installed Home Screen apps requires a push server to deliver notifications when closed; this client-only app does not use Web Push. Use a separate alarm for critical reminders. Clearing browser data removes progress.

Photos and Instagram exports are not part of this reminder-only version.

## Cloudflare Pages deployment

The workflow in `.github/workflows/deploy.yml` publishes the exact tagged commit when a `v*` tag is pushed to GitHub. Ordinary branch pushes do not deploy. The deploy command sets `--branch=main`, so each tagged build becomes the production deployment rather than a preview.

The `dough-reminder` Direct Upload Pages project is live at https://dough-reminder.pages.dev/ with production branch `main`. GitHub Actions, not Cloudflare Git integration, publishes future versions. To enable tagged releases:

1. Create a Cloudflare API token with **Account → Cloudflare Pages → Edit** permission scoped to the account that owns `dough-reminder` (`80be241359edfb86a57a276a645587ff`). Use the token value itself, without `Bearer ` or surrounding quotes.
2. In `iqbalmineraltown/dough-reminder` on GitHub, set the **Actions** repository secret `CLOUDFLARE_API_TOKEN` (not Codespaces secrets). The account ID is configured in the workflow. Allow GitHub Actions to run in repository settings.
3. From a commit containing the workflow, run `git tag v1.0.3` and `git push origin v1.0.3` (or use the next unused version). Subsequent `v*` tags deploy automatically; check the **Deploy tagged release** workflow and the production URL.

Do not reuse a tag to deploy a different commit: create a new version tag. Keep Cloudflare credentials in GitHub Secrets, never in this repository.
