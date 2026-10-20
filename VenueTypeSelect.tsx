import { Plane, Train, Bus, Music, TramFront, MapPin } from 'lucide-react';
import type { VenueType } from '@/lib/types';
import { VENUE_TYPE_LABELS } from '@/lib/types';

interface Props {
  value: VenueType;
  onChange: (v: VenueType) => void;
}

const OPTIONS: { value: VenueType; label: string; icon: typeof Plane }[] = [
  { value: 'airport', label: VENUE_TYPE_LABELS.airport, icon: Plane },
  { value: 'railway', label: VENUE_TYPE_LABELS.railway, icon: Train },
  { value: 'isbt', label: VENUE_TYPE_LABELS.isbt, icon: Bus },
  { value: 'concert', label: VENUE_TYPE_LABELS.concert, icon: Music },
  { value: 'metro', label: VENUE_TYPE_LABELS.metro, icon: TramFront },
  { value: 'other', label: VENUE_TYPE_LABELS.other, icon: MapPin },
];

export default function VenueTypeSelect({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition ' +
              (active
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50')
            }
            aria-pressed={active}
          >
            <Icon className="h-5 w-5" />
            <span className="text-center text-[11px] font-medium leading-tight">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
