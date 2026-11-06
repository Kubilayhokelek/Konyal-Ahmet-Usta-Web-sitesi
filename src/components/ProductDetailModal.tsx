import React, { useState } from 'react';
import { Product, ProductOption } from '../types/restaurant.js';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirmAdd: (
    product: Product,
    quantity: number,
    selectedOption?: ProductOption,
    spicyPreference?: 'standart' | 'az_acili' | 'bol_acili',
    itemNote?: string
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onConfirmAdd,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<ProductOption | undefined>(
    product.portionOptions && product.portionOptions.length > 0
      ? product.portionOptions[0]
      : undefined
  );
  const [spicyPreference, setSpicyPreference] = useState<'standart' | 'az_acili' | 'bol_acili'>('standart');
  const [itemNote, setItemNote] = useState<string>('');

  const unitPrice = product.price + (selectedOption ? selectedOption.priceDiff : 0);
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAdd(product, quantity, selectedOption, spicyPreference, itemNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#1A3620]/10 my-8">
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-[#1A3620]">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-lg"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-full bg-[#1A3620]/90 text-[#CDFFCB] text-xs font-bold shadow-md">
              {product.categoryName}
            </span>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A3620]">
              {product.name}
            </h2>
            <p className="text-xs text-[#6B746D] mt-1.5 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Portion Options (if available) */}
          {product.portionOptions && product.portionOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                Porsiyon & Boyut Seçimi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.portionOptions.map((opt) => {
                  const isSelected = selectedOption?.name === opt.name;
                  const optTotal = product.price + opt.priceDiff;
                  return (
                    <button
                      type="button"
                      key={opt.name}
                      onClick={() => setSelectedOption(opt)}
                      className={`flex items-center justify-between p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#277E39] bg-[#e7f0e7] text-[#1A3620] font-bold ring-2 ring-[#277E39]'
                          : 'border-[#1A3620]/15 hover:border-[#1A3620]/30 text-[#40493E]'
                      }`}
                    >
                      <span className="text-xs">{opt.name}</span>
                      <span className="font-mono text-xs font-bold text-[#277E39]">
                        {optTotal.toFixed(2)} ₺
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spicy Preference (if applicable) */}
          {product.spicyOption && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                Acı Tercihi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standart', label: 'Standart / Normal' },
                  { id: 'az_acili', label: 'Az Acılı' },
                  { id: 'bol_acili', label: 'Bol Acılı 🔥' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSpicyPreference(item.id as any)}
                    className={`py-2 px-3 rounded-xl text-center text-xs border transition-all ${
                      spicyPreference === item.id
                        ? 'border-[#D97706] bg-[#ffdcc3]/40 text-[#663500] font-bold'
                        : 'border-[#1A3620]/15 text-[#40493E] hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom item note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
              Mutfak & Fırın Notu (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="Örn: Limonu bol olsun, közlenmiş biber ekleyin..."
              className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-xs text-[#151D18] focus:outline-none focus:ring-2 focus:ring-[#277E39]"
              maxLength={150}
            />
          </div>

          {/* Quantity and Add to Cart Button */}
          <div className="pt-3 border-t border-[#1A3620]/10 flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-[#F3FCF3] border border-[#1A3620]/10 px-3 py-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full bg-white hover:bg-[#dce5dc] text-[#1A3620] flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
                aria-label="Adet Azalt"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-sm text-[#1A3620] font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-full bg-white hover:bg-[#dce5dc] text-[#1A3620] flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
                aria-label="Adet Artır"
              >
                +
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex-1 flex items-center justify-between px-6 py-3 rounded-2xl bg-[#277E39] hover:bg-[#1e652d] text-white font-bold text-sm shadow-lg shadow-[#277E39]/30 transition-all active:scale-95 border border-[#83da89]/30"
            >
              <span>Sepete Ekle</span>
              <span className="font-mono text-base">{totalPrice.toFixed(2)} ₺</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
