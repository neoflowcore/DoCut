# DoCut GitHub synchronization blocker (2026-11-03, checked during V0.15 work)

Repository: https://github.com/neoflowcore/DoCut
Expected branch: `main` (local)
State observed via connected GitHub repository APIs: repository exists; `/branches` yields an empty list and `/contents` responds that the repository is empty.

## Source status

The complete current DoCut editor, test runners, and plans are in `/mnt/data/docut-dev` at local `main`. There is no evidence of a successful remote upload. The source is available locally; losing the local working directory before remote sync would lose these unpublished changes.

## Recorded failures

- `git push` to `https://github.com/neoflowcore/DoCut.git`: network DNS lookup failed (`Could not resolve host github.com`).
- Official GitHub plugin `create_file`: HTTP 403 `Resource not accessible by integration`.
- Official GitHub plugin `create_blob`: HTTP 403 `Resource not accessible by integration`.

On 2026-11-03 the current connected API confirmed an empty repository (`/contents` 404, `/commits/main` 409), and a fresh `create_blob` write failed HTTP 403 `Resource not accessible by integration`. Repository metadata advertises `permissions.push=true`, but this does not override a failed actual write operation. Do not report the remote as synchronized.

## Safe next operation

1. Resolve repository GitHub App/connector write permissions or restore direct GitHub network connectivity.
2. Read `/branches` and `/contents` again; do not overwrite a remote branch without comparing its head.
3. Push the local `main` source history to the empty remote after verifying that `.github/workflows` is absent.
4. Read back the remote branch, files and expected SHA. Mark uploaded only after this verification.

NO GitHub Actions runs, release jobs, installer builds, EXE/APK/ZIP creation or release artifacts should be initiated for synchronization.

## V0.14 recovery checkpoint

- New V0.14 source and tests retain a zero-automatic-workflow policy; the entire source history is intended for a single batch `main` push.
- Remote state and Git write errors must be rechecked before calling synchronization successful; recorded 403 applies to the connector, not an observed published head.
- The offline patch TXT carries the exact current local history if remote access stays unavailable. It is source text, not a ZIP, installer, or GitHub Actions artifact.

## V0.15 local source recovery

The V0.15 patch and resume checkpoint are preserved as source-only TXT/MD records in the DoCut Library after grouped code verification. They are a recovery alternative, **not** evidence that the remote was updated. Do not try to create GitHub Actions files or release binaries as a workaround for permission denial.
