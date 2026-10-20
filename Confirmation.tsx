import { CheckCircle2, Clock, MapPin, Users, RotateCcw } from 'lucide-react';
import type { MatchResult, RideRequest } from '@/lib/types';
import { formatMoney, formatTime } from '@/lib/matching';

interface Props {
  match: MatchResult;
  request: RideRequest;
  onReset: () => void;
}

export default function Confirmation({ match, request, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-slate-900">Ride joined</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        You've expressed interest in sharing a ride with {match.rider.name}. This is a demo
        match — no real booking has been made.
      </p>

      <div className="mt-5 rounded-xl bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: match.rider.avatarColor }}
            aria-hidden
          >
            {match.rider.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{match.rider.name}</p>
            <p className="text-xs text-slate-500">Sample rider · fictional demo data</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-slate-500">Pickup</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {request.pickup}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-slate-500">Heading to</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {match.rider.destination}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-slate-500">Departure</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-800">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> {formatTime(match.rider.departureTime)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-slate-500">Passengers</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-800">
              <Users className="h-3.5 w-3.5 text-slate-400" /> {match.combinedPassengers} sharing
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-slate-500">Your share (est.)</p>
            <p className="mt-0.5 text-lg font-bold text-indigo-700">
              {formatMoney(match.estimatedPerPerson)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-slate-500">You save (est.)</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-700">
              {formatMoney(match.estimatedSavings)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-slate-500">Compatibility</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {match.routeCompatibility}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        ExitMate doesn't process payments, verify identities, or make real bookings.
        Coordinate pickup details directly with your match.
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" /> Find a different ride
      </button>
    </div>
  );
}
