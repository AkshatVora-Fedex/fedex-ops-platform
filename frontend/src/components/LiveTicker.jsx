import React, { useState } from 'react';

const LiveTicker = () => {
  const [messages] = useState([
    { id: 1, text: 'AMER On-Time: 98.2%', icon: 'trending_up', color: 'text-green-400' },
    { id: 2, text: 'EMEA On-Time: 94.1% (Weather Impact)', icon: 'trending_down', color: 'text-yellow-400' },
    { id: 3, text: 'APAC On-Time: 99.5%', icon: 'trending_up', color: 'text-green-400' },
    { id: 4, text: 'ALERT: Indianapolis Hub (IND) Sort Capacity Critical (94%)', icon: 'warning', color: 'text-red-400 font-bold' },
    { id: 5, text: 'Memphis SuperHub: Operational (78% Load)', icon: 'check_circle', color: 'text-white' },
    { id: 6, text: 'Paris CDG: De-icing in progress (+15m delays)', icon: 'ac_unit', color: 'text-yellow-400' },
  ]);

  // Duplicate messages for seamless loop
  const duplicatedMessages = [...messages, ...messages];

  return (
    <div className="ticker-wrap bg-gray-800 overflow-hidden h-8 flex items-center">
      <div className="ticker-content flex animate-scroll">
        {duplicatedMessages.map((msg, index) => (
          <div
            key={`${msg.id}-${index}`}
            className={`ticker-item flex items-center px-8 whitespace-nowrap ${msg.color}`}
          >
            <span className="material-icons text-sm mr-2">{msg.icon}</span>
            <span className="text-xs font-medium">{msg.text}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .ticker-wrap {
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }
        
        .ticker-content {
          will-change: transform;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LiveTicker;
