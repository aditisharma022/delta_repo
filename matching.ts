import type { MatchResult, RideRequest, SampleRider } from './types';

/** Casefold + strip non-alphanumeric for cheap token comparison. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(s: string): Set<string> {
  return new Set(
    normalize(s)
      .split(' ')
      .filter((t) => t.length > 2),
  );
}

/**
 * Jaccard similarity over destination tokens. Deterministic, transparent, and
 * easy to explain to a user ("how much of the destination text overlaps").
 */
export function destinationSimilarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / new Set([...ta, ...tb]).size;
}

/** Absolute minute difference between two datetime-local strings. */
export function departureDiffMinutes(a: string, b: string): number {
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return Number.POSITIVE_INFINITY;
  return Math.abs(ta - tb) / 60000;
}

/**
 * Compatibility score combining time proximity and destination similarity.
 * - Within the user's window: time component is high and decays gently.
 * - Outside the window: still computed but scored lower so the user sees the
 *   tradeoff explicitly.
 * Weighting: 50% time, 50% destination similarity.
 */
export function compatibilityScore(req: RideRequest, rider: SampleRider): {
  score: number;
  destSim: number;
  diffMin: number;
} {
  const diffMin = departureDiffMinutes(req.departureTime, rider.departureTime);
  const destSim = destinationSimilarity(req.destination, rider.destination);

  const inWindow = diffMin <= req.windowMinutes;
  // Within window: time score 80-100 scaled by how close to 0 diff.
  // Outside window: falls off as diff grows.
  let timeScore: number;
  if (inWindow) {
    timeScore = 100 - (diffMin / Math.max(req.windowMinutes, 1)) * 20;
  } else {
    const over = diffMin - req.windowMinutes;
    timeScore = Math.max(0, 60 - over * 2);
  }
  const score = Math.round(timeScore * 0.5 + destSim * 100 * 0.5);
  return { score: Math.max(0, Math.min(100, score)), destSim, diffMin };
}

/**
 * Transparent fare estimation in Indian Rupees (₹). This is NOT a live quote.
 * It uses a simple base fare + per-km rate + per-minute rate and a small
 * per-extra-stop fee. All sample riders are fictional and distances are
 * illustrative. Rates are roughly aligned with typical Delhi NCR cab fares
 * for demo purposes only.
 */
const BASE_FARE = 60; // ₹
const PER_KM = 14; // ₹ per km
const PER_MIN = 1.5; // ₹ per minute
const PER_EXTRA_STOP = 20; // ₹ per extra stop

export function estimateTotalFare(distanceKm: number, minutes: number, extraStops: number): number {
  return BASE_FARE + distanceKm * PER_KM + minutes * PER_MIN + extraStops * PER_EXTRA_STOP;
}

/** Approximate trip duration in minutes from distance (assumes ~25 km/h
 * urban Delhi NCR traffic). Illustrative only — not live traffic data. */
function estMinutes(distanceKm: number): number {
  return Math.round((distanceKm / 25) * 60);
}

/**
 * Score every sample rider against the request and return a ranked list with
 * fare splits. Riders above a minimum compatibility threshold are returned.
 */
export function findMatches(req: RideRequest, riders: SampleRider[]): MatchResult[] {
  if (
    !req.departureTime ||
    !req.destination.trim() ||
    !req.pickup.trim() ||
    Number.isNaN(Date.parse(req.departureTime))
  ) {
    return [];
  }

  const results: MatchResult[] = [];
  for (const rider of riders) {
    const { score, destSim, diffMin } = compatibilityScore(req, rider);
    if (score < 35) continue;

    const combinedPassengers = req.passengerCount + rider.passengerCount;
    const extraStops = combinedPassengers > 2 ? Math.ceil((combinedPassengers - 2) / 2) : 0;
    const totalFare = estimateTotalFare(rider.distanceKm, estMinutes(rider.distanceKm), extraStops);
    const perPerson = totalFare / combinedPassengers;
    // Solo fare the user would otherwise pay for the same route.
    const soloFare = estimateTotalFare(rider.distanceKm, estMinutes(rider.distanceKm), 0);
    const savings = soloFare - perPerson;

    results.push({
      rider,
      routeCompatibility: score,
      departureDiffMinutes: Math.round(diffMin),
      destinationSimilarity: destSim,
      estimatedTotalFare: Math.round(totalFare * 100) / 100,
      estimatedPerPerson: Math.round(perPerson * 100) / 100,
      estimatedSavings: Math.round(savings * 100) / 100,
      combinedPassengers,
    });
  }

  results.sort((a, b) => b.routeCompatibility - a.routeCompatibility);
  return results;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // Always render in India Standard Time (Asia/Kolkata) for consistency.
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

export function formatMoney(n: number): string {
  // Indian numbering grouping (e.g. 1,234) via en-IN, two decimals for fares.
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
