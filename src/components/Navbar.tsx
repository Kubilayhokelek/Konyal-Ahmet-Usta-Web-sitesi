import React, { useState } from 'react';
import { RestaurantSettings } from '../types/restaurant.js';

interface NavbarProps {
  settings: RestaurantSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onNavigateToSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  onNavigateToSection,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateToSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1A3620]/95 backdrop-blur-md border-b border-white/10 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLinkClick('hero')}
              className="flex items-center gap-3 text-left group focus:outline-none"
              aria-label="Konyalı Ahmet Usta Ana Sayfa"
            >
              <img
                src={settings.logoUrl || '/logo.png'}
                alt="Konyalı Ahmet Usta"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Ana Menü">
            <button
              onClick={() => handleLinkClick('hero')}
              className="text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => handleLinkClick('menu')}
              className="text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              Menü
            </button>
            <button
              onClick={() => handleLinkClick('hakkimizda')}
              className="text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              Hakkımızda
            </button>
            <button
              onClick={() => handleLinkClick('neden-biz')}
              className="text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              Neden Biz?
            </button>
            <button
              onClick={() => handleLinkClick('iletisim')}
              className="text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              İletişim
            </button>
          </nav>

          {/* Right Controls: Cart, CTA & Admin Switch */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all shadow-sm active:scale-95"
              aria-label={`Sepet (${cartCount} ürün)`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#D97706] text-white text-[11px] font-extrabold flex items-center justify-center shadow-md animate-scale-up">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold font-mono text-[#CDFFCB]">
                {cartTotal.toFixed(2)} ₺
              </span>
            </button>

            {/* Quick Order CTA */}
            <button
              onClick={() => handleLinkClick('menu')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-sm font-bold transition-all shadow-md active:scale-95 border border-[#83da89]/30"
            >
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
              <span>Sipariş Ver</span>
            </button>

            {/* Admin Switch */}
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10"
              title="Restoran Yönetim Paneli"
              aria-label="Restoran Yönetim Paneli"
            >
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              aria-label="Menüyü Aç/Kapat"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A3620] border-b border-white/10 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#CDFFCB]">
            <span>{settings.isOpen ? '● Fırın Sipariş Kabul Ediyor' : '○ Fırın Şu Anda Kapalı'}</span>
            <span className="text-white/60">{settings.workingHours}</span>
          </div>
          <button
            onClick={() => handleLinkClick('hero')}
            className="text-left py-2 text-white font-medium hover:text-[#CDFFCB] transition-colors"
          >
            Ana Sayfa
          </button>
          <button
            onClick={() => handleLinkClick('menu')}
            className="text-left py-2 text-white font-medium hover:text-[#CDFFCB] transition-colors"
          >
            Menü & Sipariş
          </button>
          <button
            onClick={() => handleLinkClick('hakkimizda')}
            className="text-left py-2 text-white font-medium hover:text-[#CDFFCB] transition-colors"
          >
            Hakkımızda
          </button>
          <button
            onClick={() => handleLinkClick('neden-biz')}
            className="text-left py-2 text-white font-medium hover:text-[#CDFFCB] transition-colors"
          >
            Neden Konyalı Ahmet Usta?
          </button>
          <button
            onClick={() => handleLinkClick('iletisim')}
            className="text-left py-2 text-white font-medium hover:text-[#CDFFCB] transition-colors"
          >
            İletişim & Harita
          </button>
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => handleLinkClick('menu')}
              className="flex-1 py-2.5 rounded-xl bg-[#277E39] text-white font-bold text-center text-sm shadow-md"
            >
              Hemen Sipariş Ver
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-center text-sm"
            >
              Yönetim
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
