# Team guide: how to edit VEMAK with the team

Set up takes 10 minutes. After that, it is 5 simple steps each time.

## Set up (only once)

1. Make a free account at **github.com**. Send your username to the owner.
2. The owner invites you. **Open the email and click Accept.**
3. Download and install **GitHub Desktop**: https://desktop.github.com
4. Open it and click **Sign in to GitHub.com**.
5. Click **Clone a repository from the Internet**. Choose **Ox380/Vemak**. Click **Clone**.

Done. The project is now on your computer.

## Every time you want to change something

**1. Get the newest version**
Click **Fetch origin** at the top. If it changes to **Pull origin**, click it.

**2. Make your own branch**
A branch is your own copy. It keeps your work safe from other people's work.
Click **Current Branch**, then **New Branch**. Name it like `anna-fix-colors`. Click **Create Branch**.

**3. Change the code**
Open the project folder in your code editor. Make your changes. Save.

**4. Save your work**
Go back to GitHub Desktop. Your changes show on the left.
Type a short message at the bottom, like `Fix button color`.
Click **Commit**.

**5. Share it**
Click **Publish branch** (later: **Push origin**).
Click **Create Pull Request**. A web page opens. Click the green **Create pull request** button.
Tell the team in chat: "Please check my pull request."

A teammate checks it and clicks **Merge**. Your change is now in the project.

## Golden rules

- **Never work on `main`.** Always make your own branch first (step 2).
- **Always do step 1 first.**
- **Tell the team which file you are editing.** Two people in the same file causes trouble.
- **Never upload passwords or private files.** The repo is public. Everyone can see it.

## Something went wrong?

- **Red "conflict" message:** two people changed the same lines. Stop and ask a teammate.
- **"Permission denied":** you did not accept the invite. Check your email.
- **Not sure?** Ask in the team chat. Every change is saved, so it can be undone.

---

## For the owner (one time)

1. On GitHub open the repo: **Settings → Collaborators → Add people**. Add each teammate's username.
2. Protect `main`: **Settings → Rules → Rulesets → New branch ruleset**. Name it `protect main`. Target: `main`. Tick **Require a pull request before merging**. Save.

## For people who use a Hermes agent

Paste this to your agent:

```
Connect me to https://github.com/Ox380/Vemak over SSH.
Make my own SSH key. Show me ONLY the public key and tell me where to paste it
(my own GitHub account: Settings -> SSH and GPG keys -> New key).
When I say "done", clone the repo into /data/workspace/VEMAK.
Always make a new branch for my work. Never push to main.
When I say "push", commit, push my branch, and give me the pull request link.
```

Command-line version for experienced people: `TEAM_WORKFLOW_ADVANCED.md`
