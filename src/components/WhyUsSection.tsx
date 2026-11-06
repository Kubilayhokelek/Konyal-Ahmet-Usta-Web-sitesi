import React from 'react';

export const WhyUsSection: React.FC = () => {
  const features = [
    {
      icon: 'restaurant',
      color: '#277E39',
      bg: '#e7f0e7',
      title: 'Geleneksel Lezzet',
      description:
        "Konya'nın asırlık taş fırın ve meşe odunu geleneğini bozmadan, aslına uygun tariflerle hazırlıyoruz.",
    },
    {
      icon: 'verified',
      color: '#D97706',
      bg: '#ffdcc3',
      title: 'Özenle Hazırlanan Ürünler',
      description:
        'Özel dinlendirilmiş incecik hamur, yerli besi etleri ve taze günlük sebzelerle her lokmada ustalık sunuyoruz.',
    },
    {
      icon: 'touch_app',
      color: '#006423',
      bg: '#e7f0e7',
      title: 'Kolay Online Sipariş',
      description:
        'Üyelik zorunluluğu olmadan saniyeler içinde menümüzü inceleyip sepetinizi oluşturabilir ve sipariş verebilirsiniz.',
    },
    {
      icon: 'moped',
      color: '#B45309',
      bg: '#ffdcc3',
      title: 'Hızlı Sipariş Süreci',
      description:
        'Siparişiniz anında fırın ekranımıza düşer, pişirilir ve kapıda nakit ödeme kolaylığıyla sıcak şekilde ulaştırılır.',
    },
  ];

  return (
    <section id="neden-biz" className="py-20 bg-[#F3FCF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[#277E39] font-bold text-xs uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span>Ustalık & Güven</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A3620] tracking-tight">
            Neden Konyalı Ahmet Usta?
          </h2>
          <p className="text-sm text-[#6B746D] mt-2">
            Taş fırınımızdan çıkan her lezzette kaliteyi, hızı ve geleneksel misafirperverliği ön planda tutuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col p-6 rounded-3xl bg-white border border-[#1A3620]/10 shadow-[0_2px_12px_rgba(26,54,32,0.05)] hover:shadow-[0_8px_24px_rgba(26,54,32,0.1)] hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: feature.bg, color: feature.color }}
              >
                <span className="material-symbols-outlined text-[26px]">
                  {feature.icon}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1A3620] mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-[#6B746D] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
