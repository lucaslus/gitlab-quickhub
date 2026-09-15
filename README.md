# GitLab QuickHub

<p>
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

[![Test and publish userscript](https://github.com/lucaslus/gitlab-quickhub/actions/workflows/publish.yml/badge.svg)](https://github.com/lucaslus/gitlab-quickhub/actions/workflows/publish.yml)
[![Version](https://img.shields.io/badge/version-3.16.1-blue.svg)](package.json)
[![Tampermonkey](https://img.shields.io/badge/userscript-Tampermonkey-green.svg)](https://lucaslus.github.io/gitlab-quickhub/gitlab-quickhub.user.js)

A browser userscript for HTTPS GitLab instances. It organizes your frequently used repositories based on your recently created Merge Requests (MRs), pairs personal forks with their upstream repositories, and provides global project search, favorites, active branch merge status tracking, and quick repository actions.

The panel's main title is displayed as `gitcube`, with current views distinguished by subtitles and tab highlights. The "Node G" icon in the upper-left corner serves as the Home button—clicking it clears searches or settings and returns to the default Recent MR view.

- **Direct Install**: <https://lucaslus.github.io/gitlab-quickhub/gitlab-quickhub.user.js>
- **Installation Page**: <https://lucaslus.github.io/gitlab-quickhub/>
- **Source**: [src/gitlab-quickhub.user.js](src/gitlab-quickhub.user.js)
- **Tests**: [test/gitlab-quickhub.test.js](test/gitlab-quickhub.test.js)
- **Current Version**: defined in [package.json](package.json)

---

## What Problem Does It Solve?

In enterprise GitLab instances, default project activity rankings rarely reflect "what I am currently working on." GitLab QuickHub uses your MR creation timestamps as the primary ranking factor:

- **Instant access** to projects you've recently submitted MRs to, rather than global organization-wide activity.
- **Automatic pairing** of your personal forks with their original upstream repositories.
- **Global search** across all GitLab projects accessible by your account.
- **Owned search filter** to search only your repositories while still pairing upstreams.
- **Favorites / Bookmarks** to keep key repositories readily available regardless of recent activity.
- **Automated branch merge status checks** verifying whether active feature branches in forks have been merged into upstream environments (`dev`, `test`, `blue`, `master`).
- **One-click shortcuts** to New MR, My MRs, CI Pipelines, and repository URL copying.

---

## Features

### Recent MR Repositories
- Queries GitLab v4 APIs for MRs created by the current user (`scope=created_by_me`).
- Ranks projects by MR `created_at` in descending order, avoiding stale activity metrics.
- Groups personal forks and their upstreams under a single card (up to 20 groups).
- Displays latest MR title, recent MR count, and direct navigation links.

### GitLab Search & Filtering
- Triggers search automatically after typing at least 2 characters (with 350ms debouncing).
- "Only my repos & upstream" is checked by default for focused results.
- Uncheck to search all accessible projects across the entire GitLab instance.
- Cancels in-flight requests on new inputs to prevent race conditions.

### My Open MRs
- Click the MR icon in the panel header ("My open MRs") to list MRs **created by you** that are still `opened`, including drafts.
- Shows each MR's title, target repository, MR number, source/target branches, and creation date, newest first.
- Click the title or **Open MR** to open the MR in a new tab; **Copy link** copies its detail URL and shows success or failure feedback.
- Fetches 50 MRs per page. Use **Load more MRs** for older open MRs, independently of the Recent view's 20-project / 5-page limits. The count shows loaded MRs, not the account-wide total.
- Reloads from page one whenever you enter or reopen this view, or click Refresh. Results stay in page memory only; they do not use the recent-project cache or add local storage keys.
- Loading, empty results, API errors, and invalid responses are shown explicitly. A failed next page keeps the loaded list and can be retried with **Load more MRs**.

### Quick Actions Menu
Each repository item has a quick-star button on the right, plus an overflow `…` menu:
- **Select Branch & New MR**: Open the New MR page in the selected repository without locking the target branch.
- **My MRs**: Open the MR list pre-filtered by the current author.
- **View Pipelines**: Jump directly to CI/CD pipelines.
- **Copy Repository URL**: Copy the HTTPS URL for the fork or upstream.

### Favorites
- Click the star icon in the header to view bookmarked repositories; click again to return.
- Forks and upstreams can be starred independently with clear badges.
- Bookmarks are stored in `localStorage` scoped to the current GitLab origin (zero extra network calls).

### Branch Merge Status
- Click the branch icon in the header to open Branch Status view.
- Automatically selects the 10 most recent forks owned by you (`owned=true`, sorted by `last_activity_at`).
- Automatically scans the latest 5 active feature branches (excluding environment branches `dev`, `test`, `blue`, `master`).
- Checks Git ancestor merge status against upstream branches:
  - 🟢 **Green**: Merged into target branch.
  - 🔴 **Red**: Not merged yet.
  - ⚪ **Gray**: Target branch does not exist or status unknown.
- **Local Branch Descriptions**: Click the edit pencil next to any branch name to save a local note (e.g. `feature/order-v2 (Refactor billing flow)`). Stored locally per origin.
- **Quick MR Entry**: Click the MR icon next to any branch to initiate a Merge Request from your fork branch to upstream `master`.

### Internationalization (i18n)
- Automatically detects browser language (Chinese or English).
- Language can be switched manually in the settings panel and is saved to `localStorage`.

### In-Script Update Notifications
- Works seamlessly with Tampermonkey's native update mechanism (`@updateURL`).
- While active, checks the deployed `gitlab-quickhub.user.js` on GitHub Pages every 10 minutes (and immediately when switching back to the GitLab tab).
- Displays an "Update Available" tag and red badge on the settings icon when a new version is released.
- Click to open Settings and trigger the update flow.

---

## Installation & Setup

### Prerequisites
- Chrome, Edge, Firefox, or any modern browser supporting userscripts.
- A userscript manager: **Tampermonkey** (recommended) or **Violentmonkey**.
- Access to an HTTPS GitLab instance (v4 API supported).

### Steps
1. Install and enable your userscript manager.
2. Open the [Installation Link](https://lucaslus.github.io/gitlab-quickhub/gitlab-quickhub.user.js) or visit the [Landing Page](https://lucaslus.github.io/gitlab-quickhub/).
3. Confirm installation in your userscript manager.
4. Navigate to your HTTPS GitLab instance.
5. Follow the **First-Time Domain Activation** step below.

### First-Time Domain Activation
To protect your privacy and ensure zero unwanted executions, GitLab QuickHub does not hardcode any company domains:
1. When opening an HTTPS GitLab page, the script detects GitLab metadata.
2. An activation card appears, pre-filling the current `window.location.origin`.
3. Click **"Enable this domain"**.
4. The script validates that the domain strictly matches the current origin and refreshes the page.
5. You can disable the domain at any time from Settings → "Disable current domain".

---

## Privacy, Permissions & Security

### Why `@match https://*/*`?
Userscript managers require declared URL patterns upon installation. Since GitLab QuickHub is designed for arbitrary private or self-hosted GitLab domains, it must match broadly.

However, execution is locked behind two strict runtime gates:
1. The webpage must contain verified GitLab `<meta>` tags.
2. The user must explicitly approve and enable the HTTPS origin.
Without both gates satisfied, zero API requests or DOM mutations occur.

### Network Boundaries
- `GM_info`: Used solely to check the currently installed version.
- `GM_xmlhttpRequest`: Used only for anonymous version checks against `lucaslus.github.io`.
- `@connect`: Strictly restricted to `lucaslus.github.io`.
- No personal access tokens (PAT) or credentials are stored or requested.
- All GitLab API requests use relative paths and inherit your current authenticated browser session.
- API responses must match the current origin; cross-origin data is rejected.
- Zero tracking, telemetry, or external data leaks.

### Local Storage Schema
Data is saved in `localStorage` under the current GitLab origin:

| Storage Key | Purpose | TTL |
| --- | --- | --- |
| `gitlab-recent-mr-repos:enabled-origin:v1` | User-approved HTTPS origin | Until disabled / cleared |
| `gitlab-recent-mr-repos:language:v1` | Preferred UI language (`zh-CN` / `en`) | Until cleared |
| `gitlab-recent-mr-repos:cache:v3` | Normalized projects, MRs, and timestamp | 10 minutes |
| `gitlab-recent-mr-repos:update:v1` | Last update check time and published version | 6 hours |
| `gitlab-recent-mr-repos:favorites:v1` | Starred repositories | Until unstarred / cleared |
| `gitlab-recent-mr-repos:branch-descriptions:v1` | Custom branch notes | Until cleared |

---

## GitLab API Reference

The script interacts with the following GitLab v4 APIs:

| Feature | Endpoint | Parameters |
| --- | --- | --- |
| Recent MRs | `GET /api/v4/merge_requests` | `scope=created_by_me`, `state=all`, sorted by `created_at` desc |
| My Open MRs | `GET /api/v4/merge_requests` | `scope=created_by_me`, `state=opened`, `order_by=created_at`, `sort=desc`, `per_page=50`, `page=<page>` |
| Membership Projects | `GET /api/v4/projects` | `membership=true`, exclude archived |
| Owned Projects | `GET /api/v4/projects` | `owned=true`, exclude archived, sorted by `last_activity_at` desc |
| Project Search | `GET /api/v4/projects` | `search=<query>`, optional `owned=true` |
| Search Fallback | `GET /api/v4/search` | `scope=projects`, `search=<query>` |
| Project Branches | `GET /api/v4/projects/:id/repository/branches` | Up to 100 branches per request |
| Merge Status Comparison | `GET /api/v4/projects/:id/repository/compare` | `:id`=Fork ID, `from=<target>`, `to=<branch>`, `from_project_id=<Upstream ID>` |

The Open MR filter uses GitLab's [list merge requests API](https://docs.gitlab.com/api/merge_requests/#list-merge-requests). Results reflect the last request; refresh after merging or closing an MR in another tab. Pagination follows the live list, so concurrent changes can shift page boundaries; refreshing restarts the list. Invalid or cross-origin MR URLs produce a visible response error and are never opened or copied.

---

## Development

### Requirements
- Node.js 22+
- npm 11+

### Commands
Run directly from the repository root:

```bash
# Syntax and static checks
npm run check

# Run all unit tests
npm test

# Build production userscript and landing page into dist/
npm run build
```

### File Structure
```text
├── .github/workflows/publish.yml # CI test, build & GitHub Pages deployment
├── scripts/
│   ├── build.mjs                 # Build script (version injection & HTML page generator)
│   └── build.test.mjs            # Tests for the build script
├── src/
│   └── gitlab-quickhub.user.js   # Userscript source code
├── test/
│   └── gitlab-quickhub.test.js   # Unit & regression tests
├── AGENTS.md                     # Agent engineering guide & invariants
├── README.md                     # English documentation
├── README.zh-CN.md               # Chinese documentation
└── package.json                  # Version & metadata
```

### Release Workflow
1. Update code and tests.
2. Bump `version` in [package.json](package.json) following SemVer (`3.16.1 → 3.16.2`).
3. Run `npm run check && npm test && npm run build`.
4. Commit and push to `main`.
5. GitHub Actions runs checks and automatically publishes the new script to GitHub Pages.

---

## License

Personal and internal productivity tool. Maintained by [@lucaslus](https://github.com/lucaslus).
