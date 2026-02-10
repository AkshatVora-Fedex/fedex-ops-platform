import React, { useEffect, useState } from 'react';

const SplashScreen = ({ message = 'Loading...', type = 'loading' }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'login':
        return 'login';
      case 'logout':
        return 'logout';
      default:
        return 'hourglass_empty';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'login':
        return 'Signing you in';
      case 'logout':
        return 'Signing you out';
      default:
        return message;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#4D148C] via-[#5e1aa0] to-[#3e0f73] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6600]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* FedEx Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center bg-white rounded-lg px-6 py-3 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-6xl font-bold tracking-tighter leading-none">
              <span className="text-[#4D148C]">Fed</span>
              <span className="text-[#FF6600]">Ex</span>
            </span>
          </div>
        </div>

        {/* OpsPulse Title */}
        <div className="mb-12 animate-fade-in-delay-1">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">OpsPulse</h1>
          <p className="text-xl text-indigo-200 font-medium">Operations Platform</p>
        </div>

        {/* Loading indicator */}
        <div className="animate-fade-in-delay-2">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
                <span className="material-icons text-white text-6xl animate-spin-slow">{getIcon()}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-2xl font-semibold text-white mb-4">
            {getMessage()}{dots}
          </p>

          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-gradient-to-r from-white via-[#FF6600] to-white rounded-full animate-progress shadow-lg"></div>
            </div>
          </div>

          {/* Loading text */}
          <p className="mt-6 text-sm text-indigo-200 font-medium animate-pulse">
            {type === 'login' && 'Accessing your dashboard...'}
            {type === 'logout' && 'Securing your session...'}
            {type === 'loading' && 'Initializing 57,234 shipment records...'}
          </p>
        </div>

        {/* Feature tags */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 animate-fade-in-delay-3">
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/20">
            <span className="material-icons text-xs align-middle mr-1">analytics</span>
            Real-time Analytics
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/20">
            <span className="material-icons text-xs align-middle mr-1">notifications_active</span>
            Smart Alerts
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/20">
            <span className="material-icons text-xs align-middle mr-1">trending_up</span>
            Predictive AI
          </span>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center animate-fade-in-delay-3">
        <p className="text-sm text-indigo-200 font-medium">
          © 2026 FedEx Operations Platform
        </p>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.6s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
