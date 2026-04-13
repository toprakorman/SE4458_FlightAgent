# SE4458 — Assignment 2: Flight AI Agent Chat Application

## Source Code
- Frontend (this repo): https://github.com/toprakorman/SE4458_FlightAgent
- Backend (Midterm API): https://github.com/toprakorman/SE4458_Midterm

## Demo Video
> _Add your Google Drive / YouTube link here_

---

## Overview

This project is an AI Agent chat application that provides a natural-language interface for interacting with the Airline Ticketing API built in the SE4458 Midterm. Users can search for flights, book tickets, and check in — all through a conversational UI.

---

## Architecture

```
User (Browser)
    │
    ▼
React Frontend (Chat UI)
    │
    ├──► Claude API (claude-sonnet-4)   ← Intent parsing & NLU
    │         │ returns: action + params
    │
    └──► EC2 Flask Backend (Midterm API)
              ├── GET  /api/v1/flights/search   (Query Flight)
              ├── POST /api/v1/bookings          (Book Flight)
              └── POST /api/v1/checkin           (Check In)
```

**Flow per message:**
1. User types a natural language message
2. React sends the full conversation history to the Claude API with a structured system prompt
3. Claude responds with a JSON object containing `action` and `params`
4. React calls the appropriate EC2 backend endpoint with extracted params
5. Result is rendered as a rich card (flight list/ticket / boarding pass)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| AI Agent / LLM | Claude claude-sonnet-4 (Anthropic API) |
| Backend API | Python Flask (Midterm Project) |
| Hosting | EC2 (`http://63.183.201.192:5000`) |
| Authentication | JWT (Bearer token for booking) |

---

## Features

- **Query Flight** — Natural language flight search (e.g. "Find flights from Istanbul to Frankfurt on May 1")
- **Book Flight** — Book a ticket by flight number and passenger info (JWT required)
- **Check In** — Assign seat to a passenger by ticket number
- **Conversation memory** — Multi-turn dialogue keeps context across messages
- **Rich result cards** — Flight lists, ticket confirmations, and check-in cards rendered visually
- **Configurable** — EC2 URL and JWT token editable in the UI without redeployment

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm or yarn
- Running SE4458 Midterm backend (EC2 or local)

### Install & Start

The app needs **two terminals** running simultaneously:

**Terminal 1 — Proxy server** (forwards Claude API calls, bypasses browser CORS):
```bash
# Set your Anthropic API key first:
# Windows:
set ANTHROPIC_API_KEY=sk-ant-...
# Mac/Linux:
export ANTHROPIC_API_KEY=sk-ant-...

cd proxy
npm install
node server.js
# → Running at http://localhost:3001
```

**Terminal 2 — React app:**
```bash
cd flight-agent   # root of this project
npm install
npm start
# → Opens at http://localhost:3000
```

### Environment

No `.env` file needed. The EC2 URL and JWT token are configurable directly inside the app's config bar.

Your Anthropic API key is set as an environment variable in the proxy terminal (never committed to git).

---

## API Endpoints Used

### Query Flights
```
GET /api/v1/flights/search?date_from=...&airport_from=...&airport_to=...&people=...
```

### Book Ticket
```
POST /api/v1/bookings
Authorization: Bearer <jwt>
Body: { flight_number, date, passenger_names, trip_type }
```

### Check In
```
POST /api/v1/checkin
Body: { ticket_number, passenger_name }
```

---

## Design & Assumptions

- The app uses Claude's API directly from the browser (no separate agent backend server) — this simplifies the architecture for the assignment scope.
- JWT authentication for booking is provided manually in the config bar. In production, this would be replaced with a login flow.
- The LLM parses IATA codes from city names (Istanbul → IST, Frankfurt → FRA, etc.) using its built-in knowledge.
- Conversation history is kept in React state (in-memory), so it resets on page refresh.
- The backend is assumed to be the SE4458 Midterm project running on EC2 with no CORS restrictions.

---

## Issues Encountered

- **CORS**: The EC2 Flask backend needs CORS headers enabled for browser-based fetch calls. Add `flask-cors` if requests are blocked.
- **JWT expiry**: Tokens expire — re-login via `POST /api/v1/auth/login` and update the token in the config bar.
- **Rate limiting**: The midterm's Query Flight endpoint is limited to 3 requests/day. Disable or increase limits during testing.

---

## Project Structure

```
src/
├── App.jsx                  # Main chat UI, state management, send logic
├── api.js                   # Claude API + all backend API calls
├── index.js                 # React entry point
└── components/
    ├── ConfigBar.jsx        # EC2 URL + JWT config
    ├── MessageBubble.jsx    # Chat bubble (user/bot)
    ├── FlightCard.jsx       # Renders flight search results
    ├── TicketCard.jsx       # Renders booking confirmation
    ├── CheckinCard.jsx      # Renders check-in result
    └── TypingIndicator.jsx  # Animated dots while loading
```
