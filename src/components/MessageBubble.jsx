import React from 'react';
import FlightCard from './FlightCard';
import TicketCard from './TicketCard';
import CheckinCard from './CheckinCard';

export default function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const time   = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display:       'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap:           10,
      alignItems:    'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background:     isUser ? '#DBEAFE' : '#D1FAE5',
        color:          isUser ? '#1D4ED8' : '#065F46',
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        fontSize:       12, fontWeight: 700,
      }}>
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '76%' }}>
        <div style={{
          padding:      '10px 14px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background:   isUser ? '#1D9E75' : 'white',
          color:        isUser ? 'white' : '#111827',
          fontSize:     14,
          lineHeight:   1.6,
          border:       isUser ? 'none' : '1px solid #e5e7eb',
          whiteSpace:   'pre-wrap',
          wordBreak:    'break-word',
        }}>
          {msg.text}

          {/* Rich result cards */}
          {msg.flights  && <FlightCard  flights={msg.flights}  />}
          {msg.booking  && <TicketCard  booking={msg.booking}  />}
          {msg.checkin  && <CheckinCard checkin={msg.checkin}  />}
          {msg.apiError && (
            <div style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>
              ⚠ {msg.apiError}
            </div>
          )}
        </div>
        <div style={{
          fontSize:  10,
          color:     '#9ca3af',
          marginTop: 3,
          textAlign: isUser ? 'right' : 'left',
          fontFamily: "'Space Mono', monospace",
        }}>
          {time}
        </div>
      </div>
    </div>
  );
}
