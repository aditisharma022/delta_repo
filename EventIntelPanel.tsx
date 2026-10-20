import { useEffect, useState } from 'react';
import { Loader2, Sparkles, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import type { EventIntelResult } from '@/lib/types';

interface Props {
  venueName: string;
  venueType: string;
  destination: string;
}

/**
 * Event Intelligence panel. Calls the Supabase edge function which proxies
 * TinyFish server-side. Shows live / demo / error states clearly.
 */
export default function EventIntelPanel({ venueName, venueType, destination }: Props) {
  const [state, setState] = useState<EventIntelResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venueName.trim()) {
      setState(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setState(null);

    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-intel`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ venueName, venueType, destination }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as EventIntelResult;
        if (!cancelled) setState(data);
      } catch (err) {
        if (!cancelled) {
          setState({
            status: 'error',
            query: '',
            summary: '',
            sources: [],
            message: `Couldn't load event info: ${(err as Error).message}`,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [venueName, venueType, destination]);

  if (!venueName.trim() && !loading && !state) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-900">Event intelligence</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Public information about your venue, gathered by TinyFish. Not live event data.
      </p>

      {loading && (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Researching {venueName}…
        </div>
      )}

      {!loading && state?.status === 'live' && (
        <div className="mt-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live TinyFish results
          </span>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{state.summary}</p>
          {state.sources.length > 0 && (
            <ul className="mt-4 space-y-2">
              {state.sources.map((s, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                  <div className="min-w-0">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium text-indigo-700 hover:underline"
                    >
                      {s.title}
                    </a>
                    {s.snippet && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.snippet}</p>
                    )}
                    <p className="mt-0.5 truncate text-xs text-slate-400">{s.url}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!loading && (state?.status === 'demo' || state?.status === 'error') && (
        <div className="mt-5 rounded-lg bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            {state.message ?? 'Demo data — TinyFish not connected'}
          </div>
          {state.summary && (
            <p className="mt-2 text-sm leading-relaxed text-amber-900/80">{state.summary}</p>
          )}
        </div>
      )}

      {!loading && state?.status === 'live' && state.sources.length === 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" /> No sources returned for this venue.
        </p>
      )}
    </section>
  );
}
