# Team guide: work on VEMAK together on GitHub

First-time agent connection (owner): see `GIT_CONNECT_AGENT.md`.

Goal: several people edit code at the same time without overwriting each other.
Repo: `https://github.com/Ox380/Vemak` (owner name is the letter **O**, not a zero).

## The rules (read this first)
1. **Nobody commits straight to `main`.** Everyone works on their own branch, e.g. `ruta/leaderboard-fix`.
2. **Pull before you start, push often.** Small commits cause small conflicts.
3. **Changes reach `main` through a pull request (PR)** that one teammate reviews.
4. **One person per file at a time** where possible. Agree in chat who is touching `engine.js`, `server.mjs` or `content.js`; those are the files people will collide on.
5. **Never commit secrets or real data** (`.env`, tokens, `app/data/`). The repo is public.

## Part A. Owner setup (once)
1. Repo → Settings → Collaborators → **Add people**. Each teammate needs their **own GitHub account**. Then commits show their real names and they can push without sharing keys.
2. Protect `main`: Repo → Settings → Rules → Rulesets → **New branch ruleset** → target `main` → tick **Require a pull request before merging** (and optionally 1 approval). An agent or script cannot do this for you without admin rights.
3. Optional: turn on **Automatically delete head branches** (Settings → General → Pull Requests).

## Part B. Each teammate joins (once)
Pick the way you work.

**B1. On your own computer** (best for most people)
1. Install Git, and sign in: easiest is **GitHub Desktop** (free), or run `git clone https://github.com/Ox380/Vemak.git`.
2. Set your identity: `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`.

**B2. With your own Hermes agent (a separate container)**
Give your agent this prompt. Your agent makes its own key; it must **not** reuse the key from another container.
```
Connect this workspace to my team's GitHub repo over SSH.
Repo: https://github.com/Ox380/Vemak
Clone into: /data/workspace/VEMAK

1. Check git is installed. Do not ask me for passwords or tokens.
2. Generate an ed25519 key at ~/.ssh/<myname>_github with no passphrase, add github.com to known_hosts, and write ~/.ssh/config so GitHub uses that key.
3. Print ONLY the public key and tell me where to add it: my own GitHub account, Settings -> SSH and GPG keys -> New key (NOT a repo deploy key, so my commits count as me).
4. When I say "done": run ssh -T git@github.com, then git clone git@github.com:Ox380/Vemak.git, and set git user.name / user.email to the values I give you.
5. Work only on a branch (git switch -c <myname>/<topic>). Never push to main.
```
Why your own account key and not a deploy key: a repo deploy key is one shared identity and works for one repo only, so commits can't be told apart. A key on your own account gives each person their name and access.

## Part C. Daily workflow (everyone)
```
git switch main && git pull                 # 1. get the latest
git switch -c yourname/what-you-change      # 2. your own branch
# ... edit, run `cd app && npm test` ...
git add -A && git commit -m "Short clear message"
git pull --rebase origin main               # 3. bring in others' changes first
git push -u origin yourname/what-you-change # 4. publish your branch
```
Then open GitHub → **Compare & pull request** → ask a teammate to review → **Merge**. After merging, everyone runs `git switch main && git pull`.

With an agent you can say: "Create a branch `<name>/<topic>`, commit my changes, pull --rebase from main, push, and give me the PR link."

## If two people changed the same lines (conflict)
1. `git pull --rebase origin main` stops and lists conflicted files.
2. Open each file, find `<<<<<<<` / `=======` / `>>>>>>>`, keep the right version, delete the markers.
3. `git add <file>` then `git rebase --continue`, and push again.
Ask your agent to explain a conflict before resolving it. Never use `git push --force` on a shared branch.

## Before each PR
- `cd app && npm test` passes.
- No secrets or real class data in the diff.
- Docs updated if behavior changed (the code is the source of truth; some older docs are outdated, see `HANDOFF.md`).

## Gotchas
- **Same SSH key in two places fails.** GitHub refuses a deploy key already used on another repo, and sharing one private key across people hides who changed what.
- **Forgot write access / wrong account?** Push fails with "Permission denied". Check the collaborator invite was accepted.
- **Agents in different containers don't see each other's files.** Only what is pushed to GitHub is shared, so push often.
- **Remove access any time:** Settings → Collaborators (people) or Deploy keys (keys).
- **No GitHub access from your agent?** Fallback: download the folder from the web UI, unzip it, and upload with **Add file → Upload files**. This is for one-off use only, not for teamwork.
