export type VenueType = 'airport' | 'railway' | 'isbt' | 'concert' | 'metro' | 'other';

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  airport: 'Airport',
  railway: 'Railway station',
  isbt: 'ISBT / Bus terminal',
  concert: 'Concert / Stadium',
  metro: 'Metro station',
  other: 'Other crowded venue',
};

export interface RideRequest {
  venueType: VenueType;
  venueName: string;
  pickup: string;
  destination: string;
  /** ISO datetime-local string, e.g. 2026-10-19T22:30 */
  departureTime: string;
  /** minutes window either side of departureTime */
  windowMinutes: number;
  passengerCount: number;
}

export interface SampleRider {
  id: string;
  name: string;
  avatarColor: string;
  destination: string;
  /** ISO datetime-local string */
  departureTime: string;
  passengerCount: number;
  pickup: string;
  /** sample route distance in km used for fare estimation */
  distanceKm: number;
  note?: string;
  fictional: true;
}

export interface MatchResult {
  rider: SampleRider;
  routeCompatibility: number; // 0-100
  departureDiffMinutes: number;
  destinationSimilarity: number; // 0-1
  estimatedTotalFare: number;
  estimatedPerPerson: number;
  estimatedSavings: number;
  combinedPassengers: number;
}

export interface EventIntelResult {
  status: 'live' | 'demo' | 'error';
  query: string;
  summary: string;
  sources: { title: string; url: string; snippet?: string }[];
  message?: string;
}
