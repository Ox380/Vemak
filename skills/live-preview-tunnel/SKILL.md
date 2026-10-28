---
name: live-preview-tunnel
description: Share a running project through a temporary public URL.
version: 0.1.0
author: Project team, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [preview, tunnel, localtunnel, live, sharing]
    related_skills: []
---

# Live Preview Tunnel Skill

Use this skill when teammates need to view the current local project from another device or share a live change with friends. It exposes the local development server through a temporary `localtunnel` URL; it is not production hosting and must not be used for secrets or private data.

## When to Use

- Share the current UI with a teammate or friend.
- Test the application from a phone or another network.
- Get a temporary public preview without configuring a hosting account.

Do not use this for production deployment, permanent URLs, private dashboards, credentials, or real user data.

## Prerequisites

- A running project server with a known local port.
- Node.js and `npx` available through `terminal`.
- The default VEMAK app port is `3000`; read the project README if the port changed.

## How to Run

Run the application from the project directory:

```bash
terminal(command="npm start", background=True, notify=False, workdir="app")
```

Start the temporary tunnel in a second process:

```bash
terminal(command="npx --yes localtunnel --port 3000", background=True, notify=True)
```

The tunnel process prints a URL such as `https://some-name.loca.lt`. Keep that process running while the preview is needed.

## Procedure

1. Read the project README and identify the start command and port. Completion criterion: the command and port are known.
2. Start the local server. Completion criterion: `curl` or an equivalent HTTP check returns status `200` for the local root page.
3. Start `localtunnel` with the same port. Completion criterion: the process prints an `https://*.loca.lt` URL.
4. Check the public URL with `curl -L`. Completion criterion: it returns HTTP `200` and HTML or the expected application response.
5. Share the URL and the tunnel's page paths, if applicable. State that the URL is temporary.
6. When finished, stop the tunnel process and the local server. Completion criterion: both processes have exited.

## Verification

Use a real external HTTP request, not only the tunnel process output:

```bash
terminal(command="curl -L --max-time 20 -sS -o /dev/null -w 'status=%{http_code}\\n' https://<generated-host>/")
```

For VEMAK, also check:

- `/`
- `/teacher`
- `/play`

## Alternatives

- **Local-only review:** use `http://localhost:3000`; safest when everyone is on the same machine.
- **Team preview environment:** deploy a branch to a staging host such as Render, Railway, Fly.io, or a similar service; better for repeatable URLs and persistent review environments.
- **Production-like preview:** use a managed preview deployment connected to GitHub; each branch or pull request can receive its own URL and build.

Prefer a real staging or preview deployment when the team needs a stable URL, automatic updates, HTTPS configuration, access control, logs, or persistent data. Use `localtunnel` only for quick, temporary visual checks.

## Pitfalls

- The URL changes when the tunnel restarts and may stop working without notice.
- Anyone who knows the URL can access the exposed server; do not expose secrets, admin credentials, or personal data.
- A tunnel does not make the application production-ready. Keep authentication, HTTPS, database, rate limiting, and privacy requirements separate.
- If the public check fails, first confirm the local server is listening on the same port and that the tunnel process is still running.
