import { CheckCircle2, Clock, MapPin, Users, ArrowRight, BadgeInfo } from 'lucide-react';
import type { MatchResult, RideRequest } from '@/lib/types';
import { formatMoney, formatTime } from '@/lib/matching';

interface Props {
  matches: MatchResult[];
  request: RideRequest;
  joinedId: string | null;
  onJoin: (riderId: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-indigo-500';
  if (score >= 45) return 'bg-amber-500';
  return 'bg-slate-400';
}

function RouteViz({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <div className="relative h-1 flex-1 rounded-full bg-slate-200">
        <div
          className={'absolute left-0 top-0 h-full rounded-full ' + scoreColor(score)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
    </div>
  );
}

export default function MatchResults({ matches, request, joinedId, onJoin }: Props) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <MapPin className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">No matches yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          We couldn't find riders heading in a similar direction within a useful time window.
          Try widening your departure window or adjusting your destination.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {matches.length} match{matches.length === 1 ? '' : 'es'}
        </h2>
        <p className="text-xs text-slate-400">Fares are estimates, not live quotes</p>
      </div>

      <div className="grid gap-4">
        {matches.map((m) => {
          const joined = joinedId === m.rider.id;
          return (
            <article
              key={m.rider.id}
              className={
                'rounded-2xl border bg-white p-5 shadow-sm transition ' +
                (joined ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200')
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: m.rider.avatarColor }}
                    aria-hidden
                  >
                    {m.rider.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {m.rider.name}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        Sample rider
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> Departs {formatTime(m.rider.departureTime)}
                      <span className="mx-1 text-slate-300">·</span>
                      <Users className="h-3.5 w-3.5" /> {m.rider.passengerCount} seat
                      {m.rider.passengerCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Route compatibility
                  </p>
                  <p className="text-xl font-bold text-slate-900">{m.routeCompatibility}%</p>
                </div>
              </div>

              <div className="mt-4">
                <RouteViz score={m.routeCompatibility} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Destination</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{m.rider.destination}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {Math.round(m.destinationSimilarity * 100)}% destination overlap ·
                    {' '}{m.departureDiffMinutes} min apart
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Per-person fare (est.)</p>
                  <p className="mt-0.5 text-xl font-bold text-indigo-700">
                    {formatMoney(m.estimatedPerPerson)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {m.combinedPassengers} riders sharing
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-700">You save (est.)</p>
                  <p className="mt-0.5 text-xl font-bold text-emerald-700">
                    {formatMoney(m.estimatedSavings)}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-600/80">
                    vs. solo fare {formatMoney(m.estimatedTotalFare + m.estimatedSavings)}
                  </p>
                </div>
              </div>

              {m.rider.note && (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                  <BadgeInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {m.rider.note}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Total estimated fare: {formatMoney(m.estimatedTotalFare)}
                </p>
                {joined ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" /> Joined
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJoin(m.rider.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Join ride <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
