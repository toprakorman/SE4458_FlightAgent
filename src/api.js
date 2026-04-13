// ─── Backend API helpers ────────────────────────────────────────────────────
// All calls go to your EC2 Flask backend (SE4458 Midterm)

export async function searchFlights(baseUrl, params) {
  const q = new URLSearchParams({
    date_from:    params.date_from,
    airport_from: params.airport_from,
    airport_to:   params.airport_to,
    people:       params.people || 1,
    page:         1,
    per_page:     10,
  });
  const res = await fetch(`${baseUrl}/api/v1/flights/search?${q}`);
  const data = await res.json();
  return { status: res.status, data };
}

export async function bookFlight(baseUrl, jwt, params) {
  const res = await fetch(`${baseUrl}/api/v1/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      flight_number:   params.flight_number,
      date:            params.date,
      passenger_names: params.passenger_names || ['Passenger'],
      trip_type:       params.trip_type || 'one_way',
    }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

export async function checkIn(baseUrl, params) {
  const res = await fetch(`${baseUrl}/api/v1/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      flight_number:  params.flight_number,
      date:           params.date,
      passenger_name: params.passenger_name,
    }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

// ─── AI Agent (Claude API) ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful flight booking AI agent for an airline system (SE4458 midterm project).
You help users search for flights, book tickets, and check in.

You have access to these actions:
- search_flights: Search available flights.
  Required params: date_from (YYYY-MM-DD), airport_from (IATA), airport_to (IATA), people (number, default 1)
- book_flight: Book a ticket.
  Required params: flight_number, date (YYYY-MM-DD), passenger_names (array of strings), trip_type ("one_way" or "round_trip")
- checkin: Check in a passenger.
  Required params: flight_number, date (YYYY-MM-DD), passenger_name (string)
- chat: General conversation, no API call needed.

Common IATA codes:
IST = Istanbul Ataturk, SAW = Istanbul Sabiha, FRA = Frankfurt,
ESB = Ankara, ADB = Izmir, AYT = Antalya, LHR = London Heathrow,
CDG = Paris, MUC = Munich, AMS = Amsterdam, DXB = Dubai.

Always respond with ONLY a raw JSON object (no markdown, no backticks):
{
  "action": "search_flights" | "book_flight" | "checkin" | "chat",
  "params": { ...relevant params },
  "message": "Friendly message explaining what you are doing or your answer"
}

If the user's request is missing required information (e.g. date, passenger name), use action "chat" and ask for it.`;

export async function askAgent(history) {
  // Calls local proxy (proxy/server.js) instead of Anthropic directly.
  // Browsers block direct calls to api.anthropic.com due to CORS.
  // Run: cd proxy && npm install && node server.js
  const res = await fetch('http://localhost:3001/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      'claude-sonnet-4-5',
      max_tokens: 1000,
      system:     SYSTEM_PROMPT,
      messages:   history,
    }),
  });

  const data = await res.json();
  console.log('[Claude raw response]', JSON.stringify(data, null, 2));

  // Handle API-level errors (e.g. invalid key, quota exceeded)
  if (data.error) {
    const errMsg = data.error.message || JSON.stringify(data.error);
    return { action: 'chat', message: 'API error: ' + errMsg, params: {} };
  }

  const raw = (data.content || []).map(b => b.text || '').join('').trim();
  console.log('[Claude raw text]', raw);

  if (!raw) {
    return { action: 'chat', message: 'I received an empty response. Please try again.', params: {} };
  }

  // Strip markdown code fences if Claude wrapped the JSON in them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed.message) parsed.message = 'Done!';
    return parsed;
  } catch (_) {}

  // Try to extract a JSON object from anywhere in the text
  try {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (!parsed.message) parsed.message = 'Done!';
      return parsed;
    }
  } catch (_) {}

  // Claude returned plain text — just display it
  return { action: 'chat', message: raw, params: {} };
}
