import { useMemo, useState } from 'react';
import { Car, ArrowLeft } from 'lucide-react';
import type { RideRequest, MatchResult } from '@/lib/types';
import { SAMPLE_RIDERS, DEFAULT_VENUE_TYPE, DEFAULT_VENUE, DEFAULT_DESTINATION } from '@/lib/sampleRiders';
import { findMatches } from '@/lib/matching';
import Landing from '@/components/Landing';
import RideRequestForm from '@/components/RideRequestForm';
import MatchResults from '@/components/MatchResults';
import Confirmation from '@/components/Confirmation';
import EventIntelPanel from '@/components/EventIntelPanel';

type Stage = 'landing' | 'form' | 'results';

const DEFAULT_REQUEST: RideRequest = {
  venueType: DEFAULT_VENUE_TYPE,
  venueName: DEFAULT_VENUE.name,
  pickup: DEFAULT_VENUE.defaultPickup,
  destination: DEFAULT_DESTINATION,
  departureTime: '2026-10-19T22:20',
  windowMinutes: 30,
  passengerCount: 1,
};

export default function App() {
  const [stage, setStage] = useState<Stage>('landing');
  const [request, setRequest] = useState<RideRequest>(DEFAULT_REQUEST);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [joined, setJoined] = useState<MatchResult | null>(null);
  const joinedId = joined?.rider.id ?? null;

  const matches = useMemo(() => findMatches(request, SAMPLE_RIDERS), [request]);

  const handleSubmit = () => {
    setResults(matches);
    setJoined(null);
    setStage('results');
  };

  const handleJoin = (riderId: string) => {
    const m = (results ?? matches).find((x) => x.rider.id === riderId);
    if (m) setJoined(m);
  };

  const handleReset = () => {
    setJoined(null);
    setStage('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => setStage('landing')}
            className="flex items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Car className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">ExitMate</span>
          </button>
          {stage !== 'landing' && (
            <button
              type="button"
              onClick={() => setStage('form')}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Edit request
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {stage === 'landing' && <Landing onStart={() => setStage('form')} />}

        {stage !== 'landing' && (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RideRequestForm
                value={request}
                onChange={(next) => {
                  setRequest(next);
                  if (stage === 'results') {
                    setResults(findMatches(next, SAMPLE_RIDERS));
                    setJoined(null);
                  }
                }}
                onSubmit={handleSubmit}
              />

              {stage === 'results' && results !== null && (
                <div className="mt-6">
                  {joined ? (
                    <Confirmation match={joined} request={request} onReset={handleReset} />
                  ) : (
                    <MatchResults
                      matches={results}
                      request={request}
                      joinedId={joinedId}
                      onJoin={handleJoin}
                    />
                  )}
                </div>
              )}
            </div>

            <aside className="lg:col-span-2">
              <div className="lg:sticky lg:top-20 space-y-4">
                <EventIntelPanel
                  venueName={request.venueName}
                  venueType={request.venueType}
                  destination={request.destination}
                />
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-500 shadow-sm">
                  <p className="font-medium text-slate-700">About this demo</p>
                  <p className="mt-1.5">
                    All riders shown are fictional sample data. Fares are transparent estimates
                    based on a fixed rate, not live quotes. ExitMate does not make real bookings,
                    verify identities, or process payments.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-slate-400">
          ExitMate · demo MVP · no real bookings, live riders, or payments
        </div>
      </footer>
    </div>
  );
}
