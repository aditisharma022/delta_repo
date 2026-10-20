// ExitMate event-intelligence edge function.
// Proxies a TinyFish Search API call using the server-side TINYFISH_API_KEY
// secret so the key never reaches the browser. Returns a normalized summary
// with source URLs. When the key is missing or the upstream call fails, it
// returns a structured "demo" status so the UI can show a clear fallback
// message — sample ride matching stays fully functional regardless.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SearchResponse {
  query?: string;
  results?: Array<{
    position?: number;
    title?: string;
    snippet?: string;
    url?: string;
    site_name?: string;
  }>;
  total_results?: number;
}

interface IntelPayload {
  status: 'live' | 'demo' | 'error';
  query: string;
  venueName: string;
  venueType: string;
  summary: string;
  sources: { title: string; url: string; snippet?: string }[];
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const venueName = String(body.venueName ?? '').trim();
    const venueType = String(body.venueType ?? 'venue').trim();
    const destination = String(body.destination ?? '').trim();

    if (!venueName) {
      return new Response(
        JSON.stringify({
          status: 'error',
          query: '',
          venueName,
          venueType,
          summary: '',
          sources: [],
          message: 'Missing venueName in request body.',
        } satisfies IntelPayload),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('TINYFISH_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          status: 'demo',
          query: buildQuery(venueName, venueType, destination),
          venueName,
          venueType,
          summary: `${venueName} is a major ${labelFor(venueType)} in Delhi NCR. Typical late-evening exit options include ` +
            `app-based cab pickup zones, prepaid taxi booths, and Delhi Metro transit. Passengers leaving ` +
            `around the same time often share rides towards Gurugram, Noida, or South Delhi to split the fare. ` +
            `This is demo text because TINYFISH_API_KEY is not configured on the server.`,
          sources: [],
          message: 'Demo data — TinyFish not connected',
        } satisfies IntelPayload),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const query = buildQuery(venueName, venueType, destination);
    const url =
      'https://api.search.tinyfish.ai?query=' +
      encodeURIComponent(query) +
      '&num=6';

    const upstream = await fetch(url, {
      headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return new Response(
        JSON.stringify({
          status: 'demo',
          query,
          venueName,
          venueType,
          summary:
            `We could not reach TinyFish for live event information (upstream returned ${upstream.status}). ` +
            `Showing demo data so the rest of ExitMate stays usable.`,
          sources: [],
          message: 'Demo data — TinyFish request failed',
        } satisfies IntelPayload),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = (await upstream.json()) as SearchResponse;
    const results = Array.isArray(data.results) ? data.results.slice(0, 6) : [];
    const sources = results
      .filter((r) => r && r.url)
      .map((r) => ({
        title: r.title ?? r.site_name ?? r.url,
        url: r.url as string,
        snippet: r.snippet,
      }));

    const summary = buildSummary(venueName, venueType, results.map((r) => r.snippet).filter(Boolean) as string[]);

    return new Response(
      JSON.stringify({
        status: 'live',
        query,
        venueName,
        venueType,
        summary,
        sources,
      } satisfies IntelPayload),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: 'error',
        query: '',
        venueName: '',
        venueType: '',
        summary: '',
        sources: [],
        message: `Server error: ${(err as Error).message ?? 'unknown'}`,
      } satisfies IntelPayload),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

function buildQuery(venueName: string, venueType: string, destination: string): string {
  const base = `${venueName} Delhi NCR India ${labelFor(venueType)} exit transport pickup taxi cab metro rideshare`;
  if (destination) return `${base} directions to ${destination}`;
  return base;
}

function buildSummary(venueName: string, venueType: string, snippets: string[]): string {
  if (snippets.length === 0) {
    return `Found public information about ${venueName}. Review the linked sources for exit ` +
      `routes, pickup zones, and transit guidance.`;
  }
  const joined = snippets.slice(0, 3).map((s) => s.replace(/\s+/g, ' ').trim()).join(' ');
  return `Information gathered from TinyFish about ${venueName} (${labelFor(venueType)}): ${joined}`;
}

const VENUE_TYPE_LABELS: Record<string, string> = {
  airport: 'airport',
  railway: 'railway station',
  isbt: 'bus terminal',
  concert: 'concert / stadium venue',
  metro: 'metro station',
  other: 'venue',
};

function labelFor(venueType: string): string {
  return VENUE_TYPE_LABELS[venueType] ?? 'venue';
}
