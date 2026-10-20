import { useMemo, useState } from 'react';
import type { RideRequest, VenueType } from '@/lib/types';
import { VENUE_TYPE_LABELS } from '@/lib/types';
import VenueTypeSelect from './VenueTypeSelect';
import { VENUES, DESTINATION_SUGGESTIONS } from '@/lib/sampleRiders';
import { Clock, MapPin, Search, Users, ChevronDown, Pencil } from 'lucide-react';

interface Props {
  value: RideRequest;
  onChange: (next: RideRequest) => void;
  onSubmit: () => void;
}

const FIELDS = {
  label: 'block text-sm font-medium text-slate-700',
  input:
    'mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ' +
    'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100',
  errorInput:
    'mt-1 block w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
    'placeholder:text-rose-300 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100',
  help: 'mt-1 text-xs text-slate-400',
  error: 'mt-1 text-xs text-rose-600',
};

const CUSTOM_VENUE_VALUE = '__custom__';

interface Errors {
  venueName?: string;
  pickup?: string;
  destination?: string;
  departureTime?: string;
  passengerCount?: string;
}

export default function RideRequestForm({ value, onChange, onSubmit }: Props) {
  // Track whether the user has manually edited the pickup for the current
  // venue, so selecting a known venue auto-fills pickup only when untouched.
  const [pickupEdited, setPickupEdited] = useState(false);
  // Whether the venue name is in "custom entry" mode (free text) for types
  // that allow custom venues (concert, other) or when the user picks custom.
  const [customVenue, setCustomVenue] = useState(() => !isKnownVenue(value));

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (value.venueName.trim().length < 2) e.venueName = 'Select or enter a venue.';
    if (value.pickup.trim().length < 2) e.pickup = 'Add a pickup spot.';
    if (value.destination.trim().length < 2) e.destination = 'Add a destination.';
    if (!value.departureTime || Number.isNaN(Date.parse(value.departureTime)))
      e.departureTime = 'Choose a departure time.';
    if (value.passengerCount < 1) e.passengerCount = 'At least 1 passenger.';
    return e;
  }, [value]);

  const valid = Object.keys(errors).length === 0 && value.passengerCount <= 6 && value.windowMinutes >= 0;

  const update = <K extends keyof RideRequest>(k: K, v: RideRequest[K]) =>
    onChange({ ...value, [k]: v });

  const handleVenueTypeChange = (nextType: VenueType) => {
    const options = VENUES[nextType];
    // Reset venue + pickup to the new type's first known venue, or clear for
    // custom-only types. This guarantees a Railway pick can never persist when
    // the user switches to Airport, etc.
    if (options.length > 0) {
      const first = options[0];
      setCustomVenue(false);
      setPickupEdited(false);
      onChange({
        ...value,
        venueType: nextType,
        venueName: first.name,
        pickup: first.defaultPickup,
      });
    } else {
      setCustomVenue(true);
      setPickupEdited(false);
      onChange({
        ...value,
        venueType: nextType,
        venueName: '',
        pickup: '',
      });
    }
  };

  const handleVenueSelect = (selected: string) => {
    if (selected === CUSTOM_VENUE_VALUE) {
      setCustomVenue(true);
      setPickupEdited(false);
      onChange({ ...value, venueName: '', pickup: '' });
      return;
    }
    const opt = VENUES[value.venueType].find((o) => o.name === selected);
    if (!opt) return;
    setCustomVenue(false);
    const next: RideRequest = { ...value, venueName: opt.name };
    if (!pickupEdited) next.pickup = opt.defaultPickup;
    onChange(next);
  };

  const handlePickupChange = (pickup: string) => {
    setPickupEdited(true);
    update('pickup', pickup);
  };

  const venueOptions = VENUES[value.venueType];
  const allowCustomVenue = value.venueType === 'concert' || value.venueType === 'other';

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit();
      }}
      noValidate
    >
      <h2 className="text-lg font-semibold text-slate-900">Your ride request</h2>
      <p className="mt-1 text-sm text-slate-500">
        Tell us where you're leaving from and where you're headed. We'll match you with riders heading the same way.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className={FIELDS.label}>Venue type</label>
          <div className="mt-1">
            <VenueTypeSelect value={value.venueType} onChange={handleVenueTypeChange} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={FIELDS.label} htmlFor="venueSelect">
              Venue
            </label>
            {venueOptions.length > 0 ? (
              <div className="relative mt-1">
                <select
                  id="venueSelect"
                  className={FIELDS.input + ' appearance-none pr-9 ' + (errors.venueName ? '!border-rose-300' : '')}
                  value={customVenue ? CUSTOM_VENUE_VALUE : value.venueName}
                  onChange={(e) => handleVenueSelect(e.target.value)}
                >
                  {venueOptions.map((o) => (
                    <option key={o.name} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                  {allowCustomVenue && <option value={CUSTOM_VENUE_VALUE}>Custom venue…</option>}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            ) : (
              <div className="relative mt-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="venueSelect"
                  className={(errors.venueName ? FIELDS.errorInput : FIELDS.input) + ' pl-9'}
                  placeholder="e.g. Sector 62 community market exit"
                  value={value.venueName}
                  onChange={(e) => update('venueName', e.target.value)}
                />
              </div>
            )}
            {errors.venueName ? (
              <p className={FIELDS.error}>{errors.venueName}</p>
            ) : customVenue || venueOptions.length === 0 ? (
              <p className={FIELDS.help}>Type the venue name. Demo data only.</p>
            ) : (
              <p className={FIELDS.help}>Pick a known venue, or choose custom to type your own.</p>
            )}
          </div>

          <div>
            <label className={FIELDS.label} htmlFor="pickup">
              Pickup spot
            </label>
            <div className="relative mt-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="pickup"
                className={(errors.pickup ? FIELDS.errorInput : FIELDS.input) + ' pl-9'}
                placeholder="e.g. Terminal 3 arrivals pickup point"
                value={value.pickup}
                onChange={(e) => handlePickupChange(e.target.value)}
              />
              <Pencil className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
            </div>
            {errors.pickup ? (
              <p className={FIELDS.error}>{errors.pickup}</p>
            ) : (
              <p className={FIELDS.help}>Auto-filled as a suggestion — edit to match the exact spot. Not an officially approved pickup.</p>
            )}
          </div>
        </div>

        <div>
          <label className={FIELDS.label} htmlFor="destination">
            Destination
          </label>
          <div className="relative mt-1">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="destination"
              list="destination-suggestions"
              className={(errors.destination ? FIELDS.errorInput : FIELDS.input) + ' pl-9'}
              placeholder="e.g. Cyber City, Gurugram"
              value={value.destination}
              onChange={(e) => update('destination', e.target.value)}
            />
            <datalist id="destination-suggestions">
              {DESTINATION_SUGGESTIONS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
          {errors.destination ? <p className={FIELDS.error}>{errors.destination}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={FIELDS.label} htmlFor="departureTime">
              Departure time
            </label>
            <div className="relative mt-1">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="departureTime"
                type="datetime-local"
                className={(errors.departureTime ? FIELDS.errorInput : FIELDS.input) + ' pl-9'}
                value={value.departureTime}
                onChange={(e) => update('departureTime', e.target.value)}
              />
            </div>
            {errors.departureTime ? <p className={FIELDS.error}>{errors.departureTime}</p> : null}
            <p className={FIELDS.help}>Times show in India Standard Time.</p>
          </div>
          <div>
            <label className={FIELDS.label} htmlFor="windowMinutes">
              Window (± min)
            </label>
            <select
              id="windowMinutes"
              className={FIELDS.input}
              value={value.windowMinutes}
              onChange={(e) => update('windowMinutes', Number(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div>
            <label className={FIELDS.label} htmlFor="passengerCount">
              Passengers
            </label>
            <div className="relative mt-1">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="passengerCount"
                type="number"
                min={1}
                max={6}
                className={(errors.passengerCount ? FIELDS.errorInput : FIELDS.input) + ' pl-9'}
                value={value.passengerCount}
                onChange={(e) => update('passengerCount', Math.max(1, Number(e.target.value)))}
              />
            </div>
            {errors.passengerCount ? <p className={FIELDS.error}>{errors.passengerCount}</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Matching against {VENUE_TYPE_LABELS[value.venueType].toLowerCase()} sample riders — fictional demo data.
        </p>
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Search className="h-4 w-4" /> Find matches
        </button>
      </div>
    </form>
  );
}

function isKnownVenue(req: RideRequest): boolean {
  return VENUES[req.venueType].some((o) => o.name === req.venueName);
}
