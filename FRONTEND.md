# FRONTEND — GradStudio (PA#3)

The React front end of GradStudio, in `client/`, on the contract in `docs/api/` and the mock in `mock/server.mjs`. Sections follow the PA#3 rubric. Rows are added as each step is built; *Not done* lists what does not work yet.

## 1. Team

- Ngô Thuận An, 23120206
- Nguyễn Hữu Khánh, 24120340

## 2. How to run it

Node 22. From the repository root:

```sh
# terminal 1: the mock API on port 3001 (MOCK_MODE: normal, slow, error, empty)
node mock/server.mjs

# terminal 2: the client
cd client
npm ci
npm run dev
```

Preview the build: in `client/`, `npm run build`, then `npx vite preview` (port 4173). Both forward `/api` to the mock on port 3001.

The gates, from the root after `npm ci`: `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.

## 3. Demo accounts

| Name in examples | Role | E-mail | Password |
|---|---|---|---|
| `linh` | customer | `linh@gradstudio.test` | `linh-demo` |
| `customer2` | customer | `customer2@gradstudio.test` | `customer2-demo` |
| `thao` | admin | `thao@gradstudio.test` | `thao-demo` |
| `mai` | staff | `mai@gradstudio.test` | `mai-demo` |
| `tuan` | staff | `tuan@gradstudio.test` | `tuan-demo` |
| `staff3` | staff | `staff3@gradstudio.test` | `staff3-demo` |
| `superadmin` | superadmin | `superadmin@gradstudio.test` | `superadmin-demo` |

Linh is the customer of the brief's example. `customer2` has a booking and a conversation of their own; `staff3` is not assigned to GS-1024. Display names are in `docs/api/01-auth.md`.

## 4. Routes

One row per route, as the browser shows it (`BrowserRouter`). A route that exists only after a step of the flow says so (`after G6`); opened earlier, it shows a message, not a blank screen.

| Path | Role | Steps | Endpoints |
|---|---|---|---|
| *added as the screens are built* | | | |

## 5. Product owner decisions

Questions posted under *GradStudio — questions for the product owners* (course Facebook group, #WAD2431). Until an answer arrives, the contract marks the behaviour as an assumption.

| Question | Post | Decision |
|---|---|---|
| What a customer sees when the deposit payment fails, and whether they can try again | | waiting |
| The status name of a cancelled booking | | waiting |
| Who may cancel or change a booking, and whether the deposit is refunded | | waiting |
| What a reminder says and where it shows in the customer's account | | waiting |
| What happens after the customer declines a proposed time | | waiting |

## 6. Libraries

| Library | Where | Why |
|---|---|---|
| React, React DOM | `client/` | The course's front-end stack |
| Vite | `client/` | Build and dev server, with the `/api` proxy |
| React Router | `client/` | One route per screen (`BrowserRouter`); added with the first screen that needs it |
| three | `client/` | The home page's 3D story only, loaded with a dynamic `import()` at 768 px and wider |
| ESLint and its React plugins | `client/` | The lint gate |
| Prettier | root | The format gate |

No CSS framework (plain CSS with the tokens in `client/src/styles/tokens.css`) and no form library (forms by hand with one shared helper).

## 7. Not done

Every step, G1–G11: the contract is being written (`docs/api/01-auth.md` done); the mock and the screens come after it.
