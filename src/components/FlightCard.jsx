import React from 'react';

export default function FlightCard({ flights }) {
  if (!flights || !flights.length) {
    return (
      <div style={{ marginTop: 10, color: '#DC2626', fontSize: 13 }}>
        No flights found for that route and date.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
        {flights.length} flight{flights.length > 1 ? 's' : ''} found:
      </div>
      {flights.map((f, i) => {
        const dep = f.date_from ? new Date(f.date_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
        const arr = f.date_to   ? new Date(f.date_to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })   : '--';
        return (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#1D9E75', fontSize: 15 }}>
                {f.flight_number}
              </span>
              <span style={{ fontSize: 14, color: '#111827' }}>
                <strong>{f.airport_from}</strong>
                <span style={{ color: '#1D9E75', margin: '0 6px' }}>——›</span>
                <strong>{f.airport_to}</strong>
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', fontFamily: "'Space Mono', monospace" }}>
              {dep} → {arr} &nbsp;·&nbsp; {f.duration || '--'} min &nbsp;·&nbsp; {f.available_seats} seats left
            </div>
            <span style={badgeStyle('#D1FAE5', '#065F46')}>Available</span>
          </div>
        );
      })}
    </div>
  );
}

const cardStyle = {
  background:   '#f9fafb',
  border:       '1px solid #e5e7eb',
  borderRadius: 10,
  padding:      '10px 12px',
  marginBottom: 8,
};

function badgeStyle(bg, color) {
  return {
    display:      'inline-block',
    fontSize:     10,
    padding:      '2px 8px',
    borderRadius: 20,
    fontWeight:   500,
    marginTop:    6,
    background:   bg,
    color,
  };
}
