# MedConz — local-dev setup (no Supabase, no Vercel)

Installed on this PC: **PostgresPro Standard 17** on port **5433**
(service `postgresql-X64-17`). Note: an older EDB PostgreSQL 18 service
also exists on port 5432 — MedConz uses 5433, do not change that.

Role/db (already created):

```text
role: medconz / medconz (LOGIN, CREATEDB)
db:   medconz OWNER medconz
```

Binaries: `C:\Program Files\PostgreSQL\17\bin\` (`psql`, `createdb`, `pg_dump`).
Add that folder to PATH to use the commands directly.

## 1. Env — single file at repo root

`MedConz/.env` is the only env file. `dev`/`build`/`start`/`db:migrate`
all load it automatically (`dotenv-cli` + `dotenv` in `scripts/migrate.ts`).

Key values:

```text
DATABASE_URL=postgresql://medconz:medconz@localhost:5433/medconz
BETTER_AUTH_SECRET=<set a real 32+ char secret before any shared testing>
```

## 2. Install + run

```powershell
npm.cmd install
npm.cmd run db:generate --workspace=@medconz/web   # after schema edits
npm.cmd run db:migrate --workspace=@medconz/web
npm.cmd run dev                                     # http://localhost:3100
```

MedConz runs on port **3100** (port 3000 belongs to another app on this PC —
see `ConzMed`). Auth and callbacks are configured for 3100 in `.env`
(`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`).

BetterAuth endpoint: `http://localhost:3100/api/auth/*`
(`GET /api/auth/get-session` returns `null` when logged out — healthy.)

Health: `GET /api/health` returns 200 with live DB/auth/R2 status:

```json
{"ok":true,"database":{"ok":true},"auth":{"configured":true},
 "storage":{"provider":"r2","configured":false,"missing":[...]}}
```

`storage.configured=false` until you fill the `R2_*` keys — everything else
works without it; file uploads will fail with a clear "Missing ..." error.

## 3. DB checks / backup

```powershell
$env:PGPASSWORD='medconz'
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -h localhost -p 5433 -U medconz -d medconz -c '\dt'
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' -h localhost -p 5433 -U medconz -Fc medconz > medconz-backup.dump
```

Upload backups to the R2 `medconz-backups` bucket.

## 4. R2

Create buckets `medconz-files`, `medconz-backups` in the Cloudflare dashboard,
make an API token with Object Read/Write, fill the `R2_*` keys in `.env`.

## 5. Docker later (optional)

When Docker Desktop is installed: `docker compose up -d postgres redis`.
The compose Postgres maps 5432 — either stop the native 5432 service first
or keep using native 5433 (recommended for now).

## Notes

- The emergency engine (`lib/checks/emergency.ts`, v1.0.0) runs client-side on
  every input and re-runs server-side on submit. Changes need two medical
  approvers; HA/YO/IG medical review still pending.
- Espees rate lives in env `ESPEES_NGN_RATE=2050` (single place, admin-editable later).
- `access_logs` is append-only by convention — never add update/delete for it.
- **Timestamps are `timestamptz` (ADR):** an earlier bug compared tz-less columns
  against JS Dates and silently dropped due check-ins near midnight in non-UTC
  zones. All 39 timestamp columns were migrated (0006). Instant comparisons
  (`due_at`, `quote_expires_at`, holds) are now exact in any timezone.
- Rate limits (share opens, access requests) are in-memory: move to Redis for prod.
- Doctor authorization is open: `admin()` is off in local dev so roles can be
  self-selected; production must re-add it with a MedConz approval flow (PRD 11.2).
- Push/SMS call-back is stubbed as lock-screen-safe payloads + polling; wire a
  real provider before launch.

## Launch checklist (still needed)

- [ ] Lock price, crypto list, refund currency rule, follow-up windows (§15).
- [ ] Medical-team sign-off on question bank + emergency rules (2 approvers) and
      HA/YO/IG medical translations.
- [ ] Legal review (NDPR, medical records), minor-consent age, top-clearance roster.
- [ ] Real payment keys (Paystack/Flutterwave/crypto) + webhook secrets; flip `PAYMENT_PROVIDER`.
- [ ] R2 buckets + keys; pg_dump cron to `medconz-backups`.
- [ ] Redis for throttles/sessions if going multi-instance; Cloudflare Tunnel for webhooks.
- [ ] Analytics events (§14): check_started/finished, summary_helpful, wrong_tap,
      emergency_shown, queue_wait/abandon, refund_requested/resolved, privacy_report.

## APK (Android, Capacitor shell)

`medconz-debug.apk` in this folder is a debug build that loads the dev
server over WiFi. The phone and this PC must be on the **same WiFi**.

1. Keep the server running: `npm.cmd run start` (or `dev`) — it serves `:3100`.
2. If the phone cannot reach `http://10.251.191.190:3100`, allow it once in an
   **admin** terminal:
   `netsh advfirewall firewall add rule name="MedConz 3100" dir=in action=allow protocol=tcp localport=3100`
3. Copy `medconz-debug.apk` to the phone (USB/Bluetooth/Drive) and install
   (allow "install unknown apps" once). Or: `C:\Android\platform-tools\adb.exe install medconz-debug.apk`.
4. Sign up / use the app normally. Auth accepts the LAN origin via
   `TRUSTED_ORIGINS` in `.env`.

Rebuild after app changes: `npm.cmd run build`, then in
`apps/web/android` run `gradlew assembleDebug` with `JAVA_HOME` = JDK 21
(see `C:\Users\HomePC\AppData\Local\Temp\opencode\build_apk.ps1`), then copy
the fresh `app-debug.apk` over `medconz-debug.apk`.
If this PC's WiFi IP changes, update `MEDCONZ_DEV_HOST`/`TRUSTED_ORIGINS` in
`.env` and `capacitor.config.ts`, then `npx cap sync android` + rebuild.

Production APK later: hosted https backend in `server.url`, release signing
key, real app icon/splash, version bump in `android/app/build.gradle`.

Toolchain installed on this PC: JDK 17 + 21, Android SDK at `C:\Android`
(platform-tools, android-34/36, build-tools 34/35), Gradle via wrapper.

## Routes (all phases)

Pages: `/`, `/design`, `/signup`, `/login`, `/privacy`, `/access`,
`/check`, `/check/:id`, `/check/done/:id`, `/pay/:checkId`, `/pay/receipt/:id`,
`/queue`, `/doctor`, `/doctor/:id`, `/doctor/visits`,
`/visits`, `/visits/:id`, `/timeline`, `/share`, `/s/:id`.
APIs: `/api/auth/*`, `/api/health`, `/api/consent`, `/api/access-log`,
`GET+POST /api/checks`, `GET+PATCH /api/checks/:id`,
`POST /api/checks/:id/submit`, `POST /api/checks/:id/accuracy`,
`PATCH /api/profile`,
`GET /api/payments/quote`, `POST /api/payments/start`,
`GET+POST /api/payments/:id`, `POST /api/payments/:id/confirm`,
`GET /api/payments`, `GET /api/queue`, `GET /api/queue/list`,
`POST /api/queue/:id/action`,
`GET /api/queue/requests`, `POST /api/queue/requests/:id/respond`,
`GET /api/doctor/consultations`, `GET /api/doctor/consultation/:id`,
`POST .../notes|request|accuracy|feedback`,
`GET /api/visits`, `GET+POST /api/visits/:id`,
`GET /api/timeline`, `DELETE /api/timeline/:id` (immediate hide + 6-month hold),
`GET /api/timeline/export`,
`GET /api/checkin`, `POST /api/checkin/:id/respond|rebook`,
`POST /api/checkin/remind|preferences`,
`GET+POST /api/share`, `DELETE /api/share/:id`,
`POST /api/share/:id/open|request`, `POST /api/share/requests/:id`,
`POST /api/share/blocks`, `DELETE /api/share/blocks/:id`,
`POST /api/i18n/flag`.
