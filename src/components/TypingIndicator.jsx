import React from 'react';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: '#D1FAE5', color: '#065F46',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>AI</div>
      <div style={{
        padding: '12px 16px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '4px 14px 14px 14px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#1D9E75',
            display: 'inline-block',
            animation: `bounce 1.2s ${delay}s infinite`,
          }} />
        ))}
        <style>{`
          @keyframes bounce {
            0%,80%,100%{transform:translateY(0)}
            40%{transform:translateY(-6px)}
          }
        `}</style>
      </div>
    </div>
  );
}
