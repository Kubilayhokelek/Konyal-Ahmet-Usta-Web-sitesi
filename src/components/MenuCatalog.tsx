import React, { useState, useMemo } from 'react';
import { Category, Product } from '../types/restaurant.js';

interface MenuCatalogProps {
  categories: Category[];
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenProductModal: (product: Product) => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  categories,
  products,
  onAddToCart,
  onOpenProductModal,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive);
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.isActive) return false;

      // Category filter
      if (selectedCategoryId !== 'all' && product.categoryId !== selectedCategoryId) {
        return false;
      }

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchCat = product.categoryName.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <section id="menu" className="py-16 bg-[#F3FCF3] border-t border-[#1A3620]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#277E39] font-bold text-xs uppercase tracking-widest mb-1">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Geleneksel Taş Fırın Menümüz</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A3620] tracking-tight">
              Sipariş Menüsü
            </h2>
            <p className="text-sm text-[#6B746D] mt-1">
              Odun ateşinde taze hazırlanan ürünlerimizi seçip sepetinize ekleyebilirsiniz.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#6B746D] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Menüde ürün veya lezzet ara..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-[#1A3620]/15 text-[#151D18] placeholder-[#6B746D] text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39] shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#6B746D] hover:text-[#151D18]"
                aria-label="Aramayı Temizle"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedCategoryId === 'all'
                ? 'bg-[#1A3620] text-white shadow-md scale-105'
                : 'bg-white hover:bg-[#edf6ed] text-[#40493E] border border-[#1A3620]/10'
            }`}
          >
            Tüm Lezzetler ({products.filter((p) => p.isActive).length})
          </button>

          {activeCategories.map((category) => {
            const count = products.filter(
              (p) => p.categoryId === category.id && p.isActive
            ).length;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  selectedCategoryId === category.id
                    ? 'bg-[#1A3620] text-white shadow-md scale-105'
                    : 'bg-white hover:bg-[#edf6ed] text-[#40493E] border border-[#1A3620]/10'
                }`}
              >
                {category.icon && (
                  <span className="material-symbols-outlined text-[16px] text-[#D97706]">
                    {category.icon}
                  </span>
                )}
                <span>{category.name}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-[#1A3620]/10 p-8 shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-[#6B746D] mb-3">
              search_off
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1A3620]">
              Aradığınız kriterlere uygun lezzet bulunamadı
            </h3>
            <p className="text-sm text-[#6B746D] mt-1 mb-4">
              Arama terimini değiştirebilir veya diğer kategorilere göz atabilirsiniz.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-[#277E39] text-white text-xs font-bold shadow-md hover:bg-[#1e652d] transition-all"
            >
              Tüm Menüyü Göster
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const hasOptions =
              (product.portionOptions && product.portionOptions.length > 0) ||
              product.spicyOption;

            return (
              <div
                key={product.id}
                id={`urun-${product.id}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#1A3620]/10 shadow-[0_2px_12px_rgba(26,54,32,0.04)] hover:shadow-[0_8px_28px_rgba(26,54,32,0.1)] transition-all duration-300"
              >
                {/* Product Image */}
                <div
                  onClick={() => onOpenProductModal(product)}
                  className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#e7f0e7] cursor-pointer"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#1A3620] text-[10px] font-bold shadow-sm">
                    {product.categoryName}
                  </div>

                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#1A3620]/90 text-[#D97706] flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div onClick={() => onOpenProductModal(product)} className="cursor-pointer">
                    <h3 className="font-serif text-lg font-bold text-[#1A3620] group-hover:text-[#277E39] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#6B746D] line-clamp-3 mt-1.5 leading-relaxed">
                      {product.description || 'Geleneksel taş fırın lezzeti.'}
                    </p>
                  </div>

                  {/* Price & Action Button */}
                  <div className="mt-5 pt-3 border-t border-[#1A3620]/5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xl font-extrabold text-[#1A3620]">
                        {product.price.toFixed(2)} ₺
                      </span>
                      {hasOptions && (
                        <span className="block text-[10px] text-[#6B746D]">
                          Porsiyon seçenekli
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (hasOptions) {
                          onOpenProductModal(product);
                        } else {
                          onAddToCart(product);
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-[#83da89]/30"
                      aria-label={`${product.name} sepete ekle`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {hasOptions ? 'tune' : 'add'}
                      </span>
                      <span>{hasOptions ? 'Seçenekler' : 'Sepete Ekle'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
