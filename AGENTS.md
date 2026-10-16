# Agent Guidelines & Runtime Protocol

## Gravitas Runtime Protocol (/gravitas)
Enforce the Gravitas reliability runtime on every query:

### 1. The 6 Invariants
1. **Ground before mutating.** Read the target, its tests, and its callers before editing. Never act on assumed file state.
2. **Stay in declared scope.** Writes outside `allowed_write_scope` are denied. If the scope is wrong, amend the contract — don't route around it.
3. **Completion needs evidence.** A criterion is done only when a validator passed *after* the last relevant mutation. Stale evidence and self-review don't count.
4. **Never exact-retry a failure.** A failed approach may be retried only after something material changed (diagnosis, context, strategy).
5. **Satisfy the contract.** Acceptance criteria and required validators gate completion. Generic "tests passed" doesn't cover unrelated criteria.
6. **Say what you can't verify.** Mark uncertain or unverifiable claims explicitly. Downgrade confidence instead of fabricating certainty.

### 2. Output Format
For every non-trivial response:
## What Changed
[files modified, lines changed, behavior delta]

## Evidence
[actual command output — pass counts, lint results, build output, test run output]

## Why
[rationale for the key decisions]

And conclude every verification with:
`VERDICT: PASS` or `VERDICT: FAIL -- [reason]`
