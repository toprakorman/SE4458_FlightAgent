import React from 'react';

export default function CheckinCard({ checkin }) {
  if (!checkin) {
    return <div style={{ marginTop: 10, color: '#DC2626', fontSize: 13 }}>Check-in failed.</div>;
  }

  const passengers = Array.isArray(checkin.passengers)
    ? checkin.passengers
    : checkin.passenger
      ? [checkin.passenger]
      : checkin.seat_number
        ? [{ full_name: checkin.passenger_name || 'Passenger', seat_number: checkin.seat_number }]
        : [];

  return (
    <div style={{
      marginTop:    10,
      background:   '#f0fdf4',
      border:       '1px solid #bbf7d0',
      borderRadius: 10,
      padding:      '12px 14px',
    }}>
      <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600, marginBottom: 8 }}>
        ✓ Check-In Successful
      </div>
      {passengers.map((p, i) => (
        <div key={i} style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '6px 0',
          borderTop:      i > 0 ? '1px solid #d1fae5' : 'none',
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
            {p.full_name || p.name || 'Passenger'}
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize:   14,
            color:      '#1D9E75',
          }}>
            Seat {p.seat_number || '--'}
          </span>
        </div>
      ))}
    </div>
  );
}
