# Connect a Hermes agent workspace to GitHub (SSH deploy key)

How we connected this project to `github.com/Ox380/Vemak`. It needs no password and no token pasted into chat. Takes about 5 minutes.

## How it works
The agent's server makes its own SSH key pair. The **private** half stays on the server. You give GitHub the **public** half (safe to share) as a *deploy key* with write access, limited to one repository.

## Before you start
- You need admin rights on the GitHub repo (to add a deploy key).
- The agent runs in a remote container. It cannot see your PC, so it cannot use your own GitHub login.
- Check the owner name spelling carefully (we use the letter **O** in `Ox380`, not a zero).

## Steps
1. **Create the repo on GitHub** (empty is fine).
2. **Ask the agent to set up SSH.** Paste the prompt below.
3. **Add the public key to GitHub.** The agent prints one line starting with `ssh-ed25519`. Open `https://github.com/<OWNER>/<REPO>/settings/keys/new`, enter a title (e.g. `hermes-server`), paste the line, tick **Allow write access**, click **Add key**.
4. **Tell the agent "done".** It tests the connection and pushes.
5. **Verify.** Open the repo page and check the files are there.

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

## Day to day
- Say "push" (or run `./push-<name>.sh "what changed"`). It commits and pushes.
- Everyone with the repo link sees changes on GitHub. Teammates who want to edit and push need their own access.

## Notes and gotchas
- **A deploy key works for one repo only.** GitHub rejects the same key on a second repo. Make a new key per repo.
- **Forgot "Allow write access"?** The push fails with a permission error. Delete the key and add it again with write access ticked.
- **Everyone using the same agent container pushes as the same identity.** Commits show as the agent unless you set a name and email: `git config user.name "Your Name"` and `git config user.email "you@example.com"`.
- **Never commit real data or secrets.** Keep databases, `.env` files and tokens out of the repo, and check before each push if the repo is public.
- **Remove access any time:** repo Settings → Deploy keys → Delete.
- **No GitHub access from the agent?** Fallback: download the folder from the web UI (right-click the folder → Download Folder), unzip it, and upload the contents on GitHub with **Add file → Upload files**. GitHub cannot unpack a zip for you.
- **Alternative to SSH:** a fine-grained personal access token (Contents: read/write, one repo) stored as an environment variable in hPanel. Never paste a token into chat.
