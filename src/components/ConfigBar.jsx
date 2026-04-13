import React, { useState } from 'react';

export default function ConfigBar({ config, onSave }) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [jwt,     setJwt]     = useState(config.jwt);

  return (
    <div style={{
      background: '#f8f9fa',
      borderBottom: '1px solid #e5e7eb',
      padding: '10px 20px',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <label style={labelStyle}>EC2 URL</label>
      <input
        style={inputStyle}
        value={baseUrl}
        onChange={e => setBaseUrl(e.target.value)}
        placeholder="http://63.183.201.192:5000"
      />
      <label style={labelStyle}>JWT Token</label>
      <input
        style={inputStyle}
        type="password"
        value={jwt}
        onChange={e => setJwt(e.target.value)}
        placeholder="Required for booking"
      />
      <button
        style={btnStyle}
        onClick={() => onSave({ baseUrl: baseUrl.replace(/\/$/, ''), jwt })}
      >
        Save
      </button>
    </div>
  );
}

const labelStyle = {
  fontSize: 11,
  color: '#6b7280',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
};
const inputStyle = {
  fontSize: 12,
  fontFamily: "'Space Mono', monospace",
  background: 'white',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '5px 10px',
  color: '#111',
  flex: 1,
  minWidth: 120,
  maxWidth: 280,
};
const btnStyle = {
  fontSize: 12,
  padding: '5px 14px',
  background: '#1D9E75',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
};
