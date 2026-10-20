import type { SampleRider, VenueType } from './types';

/**
 * Clearly-labeled FICTIONAL sample riders based in Delhi NCR, India. All have
 * fictional: true and are used purely to demonstrate the matching algorithm.
 * None represent real people or live ride offers. Distances are illustrative.
 */
export const SAMPLE_RIDERS: SampleRider[] = [
  {
    id: 'r1',
    name: 'Aisha K.',
    avatarColor: '#6366f1',
    destination: 'Cyber City, Gurugram',
    departureTime: '2026-10-19T22:15',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 18,
    note: 'Two carry-ons, heading via the expressway.',
    fictional: true,
  },
  {
    id: 'r2',
    name: 'Marco D.',
    avatarColor: '#0ea5e9',
    destination: 'Sector 56, Noida',
    departureTime: '2026-10-19T22:30',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 33,
    note: 'One suitcase, no rush.',
    fictional: true,
  },
  {
    id: 'r3',
    name: 'Priya S.',
    avatarColor: '#10b981',
    destination: 'Greater Kailash, South Delhi',
    departureTime: '2026-10-19T22:05',
    passengerCount: 2,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 16,
    note: 'Couple travelling together.',
    fictional: true,
  },
  {
    id: 'r4',
    name: 'Daniel R.',
    avatarColor: '#f59e0b',
    destination: 'Dwarka, New Delhi',
    departureTime: '2026-10-19T22:45',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 12,
    note: 'Heading towards Sector 21.',
    fictional: true,
  },
  {
    id: 'r5',
    name: 'Hannah L.',
    avatarColor: '#ec4899',
    destination: 'Saket, South Delhi',
    departureTime: '2026-10-19T22:20',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 17,
    note: 'Light baggage, leaving a conference.',
    fictional: true,
  },
  {
    id: 'r6',
    name: 'Tom B.',
    avatarColor: '#8b5cf6',
    destination: 'Indirapuram, Ghaziabad',
    departureTime: '2026-10-19T22:40',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 35,
    note: 'One bag, flexible on route.',
    fictional: true,
  },
  {
    id: 'r7',
    name: 'Sofia M.',
    avatarColor: '#14b8a6',
    destination: 'Sector 62, Noida',
    departureTime: '2026-10-19T22:00',
    passengerCount: 2,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 34,
    note: 'Heading via the Noida Expressway.',
    fictional: true,
  },
  {
    id: 'r8',
    name: 'Liam F.',
    avatarColor: '#ef4444',
    destination: 'DLF Phase 5, Gurugram',
    departureTime: '2026-10-19T22:35',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 22,
    note: 'Willing to share via the Dwarka Expressway.',
    fictional: true,
  },
  {
    id: 'r9',
    name: 'Grace W.',
    avatarColor: '#0f766e',
    destination: 'Vasant Vihar, New Delhi',
    departureTime: '2026-10-19T22:10',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 11,
    note: 'Heading up the Airport Express Line road.',
    fictional: true,
  },
  {
    id: 'r10',
    name: 'Noah P.',
    avatarColor: '#d97706',
    destination: 'Connaught Place, New Delhi',
    departureTime: '2026-10-19T22:50',
    passengerCount: 1,
    pickup: 'IGI Airport Terminal 3',
    distanceKm: 19,
    note: 'Late deplaning, easy going.',
    fictional: true,
  },
];

/**
 * Venue registry. Each known venue has a name and a SENSIBLE DEFAULT pickup
 * description. The pickup description names a general area of the venue
 * (e.g. "arrivals pickup point") and deliberately avoids specific gate numbers
 * or any claim of official approval. The user can always edit it.
 *
 * Custom venue types (`concert`, `other`) have no pre-seeded venues; users type
 * their own venue name and pickup.
 */
export interface VenueOption {
  name: string;
  /** Default pickup description — editable, not an officially approved spot. */
  defaultPickup: string;
}

export const VENUES: Record<VenueType, VenueOption[]> = {
  airport: [
    { name: 'IGI Airport Terminal 1', defaultPickup: 'Terminal 1 arrivals pickup point' },
    { name: 'IGI Airport Terminal 2', defaultPickup: 'Terminal 2 arrivals pickup point' },
    { name: 'IGI Airport Terminal 3', defaultPickup: 'Terminal 3 arrivals pickup point' },
  ],
  railway: [
    { name: 'New Delhi Railway Station', defaultPickup: 'Main porch pickup area, New Delhi station' },
    { name: 'Hazrat Nizamuddin Railway Station', defaultPickup: 'Station porch pickup area, Hazrat Nizamuddin' },
    { name: 'Anand Vihar Terminal', defaultPickup: 'Terminal porch pickup area, Anand Vihar' },
    { name: 'Old Delhi Railway Station', defaultPickup: 'Main porch pickup area, Old Delhi station' },
    { name: 'Delhi Cantt Railway Station', defaultPickup: 'Station porch pickup area, Delhi Cantt' },
    { name: 'Delhi Sarai Rohilla Railway Station', defaultPickup: 'Station porch pickup area, Sarai Rohilla' },
  ],
  isbt: [
    { name: 'Maharana Pratap ISBT, Kashmere Gate', defaultPickup: 'ISBT Kashmere Gate pickup bay' },
    { name: 'Swami Vivekanand ISBT, Anand Vihar', defaultPickup: 'ISBT Anand Vihar pickup bay' },
    { name: 'Veer Hakikat Rai ISBT, Sarai Kale Khan', defaultPickup: 'ISBT Sarai Kale Khan pickup bay' },
  ],
  concert: [
    { name: 'Jawaharlal Nehru Stadium', defaultPickup: 'Stadium perimeter pickup zone (check signage on site)' },
    { name: 'Indira Gandhi Arena', defaultPickup: 'Arena perimeter pickup zone (check signage on site)' },
  ],
  metro: [
    { name: 'Rajiv Chowk Metro Station', defaultPickup: 'Metro station exit, main road pickup point' },
    { name: 'Kashmere Gate Metro Station', defaultPickup: 'Metro station exit, main road pickup point' },
    { name: 'Hauz Khas Metro Station', defaultPickup: 'Metro station exit, main road pickup point' },
    { name: 'Botanical Garden Metro Station', defaultPickup: 'Metro station exit, main road pickup point' },
    { name: 'Sikandarpur Metro Station', defaultPickup: 'Metro station exit, main road pickup point' },
  ],
  other: [],
};

/**
 * The first airport venue is used as the default demo selection. Kept here so
 * App.tsx and the form share a single source of truth.
 */
export const DEFAULT_VENUE_TYPE: VenueType = 'airport';
export const DEFAULT_VENUE = VENUES.airport[2]; // IGI Airport Terminal 3
export const DEFAULT_DESTINATION = 'Cyber City, Gurugram';

/** Indian destination suggestions for the destination datalist. */
export const DESTINATION_SUGGESTIONS: string[] = [
  'Gurugram',
  'Cyber City, Gurugram',
  'DLF Phase 5, Gurugram',
  'Noida',
  'Sector 62, Noida',
  'Sector 56, Noida',
  'Greater Noida',
  'Ghaziabad',
  'Indirapuram, Ghaziabad',
  'Faridabad',
  'South Delhi',
  'Greater Kailash, South Delhi',
  'Saket, South Delhi',
  'Vasant Vihar, New Delhi',
  'Connaught Place, New Delhi',
  'Dwarka, New Delhi',
  'Rohini, New Delhi',
  'Jaipur',
  'Chandigarh',
];
