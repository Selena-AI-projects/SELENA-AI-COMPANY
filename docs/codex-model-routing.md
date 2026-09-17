# Project model routing
17 September 2026. Codex CLI 0.154.0.

| Role | Model | Reasoning | Use |
| --- | --- | --- | --- |
| Primary | gpt-5.6-sol | medium | Plan stages, execute small tasks, verify helpers, own result |
| routine | gpt-5.6-luna | medium | Bounded supplied-data extraction and preliminary classification |
| expert | gpt-6-astra | medium | Complex bugs, consequential ambiguity, unresolved reasoned primary attempt |

Project files: `.codex/config.toml`, `.codex/agents/routine.toml`, `.codex/agents/expert.toml`; routing rules appended inside AGENTS.md markers. Max two helpers, depth one. Legacy `max_threads` intentionally overrides the existing global limit of five. No global model, permissions, approval policy, provider or secrets changed. Global config SHA-256 before/after: 8ef21e5c06de1d7c5878f49ebd92a193275ea3e10df0625a24a67818e73ca18f.

## Verification and limits
All three TOML files parse. Installed `codex -C <repo> debug models --bundled` succeeds. Historical control runs before the owner reduced expert reasoning from high to medium returned correct fact extraction (Luna/medium), idempotency analysis (Astra/high), and SOL_OK (Sol/medium). Exposed rollout `turn_context` model/effort metadata is in `.codex/model-probe-evidence.json`; self-reported model identity was not used. This verifies the runtime-selected model, not hidden backend internals.

PARTIAL: custom roles on disk are not yet proven discoverable in a newly started session. CLI app-server and exec hit local SQLite state initialization/backfill failures before session creation. No daemon socket was available. The current parent session remains Astra/medium; files do not change it retroactively. No silent model substitution. Native helper smoke tests used explicit models, not the project custom-role registry.

## Start a new task
Open this repository directory itself in Codex, not the parent `selena AI company` folder. Or run:

```sh
codex -C "/Users/msnigmatullaeva/Downloads/selena AI company/selena-website-implementation"
```

Do not resume an older task to validate defaults. Explicit app model selection, `--model`, `-c` or a named CLI profile can override project defaults; check resolved session metadata. Project files require the existing trusted-project context (no trust was changed here). If runtime SQLite initialization still fails, repair/restart Codex separately before acceptance. Once new-session loading is confirmed, ordinary briefs use AGENTS.md routing without manual model selection.

## Rollback
Remove only the appended `ai-standard` block from AGENTS.md and the three newly added TOML files. Preserve later unrelated edits. Original AGENTS.md is backed up locally at `.codex/backups/20260917-model-routing/AGENTS.md.before`; compare before restoring rather than blindly overwriting. Evidence and this guide can be kept or removed. No global rollback or permission change is needed.

Format source: https://learn.chatgpt.com/docs/agent-configuration/subagents

Owner cost preference: expert now uses Astra/medium. Do not raise it to high without an explicit owner request. The follow-up custom-agent acceptance launch failed before inference because the SQLite database was read-only; prior Astra/high metadata remains historical evidence.

## Post-merge verification, 17 September 2026
PR #129 is merged at `1e5d83f5d2d3e4864bfc29a0ed5ac650403280a9`.
A fresh `codex doctor --json` invocation from the repository reported `config.load: ok` and resolved primary model `gpt-5.6-sol`; this verifies project precedence over the global Astra default. It does not prove custom-agent spawning.
Interactive launch and the bounded acceptance launch failed before inference with SQLite `attempt to write a readonly database` under the current execution boundary. This is an access error, not proven corruption. No database repair, permission change, credential copy or global config mutation was performed. A fresh user-owned Codex session opened directly in this repository is still required to validate named custom agents. If it fails there too, diagnose that runtime separately; do not delete the database.
