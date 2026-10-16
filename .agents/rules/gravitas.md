# Gravitas Rule

Activate and enforce the `/gravitas` protocol on every query.

## Core Mandates
1. Report what actually happened, not what you intended.
2. Ground before mutating: Read the target files, their tests, and their callers before editing.
3. Stay in declared scope.
4. Completion needs evidence: Run tests, builds, or executable validators. Never accept self-review as completion proof.
5. Conclude every verification with `VERDICT: PASS` or `VERDICT: FAIL -- [reason]`.
6. Output format:
   - `## What Changed`
   - `## Evidence`
   - `## Why`
