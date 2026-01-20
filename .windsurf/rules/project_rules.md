---
trigger: always_on
---

# Project Rules

## 1 Code & Style
- Language: **TypeScript** with `"strict": true`.
- Lint / format: **ESLint (Airbnb)** + **Prettier**  
  → run workflow `/pre-push` before every push.
- Naming: `camelCase` (vars/fns), `PascalCase` (classes/enums), `snake_case` (file names).


## 2 Workflow Reference
| Stage | Default Workflow |
|-------|------------------|
| Feature kick-off | `/new-feature` |
| Plan challenge | `/review-plan` |
| Iterative dev (DDD/TDD) | `/ddd-tdd` + `/run-tests-and-fix` |
| Docs / diagrams | `/update-docs` |
| Pre-push checks | `/pre-push` |
| Pull-request review | `/code-review` |

## 3 Testing
- Framework: **Jest**.  

## 4 Branches & Commits
- Branch naming: `feature/<ticket>-slug`, `fix/<ticket>-bug`, `hotfix/*`.
- Commit: The commits on this proyect should follow the convention of [Conventional Commits]

## 5 Security
- No secrets / PII in the repo.
- Validate all user input (OWASP Top 10).

## 6 Docs & Technical Debt
- Reusable patterns → `solutions_commons_problems.md`.
- Deferred improvements → `technical_debt.md`.

## 7 Operational Directives 

### A) Documentation First
- ALWAYS read relevant docs before proposing/implementing changes.
- If docs are unclear or incomplete, **ask for clarification** in the PR or ticket.
- Treat `.windsurf/rules/architecture.md` + module READMEs as the current source of truth.

### B) Preserve Functionality
- Do NOT remove/modify existing behavior without explicit approval.
- Prefer additive changes; highlight potential regressions and request sign-off.
- Maintain backward compatibility unless directed otherwise.

### C) Documentation Maintenance
- Record new learnings/edge cases in `solutions_commons_problems.md` (add a **Gotchas / Edge cases** subsection).
- Keep module READMEs as the quick reference for parameters/configs.
- .windsurf/plans/{ticket}_{alias}_plan.md is the source of truth for the current development flow and must be kept up to date

### D) Change Management
**Before implementing:**
1) Review the relevant docs/plan.  
2) Propose the change with rationale and impact.  
3) Get approval for any functional change.

**After implementing:**
1) Update plan.  .windsurf/plans/{ticket}_{alias}_plan.md
2) Add learnings/examples (README / solutions_commons_problems.md).  
3) Ensure consistency across docs.

### E) Knowledge Persistence
- Document discovered bugs + root cause + fix in `solutions_commons_problems.md` (Gotchas).
- Add performance tips / implementation insights to the same file (with a **Prevention** note).
- Track deferred improvements in `technical_debt.md` with priority.
- Before suggesting solutions, **check** existing entries (avoid repeating solved issues).