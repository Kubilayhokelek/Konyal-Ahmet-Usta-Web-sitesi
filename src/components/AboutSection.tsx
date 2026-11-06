import React from 'react';
import { RestaurantSettings } from '../types/restaurant.js';

interface AboutSectionProps {
  settings: RestaurantSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  return (
    <section id="hakkimizda" className="py-20 bg-[#F8F5ED] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={
                    settings.aboutImageUrl ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAD1-ks17Nhc8koGcNnmKp8-iTn3eVhZdEiriMQM0FO1yGzr96YKvmH3JuKOGuyZCdTq3K8v5oclketbizMUM8d1DL72azHDsPkv6eNLumsh7Ack_WoONh8HLmuvolV5ve_OM1Gkk4WzvEWvGccSTYvvhntrZQO_SJpFTypvRe2leVVlw8T68VNRJGxLzuovexWmOHwCBS65uxNDXZzoB0e4Xt3DuNuAwrhsvh8UBuS'
                  }
                  alt={settings.aboutTitle || 'Konya Taş Fırın Geleneği'}
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>

              {/* Floating Quality Badge */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#1A3620] text-white p-5 rounded-2xl shadow-xl border border-white/20 max-w-xs">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-10 h-10 rounded-xl bg-[#277E39] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#CDFFCB] font-bold block uppercase tracking-wider">
                      Meşe Odunu Ateşi
                    </span>
                    <strong className="text-sm font-serif">Taş Fırın Ustalığı</strong>
                  </div>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Tüm etli ekmek ve pidelerimiz geleneksel taş fırında meşe odunu közünde pişirilir.
                </p>
              </div>
            </div>
          </div>

          {/* Right Text Description */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-[#277E39] font-bold text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
              <span>Köklü Mutfak Mirası</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A3620] tracking-tight leading-tight">
              {settings.aboutTitle || 'Geleneksel Konya Lezzeti'}
            </h2>

            <div className="text-sm sm:text-base text-[#40493E] leading-relaxed space-y-4">
              <p>
                {settings.aboutText ||
                  "Konyalı Ahmet Usta, Konya'nın asırlık taş fırın geleneğini ve meşe odunu ateşinde pişen eşsiz etli ekmek mirasını sofranıza taşır. İncecik dinlendirilmiş hamurumuz, yerli besi etlerimiz ve asırlık Selçuklu lezzet mirasımızla her siparişi aynı lezzet ve tazelikte hazırlıyoruz."}
              </p>
              <p>
                {settings.aboutSubtext ||
                  'Etli ekmeğin hamurundan iç harcına, fırının harından dilimleme ustalığına kadar her aşamada özüne sadık kalarak gerçek lezzeti sunuyoruz. Siparişiniz verildiği an hamurumuz açılır, taş fırına sürülür ve sıcaklığı muhafaza edilerek adresinize ulaştırılır.'}
              </p>
            </div>

            {/* Culinary Values */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1A3620]/10">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#277E39] text-[24px] mt-0.5">
                  check_circle
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#1A3620]">Katkısız Malzemeler</h4>
                  <p className="text-xs text-[#6B746D] mt-0.5">Doğal un, yerli besi eti, taze sebzeler</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#277E39] text-[24px] mt-0.5">
                  check_circle
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#1A3620]">Sıcak & Taze Servis</h4>
                  <p className="text-xs text-[#6B746D] mt-0.5">Fırından çıkar çıkmaz ısı korumalı paketleme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
