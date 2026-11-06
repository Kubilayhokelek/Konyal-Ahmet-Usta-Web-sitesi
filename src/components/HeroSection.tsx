import React, { useEffect, useRef } from 'react';
import { RestaurantSettings } from '../types/restaurant.js';

interface HeroSectionProps {
  settings: RestaurantSettings;
  onOrderClick: () => void;
  onExploreMenuClick: () => void;
}

const HERO_VIDEO_URL = '/assets/aistudio/kling_20261107_VIDEO_Konyan_n_m_1548_0_1f1130d7.mp4';

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onOrderClick,
  onExploreMenuClick,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Ignore autoplay policy errors if any
      });
    }
  }, []);

  return (
    <section id="hero" className="relative bg-[#1A3620] text-white overflow-hidden pt-6 pb-16 lg:pt-8 lg:pb-20">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#277E39]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-10">
        {/* Closed Store Alert Banner (if restaurant is toggled closed in Admin) */}
        {!settings.isOpen && (
          <div className="p-4 rounded-2xl bg-[#D97706]/20 border border-[#D97706] text-white flex items-center gap-3 backdrop-blur-md">
            <span className="material-symbols-outlined text-[#D97706] text-[28px]">schedule</span>
            <div>
              <strong className="block text-sm font-bold">Restoranımız Geçici Olarak Siparişe Kapalıdır</strong>
              <p className="text-xs text-white/90">{settings.closedMessage}</p>
            </div>
          </div>
        )}

        {/* Top Full-Width Cinematic Looping Video Showcase */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/40 group">
          <video
            ref={videoRef}
            src={HERO_VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-[240px] sm:h-[380px] lg:h-[480px] object-cover object-center"
          />

          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A3620] via-black/20 to-transparent pointer-events-none" />

          {/* Bottom overlay badge inside video frame */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A3620]/90 backdrop-blur-md border border-white/20 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
              <span className="text-xs font-bold text-[#CDFFCB] uppercase tracking-wider">
                Geleneksel Meşe Odunu Taş Fırını
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-white/90 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#D97706]">local_fire_department</span>
              <span>Etli Ekmek • Fırın Kebabı • Bıçakarası</span>
            </div>
          </div>
        </div>

        {/* Hero Headline, Subtitle & Call to Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              {settings.heroTitle && settings.heroTitle !== "Konya'nın Lezzeti, Sofranızda!" ? (
                settings.heroTitle
              ) : (
                <>
                  Konya'nın Lezzeti,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] to-[#CDFFCB]">
                    Sofranızda!
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#F8F5ED]/80 font-normal leading-relaxed max-w-2xl">
              {settings.heroSubtitle ||
                'Özenle hazırlanan lezzetlerimiz, geleneksel Konya mutfağının eşsiz tadıyla şimdi siparişinizde.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onOrderClick}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#277E39] hover:bg-[#1e652d] text-white text-base font-bold shadow-xl shadow-[#277E39]/30 transition-all hover:scale-105 active:scale-95 border border-[#83da89]/30"
                >
                  <span className="material-symbols-outlined text-[22px]">shopping_cart_checkout</span>
                  <span>Hemen Sipariş Ver</span>
                </button>

                <button
                  onClick={onExploreMenuClick}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-base font-semibold border border-white/15 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-[22px]">menu_book</span>
                  <span>Menümüzü İncele</span>
                </button>
              </div>

              {/* Uber Eats & Yemeksepeti Order Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={
                    settings.uberEatsUrl ||
                    'https://tgoyemek.com/restoranlar/310664?utm_source=google_food_ordering&utm_medium=organic&utm_campaign=CM2826747-search-free-nonbrand-google-pas_e-tygo_ios-and-web_acq_Global&utm_term=pickup#kebaplar'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-[#000000] hover:bg-[#141414] text-white text-base font-bold shadow-xl shadow-black/40 transition-all hover:scale-105 active:scale-95 border border-[#06C167]/50"
                  aria-label="Uber Eats ile Sipariş Ver"
                >
                  {/* Official Uber Eats Logo Badge */}
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#06C167] text-black font-sans font-extrabold text-xs tracking-tight leading-none shadow-sm">
                    Uber <span className="ml-0.5 font-black text-white">Eats</span>
                  </span>
                  <span>Uber Eats ile Sipariş Ver</span>
                  <span className="material-symbols-outlined text-[18px] text-[#06C167]">open_in_new</span>
                </a>

                <a
                  href={
                    settings.yemeksepetiUrl ||
                    'https://www.yemeksepeti.com/restaurant/hzr4/konyali-ahmet-usta-hzr4?utm_campaign=google_reserve_place_order_action_CH-SEO_'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-[#EA004B] hover:bg-[#c80040] text-white text-base font-bold shadow-xl shadow-[#EA004B]/30 transition-all hover:scale-105 active:scale-95 border border-white/25"
                  aria-label="Yemeksepeti ile Sipariş Ver"
                >
                  {/* Yemeksepeti Logo Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#EA004B] font-sans font-extrabold text-xs tracking-tight leading-none shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5.5 9h13l-1.35 9.45A2 2 0 0 1 15.17 20H8.83a2 2 0 0 1-1.98-1.55L5.5 9zm6.5-6a4 4 0 0 1 4 4h-2a2 2 0 0 0-4 0H8a4 4 0 0 1 4-4z" />
                    </svg>
                    <span>Yemeksepeti</span>
                  </span>
                  <span>Yemeksepeti ile Sipariş Ver</span>
                  <span className="material-symbols-outlined text-[18px] text-white">open_in_new</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Quick Value Cards */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-3 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex flex-col p-2">
                <div className="flex items-center gap-1.5 text-[#D97706]">
                  <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
                  <span className="text-sm font-bold text-white">Taş Fırın</span>
                </div>
                <span className="text-xs text-white/60 mt-1">Meşe odunu ateşi</span>
              </div>
              <div className="flex flex-col p-2 border-x border-white/10 px-3">
                <div className="flex items-center gap-1.5 text-[#277E39]">
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                  <span className="text-sm font-bold text-white">30-45 Dk</span>
                </div>
                <span className="text-xs text-white/60 mt-1">Sıcak & Hızlı teslim</span>
              </div>
              <div className="flex flex-col p-2">
                <div className="flex items-center gap-1.5 text-[#CDFFCB]">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                  <span className="text-sm font-bold text-white">Kapıda Nakit</span>
                </div>
                <span className="text-xs text-white/60 mt-1">Güvenli ödeme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
