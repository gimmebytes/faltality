# Steering: Worktree Workflow

This project uses the **bare + worktree** layout:

```
~/Source/foldtality/
  .bare/     # the git database (never work in here)
  .git       # file pointing to .bare
  main/      # worktree for main (integration branch)
  <feature>/ # one worktree per branch
```

## Rules
- The project root (`~/Source/foldtality/`) is only a container — never edit files
  there directly. Always work inside a worktree subfolder.
- One branch per worktree. Each spec gets its own worktree/branch
  (e.g. `levels` → `spec/pre-boss-levels`, `boss` → `spec/boss-finale`,
  `hud` → `spec/hud-ux`).
- `main` is the integration branch. Spec branches are cut from `main`; they inherit
  `.kiro/steering/*` at branch-off time. Keep steering docs on `main` so every new
  worktree inherits them.
- After a spec's PR is merged: in `main/` run `git pull`, then rebase or merge the
  other open worktrees onto the new `main` before continuing work in them.
- `node_modules` is per worktree — run `make install` / `npm install` once in each
  new worktree before `make dev` / `make build`.
- Switch work by `cd`-ing into another worktree folder, not by `git checkout`.
- Manage/clean worktrees with `bonsai` (installed at `~/go/bin/bonsai`):
  `bonsai list`, `bonsai prune --dry-run`, `bonsai clean`.
