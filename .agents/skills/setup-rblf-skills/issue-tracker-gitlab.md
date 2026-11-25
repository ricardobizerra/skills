# Issue tracker: GitLab

Issues and specs for this repo live as GitLab issues. Use the [`glab`](https://gitlab.com/gitlab-org/cli) CLI for all operations.

## Conventions

- **Create an issue**: `glab issue create --title "..." --description "..."`.
- **Read an issue**: `glab issue view <number> --comments`. Use `-F json` for machine-readable output.
- **List issues**: `glab issue list -O json` with appropriate `--label` filters.
- **Comment on an issue**: `glab issue note <number> --message "..."`.
- **Apply / remove labels**: `glab issue update <number> --label "..."` / `--unlabel "..."`.
- **Close**: post the explanation first with `glab issue note <number> --message "..."`, then `glab issue close <number>`.
- **Merge requests**: Use `glab mr create`, `glab mr view`, `glab mr note`, `glab mr diff`.
