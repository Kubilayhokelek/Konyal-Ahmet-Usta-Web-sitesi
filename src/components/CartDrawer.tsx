import React from 'react';
import { CartItem, RestaurantSettings } from '../types/restaurant.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  settings: RestaurantSettings;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDelivery = settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = settings.deliveryFee === 0 || isFreeDelivery ? 0 : settings.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  const isBelowMinOrder = subtotal < settings.minOrderAmount;
  const remainingForMin = settings.minOrderAmount - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#1A3620]/10">
          {/* Header */}
          <div className="p-6 bg-[#1A3620] text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[24px] text-[#CDFFCB]">
                shopping_bag
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold">Sipariş Sepetiniz</h2>
                <span className="text-xs text-white/70">
                  {cartItems.length} farklı lezzet
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-[#ffdcc3] hover:text-white underline mr-1"
                  title="Sepeti Boşalt"
                >
                  Temizle
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Sepeti Kapat"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-[#F3FCF3] text-[#277E39] flex items-center justify-center mb-4 border border-[#277E39]/20">
                  <span className="material-symbols-outlined text-[36px]">shopping_cart</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A3620]">
                  Sepetiniz Henüz Boş
                </h3>
                <p className="text-xs text-[#6B746D] max-w-xs mt-1.5 mb-6">
                  Menümüzden meşhur Konya etli ekmeği, bıçakarası veya fırın kebabını seçip hemen ekleyebilirsiniz.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#277E39] text-white text-xs font-bold shadow-md hover:bg-[#1e652d] transition-all"
                >
                  Lezzetleri Keşfet
                </button>
              </div>
            ) : (
              <>
                {/* Minimum Order Amount Progress Notice */}
                {isBelowMinOrder ? (
                  <div className="p-3.5 rounded-2xl bg-[#ffdcc3]/60 border border-[#fe932c] text-xs text-[#663500] flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#D97706] text-[20px] shrink-0">
                      info
                    </span>
                    <div>
                      <span>
                        Minimum paket sipariş tutarı <strong>{settings.minOrderAmount} ₺</strong>'dir.
                      </span>
                      <div className="text-[11px] font-bold text-[#b45309] mt-0.5">
                        Sepeti tamamlamak için <strong>{remainingForMin.toFixed(2)} ₺</strong> daha ürün ekleyin.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#e7f0e7] border border-[#277E39]/30 text-xs text-[#00531c] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#277E39] text-[18px]">
                      check_circle
                    </span>
                    <span>Minimum paket sipariş tutarı karşılandı.</span>
                  </div>
                )}

                {/* Items loop */}
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#1A3620]/10 flex flex-col gap-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-[#1A3620] line-clamp-1">
                            {item.product.name}
                          </h4>
                          {item.selectedOption && (
                            <span className="text-[11px] text-[#6B746D] block">
                              {item.selectedOption.name}
                            </span>
                          )}
                          {item.spicyPreference && item.spicyPreference !== 'standart' && (
                            <span className="text-[11px] text-[#D97706] font-semibold block">
                              {item.spicyPreference === 'az_acili' ? 'Az Acılı' : 'Bol Acılı 🔥'}
                            </span>
                          )}
                          {item.itemNote && (
                            <span className="text-[10px] text-[#B45309] italic block line-clamp-1">
                              Not: "{item.itemNote}"
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#6B746D] hover:text-[#BA1A1A] p-1 transition-colors"
                        title="Ürünü Sil"
                        aria-label={`${item.product.name} sepetten sil`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    {/* Price and Counter */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1A3620]/5">
                      <span className="font-mono text-base font-extrabold text-[#1A3620]">
                        {item.totalPrice.toFixed(2)} ₺
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-[#1A3620]/15 px-2 py-1 rounded-xl shadow-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-[#1A3620]"
                          aria-label="Adet Azalt"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-[#1A3620]"
                          aria-label="Adet Artır"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-[#1A3620]/10 flex flex-col gap-4 shadow-lg">
              <div className="space-y-1.5 text-xs text-[#40493E]">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span className="font-mono font-bold text-sm text-[#1A3620]">
                    {subtotal.toFixed(2)} ₺
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Paket Servis Ücreti:</span>
                  <span className="font-mono font-bold text-[#277E39]">
                    {deliveryFee === 0 ? 'ÜCRETSİZ' : `${deliveryFee.toFixed(2)} ₺`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#1A3620]/10 text-sm font-bold text-[#1A3620]">
                  <span>Genel Toplam:</span>
                  <span className="font-mono text-xl text-[#006423]">
                    {grandTotal.toFixed(2)} ₺
                  </span>
                </div>
              </div>

              {/* Cash notice */}
              <div className="px-3 py-2 rounded-xl bg-[#ffdcc3]/50 text-[11px] text-[#663500] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#D97706]">payments</span>
                <span>Ödeme: Kapıda veya Restoranda Nakit olarak tahsil edilir.</span>
              </div>

              {/* Checkout Trigger */}
              <button
                disabled={isBelowMinOrder || !settings.isOpen}
                onClick={onProceedToCheckout}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isBelowMinOrder || !settings.isOpen
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#277E39] hover:bg-[#1e652d] text-white shadow-[#277E39]/30 border border-[#83da89]/30'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>
                <span>
                  {!settings.isOpen
                    ? 'Restoran Kapalı'
                    : isBelowMinOrder
                    ? `Min. Sipariş Tutarı: ${settings.minOrderAmount} ₺`
                    : 'Siparişi Tamamla & Onayla'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
