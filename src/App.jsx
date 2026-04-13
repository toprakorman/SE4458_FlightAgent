import React, { useState, useRef, useEffect } from 'react';
import ConfigBar        from './components/ConfigBar';
import MessageBubble    from './components/MessageBubble';
import TypingIndicator  from './components/TypingIndicator';
import { askAgent, searchFlights, bookFlight, checkIn } from './api';

const DEFAULT_CONFIG = {
  baseUrl: 'http://63.177.93.110:5000',
  jwt:     '',
};

const WELCOME = {
  role: 'assistant',
  text: "Hello! I'm your Flight AI Agent. I can help you search for flights, book tickets, and check in. Try one of the quick actions below or just type your request.",
  ts:   Date.now(),
  quickActions: true,
};

const QUICK = [
  { label: '🔍 Search flights', text: 'Find flights from IST to FRA on 2026-05-01' },
  { label: '✈️ Book a flight',  text: 'Book flight TK101 on 2026-05-01 for John Doe, one way' },
  { label: '✅ Check in',       text: 'Check in passenger John Doe with ticket number 12345' },
];

export default function App() {
  const [config,   setConfig]   = useState(DEFAULT_CONFIG);
  const [messages, setMessages] = useState([WELCOME]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);   // LLM chat history
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function addMessage(msg) {
    setMessages(prev => [...prev, { ...msg, ts: Date.now() }]);
  }

  async function handleSend(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    addMessage({ role: 'user', text: userText });
    setLoading(true);

    // Add to LLM history
    const newHistory = [...history, { role: 'user', content: userText }];

    try {
      // 1. Ask the AI agent what to do
      const parsed = await askAgent(newHistory);
      console.log("[Agent parsed]", parsed);
      const updatedHistory = [
        ...newHistory,
        { role: 'assistant', content: JSON.stringify(parsed) },
      ];

      if (parsed.action === 'chat') {
        addMessage({ role: 'assistant', text: parsed.message });
        setHistory(updatedHistory);
        setLoading(false);
        return;
      }

      // 2. Show agent's "thinking" message
      addMessage({ role: 'assistant', text: parsed.message || 'Let me check that for you...' });

      // 3. Call the actual backend API
      let result;
      try {
        if (parsed.action === 'search_flights') {
          result = await searchFlights(config.baseUrl, parsed.params);
        } else if (parsed.action === 'book_flight') {
          if (!config.jwt) {
            addMessage({ role: 'assistant', text: 'Please add your JWT token in the config bar above (required for booking).', apiError: true });
            setHistory(updatedHistory);
            setLoading(false);
            return;
          }
          result = await bookFlight(config.baseUrl, config.jwt, parsed.params);
        } else if (parsed.action === 'checkin') {
          result = await checkIn(config.baseUrl, parsed.params);
        }
      } catch (fetchErr) {
        addMessage({
          role:     'assistant',
          text:     'Could not reach the server. Please check your EC2 URL in the config above.',
          apiError: fetchErr.message,
        });
        setHistory(updatedHistory);
        setLoading(false);
        return;
      }

      // 4. Render result
      const resultMsg = { role: 'assistant', text: '' };

      if (parsed.action === 'search_flights') {
        const flights = result.data?.flights
          || result.data?.results
          || (Array.isArray(result.data) ? result.data : []);
        resultMsg.text    = flights.length ? '' : 'No flights found for that route.';
        resultMsg.flights = flights;
      } else if (parsed.action === 'book_flight') {
        console.log('[Booking API result]', result);
        const bookingData = result.data?.data || result.data;
        const hasTicket = bookingData?.ticket_number || bookingData?.ticketNumber || bookingData?.id || bookingData?.booking_id;
        resultMsg.text    = result.status === 201 || result.status === 200 || hasTicket
          ? 'Your flight has been booked successfully!'
          : 'Booking failed — check your token and flight details.';
        resultMsg.booking = bookingData;
      } else if (parsed.action === 'checkin') {
        resultMsg.text   = result.status === 200
          ? 'Check-in complete!'
          : 'Check-in failed — verify the ticket number.';
        resultMsg.checkin = result.data;
      }

      addMessage(resultMsg);

      // Feed API result back into LLM history for context
      setHistory([
        ...updatedHistory,
        { role: 'user', content: `[API result for ${parsed.action}]: ${JSON.stringify(result.data)}` },
      ]);
    } catch (err) {
      addMessage({ role: 'assistant', text: 'Something went wrong. ' + err.message });
    }

    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#f0f2f5',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '20px 16px',
      fontFamily:     "'DM Sans', sans-serif",
    }}>
      <div style={{
        width:        '100%',
        maxWidth:     720,
        background:   'white',
        borderRadius: 16,
        boxShadow:    '0 4px 24px rgba(0,0,0,0.08)',
        overflow:     'hidden',
        display:      'flex',
        flexDirection:'column',
      }}>

        {/* Header */}
        <div style={{
          background:   'white',
          borderBottom: '1px solid #e5e7eb',
          padding:      '16px 20px',
          display:      'flex',
          alignItems:   'center',
          gap:          12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#1D9E75',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Flight AI Agent</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontFamily: "'Space Mono', monospace" }}>SE4458 — Assignment 2</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#6b7280' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            {loading ? 'Thinking...' : 'Agent online'}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        </div>

        {/* Config bar */}
        <ConfigBar config={config} onSave={cfg => {
          setConfig(cfg);
          addMessage({ role: 'assistant', text: `Config saved! Using: ${cfg.baseUrl}` });
        }} />

        {/* Messages */}
        <div style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '20px',
          display:    'flex',
          flexDirection: 'column',
          gap:        14,
          minHeight:  400,
          maxHeight:  500,
        }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <MessageBubble msg={msg} />
              {msg.quickActions && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, marginLeft: 42 }}>
                  {QUICK.map(q => (
                    <button
                      key={q.label}
                      onClick={() => handleSend(q.text)}
                      style={{
                        fontSize: 12, padding: '6px 14px',
                        background: 'white', border: '1px solid #e5e7eb',
                        borderRadius: 20, cursor: 'pointer',
                        color: '#374151', fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop:   '1px solid #e5e7eb',
          padding:     '12px 16px',
          display:     'flex',
          gap:         10,
          alignItems:  'flex-end',
          background:  'white',
        }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message... e.g. Find flights from IST to FRA on May 1"
            style={{
              flex:        1,
              fontSize:    14,
              fontFamily:  "'DM Sans', sans-serif",
              background:  '#f9fafb',
              border:      '1px solid #e5e7eb',
              borderRadius: 20,
              padding:     '10px 16px',
              color:       '#111827',
              resize:      'none',
              lineHeight:  1.5,
              outline:     'none',
              maxHeight:   120,
              overflowY:   'auto',
            }}
            onFocus={e => e.target.style.borderColor = '#1D9E75'}
            onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              width:        42, height: 42,
              borderRadius: '50%',
              background:   loading || !input.trim() ? '#e5e7eb' : '#1D9E75',
              border:       'none',
              cursor:       loading || !input.trim() ? 'not-allowed' : 'pointer',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink:   0,
              transition:   'background 0.15s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={loading || !input.trim() ? '#9ca3af' : 'white'}>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
