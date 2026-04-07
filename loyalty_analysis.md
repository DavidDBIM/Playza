# PZA Loyalty Implementation Analysis

After reviewing the backend routes, frontend API, hooks, and pages, here is the status of the PZA (Playza) Loyalty system implementation.

## 🟢 Implemented Features
- **Backend Routes**: `/pza/me`, `/pza/streak/claim`, and `/pza/task/claim` are fully implemented in `pza.routes.ts`.
- **Frontend API**: `loyalty.api.ts` accurately mirrors the backend routes and includes proper TypeScript interfaces.
- **Frontend Page**: `Loyalty.tsx` is built with a high-fidelity UI, including tier progress, streak tracking, and task categories.
- **PZA Engine**: `pzaEngine.ts` exists on the backend to handle points awarding and event logging.

## 🔴 Critical Gaps & Bugs

### 1. Naming Mismatches (Frontend vs. Backend)
There is a significant discrepancy between the `task.id` used in the frontend and the `PZAEvent` types used in the backend. Since the frontend looks up "claimable" status by matching `task.id` against the `event_type` from the backend, **automatic tracking will fail for most tasks.**

| Reward/Task | Frontend `task.id` | Backend `PZAEvent` | Status |
| :--- | :--- | :--- | :--- |
| **Signup** | `signup` | `SIGNUP` | ❌ Case Mismatch |
| **Email Verified** | `email_verified` | `EMAIL_VERIFIED` | ❌ Case Mismatch |
| **Comment on Match** | `comment_on_match` | `MATCH_COMMENT` | ❌ Naming Mismatch |
| **Like & Share** | `like_share_content` | `CONTENT_LIKED_SHARED` | ❌ Naming Mismatch |
| **Report Cheater** | `valid_cheat_report` | `CHEATER_REPORTED` | ❌ Naming Mismatch |
| **30-Day Streak** | `streak_30_games` | `STREAK_30_GAMES` | ❌ Case Mismatch |

### 2. Architectural Inconsistency (Hooks)
While `useLoyaltyMe` exists in `hooks/loyalty`, the mutation actions (`claimStreak` and `claimTask`) are called directly from the API layer inside `Loyalty.tsx`. This bypasses the project's pattern of using hooks for all API interactions and misses out on benefits like centralizing mutation logic and `react-query` state management.

### 3. Security Concern
The frontend `claimTask` function sends the `points` value to the backend (`POST /pza/task/claim`). The backend trusts this value and awards points accordingly. This allows a user to potentially manipulate the request to award themselves more points than intended.

## 🛠️ Recommended Actions
1. **Unify Naming**: Align frontend `task.id` with backend `PZAEvent` (ideally using uppercase for both or a mapping layer).
2. **Refactor Hooks**: Create `useClaimStreak` and `useClaimTask` hooks to handle mutations.
3. **Backend Validation**: Modify `POST /pza/task/claim` to look up the point value on the backend based on `task_id` rather than trusting the frontend input.
