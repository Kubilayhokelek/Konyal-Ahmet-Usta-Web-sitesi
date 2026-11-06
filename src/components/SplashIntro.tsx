import React, { useEffect, useState } from 'react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if autostart=1 or already shown in this session
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1' || sessionStorage.getItem('splash_shown')) {
      onComplete();
      return;
    }

    // Run animation for 2.6 seconds, then fade out smoothly
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        sessionStorage.setItem('splash_shown', 'true');
        onComplete();
      }, 500);
    }, 2600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      sessionStorage.setItem('splash_shown', 'true');
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A3620] text-white transition-opacity duration-500 overflow-hidden ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold tracking-wider transition-all backdrop-blur-sm border border-white/15"
      >
        GEÇ &gt;
      </button>

      {/* Atmospheric Background Glows */}
      <div className="absolute w-96 h-96 rounded-full bg-[#D97706]/15 blur-3xl pointer-events-none -top-10" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#277E39]/20 blur-3xl pointer-events-none -bottom-10" />

      {/* Center Stage Animation */}
      <div className="relative flex flex-col items-center justify-center max-w-lg px-6 text-center z-10">
        {/* Steam Effect Wisps */}
        <div className="relative w-72 h-16 pointer-events-none">
          <div className="absolute left-1/4 bottom-0 w-8 h-12 bg-gradient-to-t from-white/30 to-transparent rounded-full blur-md animate-steam-1" />
          <div className="absolute left-1/2 bottom-0 w-10 h-16 bg-gradient-to-t from-white/35 to-transparent rounded-full blur-md animate-steam-2" />
          <div className="absolute left-3/4 bottom-0 w-8 h-14 bg-gradient-to-t from-white/25 to-transparent rounded-full blur-md animate-steam-3" />
        </div>

        {/* Etli Ekmek Video Container with Spring Animation */}
        <div className="relative group my-2">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#D97706]/40 via-[#277E39]/40 to-[#D97706]/40 rounded-3xl blur-xl opacity-75 animate-pulse" />
          <div className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/20 bg-black/40">
            <video
              src="/assets/aistudio/kling_20261107_VIDEO_Konyan_n_m_1548_0_1f1130d7.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-72 sm:w-84 md:w-96 h-48 sm:h-56 object-cover transform scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-[#1A3620]/90 border border-white/20 text-[#CDFFCB] text-xs font-bold tracking-wide shadow-md">
                Meşe Odunu Taş Fırınından Taze
              </span>
            </div>
          </div>
        </div>

        {/* Official Brand Logo */}
        <div className="mt-6 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Konyalı Ahmet Usta"
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transform animate-fade-in"
          />
          <p className="mt-3 text-sm text-[#CDFFCB] font-medium tracking-wide">
            Konya'nın Asırlık Lezzeti Sofranızda
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D97706] to-[#277E39] rounded-full animate-[wiggle_2.6s_ease-in-out_forwards] w-full" />
        </div>
      </div>
    </div>
  );
};
