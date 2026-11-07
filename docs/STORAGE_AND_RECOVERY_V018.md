# DoCut storage safety and recovery - V0.18

## Storage contract

- Primary versioned key: `docut-studio-v18-checkpoint`. Contains `{format, sequence, writerId, savedAt, checksum, project}` stored in **one** browser localStorage value, avoiding two-key partial writes.
- Legacy key: `docut-studio-v13` (read and migrated, not deleted by normal startup).
- Backup history key: `docut-studio-backups` (max six snapshots). Distinct projects are deduplicated by full snapshot content; storage quota may prevent additional backup creation.
- The checksum detects accidental alteration; it does not provide cryptographic tamper protection. Browser data can be erased by browser cleanup, private tabs, storage eviction or a profile change. **Export `.docut.json` copies regularly.**

## When the Save alert appears

1. Use **현재 문서 JSON 백업** first to export any unsaved edits.
2. If a different tab changed the checkpoint, choose **다른 탭 최신 저장본 불러오기** after making a backup, or **이 편집본으로 덮어쓰기** only if you intend to replace that other version; it attempts a backup of the overwritten version first.
3. If the checkpoint itself is corrupt, first download its raw `.txt` bytes, then explicitly reset only after confirming what will be replaced. If another writer modifies the raw value after export, the reset is blocked.
4. A corrupt backup *index* is also preserved. In **로컬 백업 복구**, export raw backup-index text, then explicitly reset; it must not be replaced just by clicking **현재 상태 백업**.
5. On restore, inspect the page/element/source/verification diff, optionally export the backup JSON, and explicitly apply. An edit after preview requires re-review.

## Known limits

- `localStorage` has no standard compare-and-swap transaction covering two tabs. Synchronous version checks and the storage event protect observed conflicts; simultaneous sub-millisecond writes can still race, which warrants actual two-tab Brave tests.
- Closing a tab amid an uncommitted IME composition can lose the unfinished composition. Finished composition triggers persistence; native Android IME test is pending.
- This build has no server, cloud backup or cross-device sync. Do not infer uploaded status from a local Git commit.
- Source-level and synthetic Chromium tests do not replace native Windows Brave, Android Brave, or PowerPoint manual QA.

### Further integrity safeguards

- An explicitly downloaded JSON working copy is accepted as a substitute for a failed internal backup only when the fingerprint matches the **current** working project; any subsequent edit requires exporting the new revision.
- Clicking **차이 확인 후 복원** commits the restored project to localStorage before swapping the in-memory editor project. If storage fails or another tab wins the race, the old working project stays visible, the comparison remains open and an alert is shown.
- A page added or deleted is counted separately and is not falsely labeled a change of order unless retained pages truly change their relative sequence.
