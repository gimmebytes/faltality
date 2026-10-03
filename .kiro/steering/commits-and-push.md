# Steering: Commits & Push

## Commits
- Use Conventional Commits for every commit: `feat:`, `fix:`, `docs:`, `chore:`,
  `test:`, `refactor:`, etc.
- Commit when a unit of work is done — one commit per finished spec task or per
  completed turn — not one giant commit at the end.

## Push & PR
- During normal turns / individual tasks: commit only. DO NOT push.
- When ALL tasks of a spec are complete: push the spec branch AND open a pull
  request against `main` automatically.
- Never push directly to `main`/`master` (protected). Work on a feature/spec
  branch and merge via PR.
- Follow the git-safety rules: separate branch/stage/commit/push commands with an
  explicit branch name; PR bodies via `--body-file`, not inline heredocs.
