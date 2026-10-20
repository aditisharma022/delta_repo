import { ArrowRight, ShieldCheck, Users2, MapPinned } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export default function Landing({ onStart }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* subtle background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
      </div>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Demo · sample riders only
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Your way home, together
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Leaving a concert, airport, or train station? ExitMate matches you with people heading
          the same direction around the same time — so you can split a cab and save.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Start matching <ArrowRight className="h-5 w-5" />
        </button>
        <p className="mt-3 text-xs text-slate-400">
          No sign-up needed for this demo · fictional sample riders
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: MapPinned,
              title: 'Smart matching',
              body: 'Transparent scoring by departure time and destination overlap.',
            },
            {
              icon: Users2,
              title: 'Fair fare splits',
              body: 'See estimated per-person cost and savings before you commit.',
            },
            {
              icon: ShieldCheck,
              title: 'No surprises',
              body: 'Estimates, not live quotes. No payments, no real bookings.',
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
