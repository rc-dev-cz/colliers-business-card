# RC Web Dev

How RC Dev works on a project. This is **our** place — not a product feature for the client, and **not for Klai**.

**RC Dev** is us. **RC Web Dev** is the internal area we keep in this Vue app while we build.

## Isolation

RC Web Dev lives only in this repo, in `src/rc-web-dev/`. Stack: **Cursor** + **this Vue 2 web app** (Options API) + optional Supabase.

Do not port it with the Colliers Partner Portal into Klai / Clay. When the product UI goes to Klai, leave this folder, these routes, Supabase env, and this file behind.

Do not copy RC Web Dev into `colliers-environment.css` or the Klai port. In this app, Profile → rainbow **RC Web Dev** is how we get there while we build. The same routes ship on GitHub Pages with the Vue 2 product build.

## Rule

RC Web Dev always has **four pages**:

| Page | URL | What it is |
| --- | --- | --- |
| Board | `#/rc-web-dev/board` | Scrum columns. Drag tickets. |
| Roadmap | `#/rc-web-dev/roadmap` | Progress bar + assigned tickets by category. Unassigned Ideas sit below, grouped by category. |
| Logs | `#/rc-web-dev/logs` | History of creates, moves, and edits |
| Delivery | `#/rc-web-dev/architecture` | Five paths + 16 pages with status (Not started → Developed → QA → Approved → Klai). Path status is the bottleneck of its pages. FileMaker scripts. Checkboxes stay in this browser. |

After login, Profile → rainbow **RC Web Dev**, or open `#/rc-web-dev`. The rainbow user ring lives on RC Web Dev’s own header.

Old shortcuts: `#/dev`, `#/gira`, `#/admin-work`, `#/user-work` all land in RC Web Dev.

## Assigned tickets are valid

Only tickets with someone **assigned** count on the roadmap and in the percentage.

- Assigned to **CZ** (Carlos Zabaleta) or **KC** (Kevin Collins) → on the roadmap
- New tickets land in Ideas **unassigned**. Dragging out of Ideas assigns **CZ** automatically.

## Ticket schema

Git source of truth: [TICKETS.md](TICKETS.md) — the one document with every ticket. The board seeds from [devTracker.json](devTracker.json) (imported by `src/rc-web-dev/data/devTracker.js`). When tickets change, update **both** files. Supabase is not the source of truth.

| Field | Meaning |
| --- | --- |
| `id` | `USR-039`, `ADM-010`, `RC-01`, … |
| `title` | Short name |
| `description` | What we are building |
| `status` | Workflow column |
| `category` | Customer Portal, Admin Portal, Shared UI/UX, Quality Assurance, Technical |
| `priority` | high / medium / low |
| `assignee` | CZ, KC, or empty |
| `acceptanceCriteria` | List of testable lines |
| `relatedIds` | Other ticket ids this one is related to. Two-way. No parent/child |
| `blocked` / `blockedReason` | Flag, not a status |
| `notes` | Extra context. Not the requirement |

`origin` stays internal. It is not on the ticket form. `fresh` parks a newly created ticket at the top of Ideas until you open it. `review` / `reviewedAt` power the bouncing **New** / **Updated** / **In progress** pill; click the pill to clear it.

Related tickets that share a column sit together. Related tickets in another column still show on the ticket sheet.

## Board columns

| Column | Meaning |
| --- | --- |
| Ideas | Still needs discussion. Don't write code. |
| Ready for development | Approved and clear enough. Assigned. |
| In progress | Development has started |
| QA | Built. Ready for testing |
| Done | Development and testing are complete |

Click a ticket to open it. **Edit ticket** changes the fields above. Drag a ticket out of Ideas when the requirement is approved; it is assigned to **CZ** automatically.

Create, move, or edit a ticket and it gets a bouncing blue mark plus **Updated** or **In progress**. Click the pill on the open ticket to clear it. A move keeps the ticket’s category.

If `.env.local` has Supabase keys, the board waits for `rc_tickets` before it paints, then writes on Save. There is no ticket localStorage. Drag stays in the browser until you Save that ticket. Related links for git tickets stay with the seed. Cart, session, and locale still use localStorage. The nav pill shows **Supabase on** / **off** / **down**. Ask before running any live Supabase command from the agent.

Sync stores title, status, assignee, notes, acceptance criteria, **related ids**, and blocked in `rc_tickets` (meta fields live inside the `source` JSON). Logs stay in the browser until log sync lands.

Click **Create ticket** on the Board (or **+** on Ideas). Pick category and priority. The ticket gets an `RC-xx` id and lands in **Ideas**, unassigned. Drag into Ready, In progress, QA, or Done when approved. Create ticket stays on the Board tab.

Product codes: `F-xx`. Customer pages: `USR-010`, `USR-020`, … with related tickets (`USR-011` related to `USR-010`). Admin pages: `ADM-010`, `ADM-020`, …. RC work: `DEV-010`. Created here: `RC-xx`.

## Logs

Creates, column moves (board drag or roadmap checkbox), and ticket edits are written to a log in the browser. Newest first, grouped by day. Filter by Moves, Created, or Edits. Click a row to open the ticket.

## Docs split

| File | Owner |
| --- | --- |
| `docs/BUSINESS-RULES.md` | Agreed product behaviour and test IDs (V2) |
| `docs/FEATURES.md`, `BACKLOG.md`, `USER.md`, `ADMIN.md`, `TESTING.md` | The product (what goes to Klai) |
| `docs/TICKETS.md` | **The** ticket document (git source of truth) |
| `docs/devTracker.json` | Board seed — keep in lockstep with TICKETS.md |
| `docs/RC-WEB-DEV.md` | How RC Dev works (this Vue app only) |

When we start a new project, copy `src/rc-web-dev/`, the `#/rc-web-dev` routes, and this file. Do not copy them into Klai.
