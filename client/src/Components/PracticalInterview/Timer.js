import React from 'react';

const Timer = ({ duration }) => {
  const minutes = Math.floor(duration / 60);  // Convert duration to minutes
  const seconds = duration % 60;              // Get the remainder in seconds
  return (
    <div
      style={{
        backgroundColor: '#fff',
        color: '#333',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
      }}
    >
      Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
);
};

export default Timer;
