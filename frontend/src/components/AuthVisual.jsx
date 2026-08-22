import React from 'react';

const STOPS = ['Lisbon', 'Marrakech', 'Kyoto', 'Cusco'];

export default function AuthVisual() {
  return (
    <div className="auth-visual">
      <div className="brand">GlobalTrotters</div>
      <div className="pitch">
        Plot every stop.
        <br />
        Track every <em>rupee</em>.
        <br />
        Share the whole route.
      </div>
      <div className="stops">
        {STOPS.map((s) => (
          <div className="stop-row" key={s}>
            <span className="stop-dot" /> {s}
          </div>
        ))}
      </div>
    </div>
  );
}
