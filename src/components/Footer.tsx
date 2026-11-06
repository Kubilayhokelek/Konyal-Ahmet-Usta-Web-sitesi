import React from 'react';
import { RestaurantSettings } from '../types/restaurant.js';

interface FooterProps {
  settings: RestaurantSettings;
  onNavigateToSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigateToSection,
  onOpenAdmin,
}) => {
  return (
    <footer id="iletisim" className="bg-[#1A3620] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Info & Logo */}
          <div className="flex flex-col gap-4">
            <img
              src={settings.logoUrl || '/logo.png'}
              alt={settings.restaurantName}
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain self-start"
            />
            <p className="text-xs text-white/70 leading-relaxed max-w-sm mt-1">
              Konya'nın asırlık meşe odunu taş fırın lezzeti, tescilli etli ekmek ve bıçakarası ustası. Kapıda nakit ödeme kolaylığıyla sıcacık sofranızda.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href={settings.instagramUrl || 'https://www.instagram.com/konyaliahmetustaankara/'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D97706] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram Sayfamız"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href={settings.mapsUrl || 'https://maps.google.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#277E39] text-white flex items-center justify-center transition-colors"
                aria-label="Google Haritalar Konumu"
              >
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </a>
              <a
                href={`tel:${(settings.phone || '0532 340 23 42').replace(/\s+/g, '')}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#277E39] text-white flex items-center justify-center transition-colors"
                aria-label="0532 340 23 42 Telefonla Arayın"
                title="0532 340 23 42"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-lg font-bold text-[#CDFFCB] border-b border-white/10 pb-2">
              Hızlı Bağlantılar
            </h4>
            <button
              onClick={() => onNavigateToSection('hero')}
              className="text-left text-xs text-white/70 hover:text-white transition-colors"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => onNavigateToSection('menu')}
              className="text-left text-xs text-white/70 hover:text-white transition-colors"
            >
              Online Sipariş Menüsü
            </button>
            <button
              onClick={() => onNavigateToSection('hakkimizda')}
              className="text-left text-xs text-white/70 hover:text-white transition-colors"
            >
              Hakkımızda & Ustalık
            </button>
            <button
              onClick={() => onNavigateToSection('neden-biz')}
              className="text-left text-xs text-white/70 hover:text-white transition-colors"
            >
              Neden Konyalı Ahmet Usta?
            </button>
            <button
              onClick={onOpenAdmin}
              className="text-left text-xs text-[#D97706] hover:text-white flex items-center gap-1 mt-1 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Yönetim Paneli Girişi</span>
            </button>
          </div>

          {/* Col 3: Working Hours & Delivery Info */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-lg font-bold text-[#CDFFCB] border-b border-white/10 pb-2">
              Çalışma Saatleri
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-white/80">
              <span className="material-symbols-outlined text-[#D97706] text-[18px]">schedule</span>
              <div>
                <strong className="block text-white">Sipariş & Fırın Saatleri:</strong>
                <span>{settings.workingHours}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-white/80 mt-1">
              <span className="material-symbols-outlined text-[#277E39] text-[18px]">moped</span>
              <div>
                <strong className="block text-white">Paket Servis Bölgeleri:</strong>
                <span>{settings.address || 'Emek Mahallesi Bişkek Caddesi, Eski 8. Cadde No: 60, 06490 Çankaya/Ankara'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-white/80 mt-1">
              <span className="material-symbols-outlined text-[#CDFFCB] text-[18px]">payments</span>
              <div>
                <strong className="block text-white">Ödeme Şekli:</strong>
                <span>Sadece Kapıda veya Restoranda Nakit</span>
              </div>
            </div>
          </div>

          {/* Col 4: Address & Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-lg font-bold text-[#CDFFCB] border-b border-white/10 pb-2">
              İletişim & Adres
            </h4>
            <div className="flex items-start gap-2 text-xs text-white/80">
              <span className="material-symbols-outlined text-[#277E39] text-[18px] shrink-0">
                place
              </span>
              <span>
                {settings.address.includes(settings.city)
                  ? settings.address
                  : `${settings.address}, ${settings.city}`}
              </span>
            </div>
            <a
              href={`tel:${(settings.phone || '0532 340 23 42').replace(/\s+/g, '')}`}
              className="flex items-center gap-2 text-xs text-white/80 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[#277E39] text-[18px] shrink-0">
                call
              </span>
              <span className="font-mono font-bold">
                {settings.phone || '0532 340 23 42'}
              </span>
            </a>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="material-symbols-outlined text-[#277E39] text-[18px] shrink-0">
                mail
              </span>
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} {settings.restaurantName}. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span>Taş Fırın & Online Sipariş Otomasyonu</span>
            <button
              onClick={onOpenAdmin}
              className="text-white/40 hover:text-white transition-colors"
            >
              /admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
