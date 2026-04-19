# SE4458 — Assignment 2: Flight AI Agent Chat Application

## Source Code
- Frontend (this repo): https://github.com/toprakorman/SE4458_FlightAgent
- Backend (Midterm API): https://github.com/toprakorman/SE4458_Midterm

## Demo Video
> https://drive.google.com/file/d/1ebUKxD-Z6Lx22FXB5CV3Ki3t93fm-IDD/view?usp=drive_link

---

## Overview

This project is an AI Agent chat application that provides a natural-language interface for interacting with the Airline Ticketing API built in the SE4458 Midterm. Users can search for flights, book tickets, and check in — all through a conversational UI.

---

## Architecture

```
User (Browser)
    │
    ▼
React Frontend (Chat UI) — served by Nginx on EC2 (port 80)
    │
    ├──► Proxy Server (Node.js on EC2, port 3001, managed by PM2)
    │         │
    │         └──► Claude API (claude-sonnet-4-5)   ← Intent parsing & NLU
    │                   │ returns: action + params
    │
    └──► EC2 Flask Backend (Midterm API, port 5000, managed by Gunicorn)
              ├── GET  /api/v1/flights/search   (Query Flight)
              ├── POST /api/v1/bookings          (Book Flight)
              └── POST /api/v1/checkin           (Check In)
```

**Flow per message:**
1. User types a natural language message
2. React sends the full conversation history to the proxy server
3. Proxy forwards the request to the Claude API (bypasses browser CORS)
4. Claude responds with a JSON object containing `action` and `params`
5. React calls the appropriate EC2 Flask endpoint with extracted params
6. Result is rendered as a rich card (flight list / ticket confirmation / check-in result)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| AI Agent / LLM | Claude claude-sonnet-4-5 (Anthropic API) |
| Proxy Server | Node.js + Express |
| Backend API | Python Flask (Midterm Project) |
| Process Manager | PM2 |
| Web Server | Nginx |
| Hosting | AWS EC2 — `http://63.177.93.110` |
| Authentication | JWT (Bearer token for booking) |

---

## Live Demo

The app is deployed and accessible at:
```
http://63.177.93.110
```

---

## Features

- **Query Flight** — Natural language flight search (e.g. "Find flights from Istanbul to Frankfurt on May 1")
- **Book Flight** — Book a ticket by flight number and passenger info (JWT required)
- **Check In** — Assign seat to a passenger using flight number, date and passenger name
- **Conversation memory** — Multi-turn dialogue keeps context across messages
- **Rich result cards** — Flight lists, ticket confirmations, and check-in cards rendered visually
- **Configurable** — EC2 URL and JWT token editable in the UI without redeployment

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm
- Running SE4458 Midterm backend (EC2 or local)
- Anthropic API key

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
npm install
npm start
# → Opens at http://localhost:3000
```

### Environment

No `.env` file needed. The EC2 URL and JWT token are configurable directly inside the app's config bar. Your Anthropic API key is set as an environment variable in the proxy terminal (never committed to git).

---

## Deployment (AWS EC2)

The app is fully deployed on a single EC2 instance (Amazon Linux 2023):

- **Nginx** serves the React build on port 80 and proxies `/api/claude` to the Node proxy
- **PM2** keeps the proxy server running permanently and auto-restarts on reboot
- **Gunicorn** runs the Flask backend on port 5000

To redeploy after code changes:
```bash
cd ~/SE4458_FlightAgent
git pull origin main
npm run build
sudo systemctl restart nginx
```

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
Body: { flight_number, date, passenger_name }
```

---

## Design & Assumptions

- A lightweight Node.js proxy server is used to forward requests to the Claude API, as browsers block direct calls to `api.anthropic.com` due to CORS restrictions.
- JWT authentication for booking is provided manually in the config bar. In production, this would be replaced with a proper login flow.
- The LLM parses IATA codes from city names (Istanbul → IST, Frankfurt → FRA, etc.) using its built-in knowledge.
- Conversation history is kept in React state (in-memory), so it resets on page refresh.
- Check-in requires `flight_number`, `date`, and `passenger_name` — the passenger must already have a booking on that flight.

---

## Issues Encountered

- **CORS**: Browsers block direct calls to the Anthropic API, so a local proxy server is required. On EC2, Nginx proxies the `/api/claude` route to the Node proxy on port 3001.
- **Check-in API mismatch**: The backend requires `flight_number`, `date`, and `passenger_name` — not `ticket_number`. The frontend was updated accordingly.
- **Model name**: The Claude API requires the exact model string `claude-sonnet-4-5`. An incorrect model string causes a 404 error.
- **Nested API response**: The booking API returns `{ status, message, data: { ticket_number } }`. The frontend was updated to unwrap the nested `data` field for the ticket card to render correctly.
- **JWT expiry**: Tokens expire — re-login via `POST /api/v1/auth/login` and update the token in the config bar.
- **Rate limiting**: The Query Flight endpoint is limited to 3 requests/day. Disable or increase the limit during testing.

---

## Project Structure

```
├── proxy/
│   ├── server.js            # Node.js proxy — forwards requests to Claude API
│   └── package.json
├── public/
│   └── index.html
├── src/
│   ├── App.jsx              # Main chat UI, state management, send logic
│   ├── api.js               # Claude API + all backend API calls
│   ├── index.js             # React entry point
│   └── components/
│       ├── ConfigBar.jsx    # EC2 URL + JWT config
│       ├── MessageBubble.jsx # Chat bubble (user/bot)
│       ├── FlightCard.jsx   # Renders flight search results
│       ├── TicketCard.jsx   # Renders booking confirmation
│       ├── CheckinCard.jsx  # Renders check-in result
│       └── TypingIndicator.jsx # Animated dots while loading
└── package.json
```
