import React from 'react';
import { Product } from '../types/restaurant.js';

interface FeaturedSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenProductModal: (product: Product) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  products,
  onAddToCart,
  onOpenProductModal,
}) => {
  const featured = products.filter((p) => p.isFeatured && p.isActive);

  if (featured.length === 0) return null;

  return (
    <section className="py-16 bg-[#F8F5ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#277E39] font-bold text-xs uppercase tracking-widest mb-1.5">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Ustanın Seçtikleri</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A3620] tracking-tight">
              Öne Çıkan Konya Lezzetleri
            </h2>
          </div>
          <p className="text-sm text-[#6B746D] max-w-md">
            Geleneksel taş fırınımızda meşe odunu közünde hazırlanan, en çok tercih edilen tescilli lezzetlerimiz.
          </p>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#1A3620]/10 shadow-[0_4px_20px_rgba(26,54,32,0.06)] hover:shadow-[0_12px_32px_rgba(26,54,32,0.12)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Product Image */}
              <div
                onClick={() => onOpenProductModal(product)}
                className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#e7f0e7] cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                {/* Badge: Ustanın Tavsiyesi */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A3620]/90 backdrop-blur-sm text-[#CDFFCB] text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px] text-[#D97706]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span>Öne Çıkan</span>
                </div>

                {/* Preparation Time */}
                {product.preparationTime && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    <span>{product.preparationTime}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div onClick={() => onOpenProductModal(product)} className="cursor-pointer">
                  <span className="text-[11px] font-semibold text-[#6B746D] uppercase tracking-wider block mb-1">
                    {product.categoryName}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A3620] group-hover:text-[#277E39] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6B746D] line-clamp-3 mt-1.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Footer price & action */}
                <div className="mt-5 pt-3 border-t border-[#1A3620]/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6B746D]">Başlangıç</span>
                    <span className="font-mono text-xl font-extrabold text-[#1A3620]">
                      {product.price.toFixed(2)} ₺
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (product.portionOptions && product.portionOptions.length > 0) {
                        onOpenProductModal(product);
                      } else {
                        onAddToCart(product);
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    aria-label={`${product.name} sepete ekle`}
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>{product.portionOptions && product.portionOptions.length > 0 ? 'Seç & Ekle' : 'Sepete Ekle'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
