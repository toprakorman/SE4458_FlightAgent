import React from 'react';

export default function TicketCard({ booking }) {
  if (!booking) {
    return <div style={{ marginTop: 10, color: '#DC2626', fontSize: 13 }}>Booking failed. Please check your JWT token and try again.</div>;
  }

  // Accept any of these fields as a valid ticket identifier
  const ticketNumber = booking.ticket_number || booking.ticketNumber || booking.id || booking.booking_id;

  if (!ticketNumber) {
    return <div style={{ marginTop: 10, color: '#DC2626', fontSize: 13 }}>Booking failed. Please check your JWT token and try again.</div>;
  }

  return (
    <div style={{
      marginTop:    10,
      background:   '#f0fdf4',
      border:       '1px solid #bbf7d0',
      borderRadius: 10,
      padding:      '12px 14px',
    }}>
      <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600, marginBottom: 8 }}>
        ✓ Booking Confirmed
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16, color: '#1D9E75' }}>
          #{ticketNumber}
        </span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 20,
          background: '#DBEAFE', color: '#1D4ED8', fontWeight: 500,
        }}>
          Booked
        </span>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          ['Flight',      booking.flight_number],
          ['From',        booking.airport_from],
          ['To',          booking.airport_to],
          ['Passengers',  booking.passenger_count],
          ['Type',        booking.trip_type],
        ].filter(([, v]) => v).map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: '#111827' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
