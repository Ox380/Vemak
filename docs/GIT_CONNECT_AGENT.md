# Connect one Hermes agent workspace to GitHub (SSH deploy key)

For the **repo owner / first setup**. For teamwork, see `TEAM_WORKFLOW.md`.
How we connected this project to `github.com/Ox380/Vemak` with no password and no token pasted into chat.

## How it works
The agent's server makes its own SSH key pair. The **private** half stays on the server. You give GitHub the **public** half (safe to share) as a *deploy key* with write access, limited to one repository.

## Before you start
- You need admin rights on the GitHub repo.
- The agent runs in a remote container. It cannot see your PC or use your own GitHub login.
- Check the owner name spelling (`Ox380` uses the letter **O**, not a zero).

## Steps
1. Create the repo on GitHub (empty is fine).
2. Paste the prompt below into the agent.
3. The agent prints one line starting with `ssh-ed25519`. Open `https://github.com/<OWNER>/<REPO>/settings/keys/new`, add a title (e.g. `hermes-server`), paste the line, tick **Allow write access**, click **Add key**.
4. Tell the agent "done". It tests the connection and pushes.
5. Open the repo page and check the files are there.

## Prompt to paste into the agent
```
Connect my workspace project to GitHub over SSH.
Repo: https://github.com/<OWNER>/<REPO>
Project folder: <PATH, e.g. /data/workspace/PROJECT>

Please:
1. Check git is installed and the repo exists (git ls-remote). Do not ask me for passwords or tokens.
2. git init -b main (if not already a repo), add a .gitignore (node_modules, data folders, logs, .env), scan for secrets, and commit.
3. Generate an ed25519 key at ~/.ssh/<name>_deploy with no passphrase, add github.com to known_hosts, and write ~/.ssh/config so GitHub uses that key.
4. Set the remote to git@github.com:<OWNER>/<REPO>.git.
5. Print ONLY the public key and tell me exactly where to paste it (the repo's Deploy keys page, with write access).
6. When I say "done", test with ssh -T git@github.com, then git push -u origin main, and confirm the remote commit matches the local one.
7. Create a push-<name>.sh script that commits everything and pushes, so I can say "push" after future changes.
```

## Notes
- A deploy key works for **one repo only**; GitHub rejects the same key on another repo.
- Forgot "Allow write access"? Push fails with a permission error. Delete the key and re-add it with write access.
- All commits show as the agent unless you set `git config user.name` / `user.email`.
- Never commit secrets or real data; the repo is public.
- Remove access any time: repo Settings → Deploy keys → Delete.
- Fallback with no GitHub access: right-click the folder in the web UI → Download Folder, unzip, then **Add file → Upload files** on GitHub (GitHub cannot unpack a zip).
