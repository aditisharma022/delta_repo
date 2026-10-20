# ExitMate

**Your way home, together.**

ExitMate helps people leaving the same airport, railway station, concert, or event find other people departing at a similar time and travelling in a similar direction — so they can share a cab and split the fare.

This is a polished, functional **MVP demo**. It uses clearly-labeled **fictional sample riders** and **transparent fare estimates**, not live quotes. It does not make real bookings, verify identities, show live riders, live traffic, or process payments.

The demo region is **Delhi NCR, India**. Sample venues include IGI Airport, New Delhi Railway Station, Jawaharlal Nehru Stadium, and the India Gate lawns; sample destinations span Gurugram, Noida, South Delhi, Dwarka, Ghaziabad, and Connaught Place. All fares are in **Indian Rupees (₹)** and times render in **India Standard Time (Asia/Kolkata)**. Users can type any Indian city or venue — the form fields are fully editable.

## What it does

- **Landing page** with the headline _"Your way home, together"_ and a Start matching CTA.
- **Ride request form** — venue type, pickup, destination, departure time, time window, passenger count.
- **Match results** — sample riders, destination, departure time, route compatibility score, estimated total fare, estimated per-person fare, and estimated savings.
- **Join ride** — updates the UI to a clear confirmation state.
- **Event intelligence panel** — public information about the selected venue gathered from the TinyFish Search API, with source URLs and loading/error/demo states.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS for styling
- lucide-react for icons
- Supabase Edge Function (Deno) for the server-side TinyFish proxy
- No database persistence required for this MVP — ride matching runs client-side against seeded sample data

## Getting started (local)

```bash
npm install
npm run dev
```

Open the printed local URL. The app works immediately with fictional sample riders even with no API keys configured.

### Build

```bash
npm run build
npm run preview
```

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env` (browser-safe) | Supabase project URL for calling the edge function. Pre-populated on Bolt. |
| `VITE_SUPABASE_ANON_KEY` | `.env` (browser-safe) | Supabase anon key, used to authenticate the edge function call. Pre-populated on Bolt. |
| `TINYFISH_API_KEY` | **Supabase Edge Function Secret** (server-only) | Key for the TinyFish Search API. **Never put this in `.env` or client code** — Vite ships `.env` values to the browser. |

### Setting the TinyFish API key

1. Get a key at https://agent.tinyfish.ai/api-keys
2. Add it as a Supabase Edge Function secret named `TINYFISH_API_KEY`:
   - **On Bolt**: Project Settings → Edge Function Secrets → add `TINYFISH_API_KEY`.
   - **Supabase dashboard**: Project → Edge Functions → Secrets → `TINYFISH_API_KEY`.
3. The edge function reads it via `Deno.env.get('TINYFISH_API_KEY')`. The browser never sees it.

If the key is missing or the upstream call fails, the Event Intelligence panel clearly shows **"Demo data — TinyFish not connected"** and ride matching stays fully functional.

## Matching algorithm

The matcher is deterministic and transparent. For each fictional sample rider it computes a **route compatibility score (0–100)** from two inputs:

1. **Departure-time difference** — absolute minutes between the rider's departure and the user's requested departure.
   - Inside the user's time window: time component scores 80–100, decaying with distance from 0.
   - Outside the window: falls off as `60 - 2 × (minutes beyond window)`, floored at 0.
2. **Destination similarity** — Jaccard similarity over destination tokens (casefolded, alphanumeric, length > 2). 0–1 scale, multiplied by 100.

**Final score** = `0.5 × timeScore + 0.5 × destinationSimilarity × 100`, clamped to 0–100. Riders below 35 are filtered out. Results are sorted descending by score.

The weighting (50/50) and thresholds are intentionally simple and explainable — the UI surfaces both components ("X% destination overlap · Y min apart") so users see _why_ a rider matched.

## Fare estimation (not live quotes)

Fares use a fixed illustrative rate and are labeled as estimates throughout the UI:

```
totalFare  = ₹60   (base)
          + ₹14  × distanceKm
          + ₹1.5 × estimatedMinutes     (~25 km/h urban Delhi NCR assumption)
          + ₹20  × extraStops           (1 stop per 2 passengers beyond 2)
perPerson  = totalFare / combinedPassengers
savings    = soloFare - perPerson       (solo = same route, 0 extra stops)
```

These numbers are **not** connected to any live pricing, traffic, or ride-share API. Distances on sample riders are illustrative. Times display in Asia/Kolkata.

## TinyFish integration

The browser never calls TinyFish directly. Instead it POSTs to the Supabase edge function `event-intel`:

```
POST {SUPABASE_URL}/functions/v1/event-intel
Authorization: Bearer {ANON_KEY}
{ "venueName": "...", "venueType": "...", "destination": "..." }
```

The edge function:

1. Reads `TINYFISH_API_KEY` from `Deno.env`.
2. If missing → returns `{ status: "demo", ... }` with a clear message.
3. Otherwise calls `GET https://api.search.tinyfish.ai?query=...` with the `X-API-Key` header.
4. Normalizes results into `{ status, summary, sources: [{title, url, snippet}] }`.
5. On upstream failure → returns `status: "demo"` so the UI shows a graceful fallback.
6. Always returns CORS headers and wraps the body in a try/catch.

The frontend renders three explicit states: **live** (green badge + sources), **demo** (amber callout), and **error** (amber callout with the error message). It never fabricates live event information.

## Limitations

- **Fictional riders only.** No live riders, no real-time availability.
- **No authentication** in this MVP — anyone can use the demo.
- **No real bookings or payments.** "Join ride" only updates the UI.
- **No identity verification.** Riders are clearly labeled as sample data.
- **Fares are estimates** from a fixed rate, not live quotes.
- **Event intelligence** reflects whatever TinyFish returns about the venue name; it is not curated event data and may be generic.

## Demo instructions

1. `npm run dev` and open the URL.
2. Click **Start matching**.
3. The form is pre-filled with IGI Airport, New Delhi → Cyber City, Gurugram at 22:20 IST. Click **Find matches**.
4. Review the ranked sample riders, compatibility scores, and fare estimates.
5. Click **Join ride** on any match → confirmation card appears.
6. Click **Edit request** and change destination or time → results update live.
7. The Event Intelligence panel on the right shows live TinyFish results if a key is configured, otherwise the demo fallback.

## Deployment

This is a Vite SPA plus one Supabase Edge Function.

1. **Edge function**: deploy via the Supabase MCP `deploy_edge_functions` tool (or the Supabase dashboard). The function source lives in `supabase/functions/event-intel/index.ts` and is registered in `supabase/config.toml` with `verify_jwt = false` so the anon-key client can call it.
2. **Set the `TINYFISH_API_KEY` secret** in Supabase (see above).
3. **Frontend**: `npm run build` produces a static `dist/` you can host on any static host (Bolt's built-in hosting, Vercel, Netlify, Cloudflare Pages, etc.). Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the build environment.

## Project structure

```
src/
  App.tsx                     # stage flow + layout
  components/
    Landing.tsx               # landing page
    RideRequestForm.tsx       # request form
    VenueTypeSelect.tsx       # venue-type picker
    MatchResults.tsx          # ranked matches + join
    Confirmation.tsx          # joined-ride confirmation
    EventIntelPanel.tsx       # TinyFish-powered event info
  lib/
    types.ts                  # shared types
    sampleRiders.ts           # fictional seed riders
    matching.ts               # matching + fare estimation
supabase/
  config.toml                 # edge function config
  functions/event-intel/index.ts  # TinyFish proxy (server-side)
```
