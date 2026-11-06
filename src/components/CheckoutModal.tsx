import React, { useState } from 'react';
import { CartItem, DeliveryType, Order, RestaurantSettings } from '../types/restaurant.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  settings: RestaurantSettings;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  settings,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressDirections, setAddressDirections] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDelivery = settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = deliveryType === 'takeaway' || settings.deliveryFee === 0 || isFreeDelivery ? 0 : settings.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!customerName || customerName.trim().length < 2) {
      setErrorMessage('Lütfen ad ve soyadınızı eksiksiz giriniz.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).');
      return;
    }

    if (deliveryType === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setErrorMessage('Paket servis için açık teslimat adresinizi giriniz.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map cart items to payload format
      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedOptionName: item.selectedOption?.name,
        itemNote: item.itemNote,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryType,
          deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : '',
          addressDirections: addressDirections.trim(),
          orderNote: orderNote.trim(),
          paymentMethod: deliveryType === 'delivery' ? 'cash_delivery' : 'cash_takeaway',
          items: itemsPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Sipariş oluşturulamadı.');
      }

      const createdOrder: Order = data.order;

      // 1. Instantly notify any open Admin Panel tab/window via BroadcastChannel & localStorage
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('konyali_ahmet_usta_sync');
          channel.postMessage({
            type: 'NEW_ORDER',
            order: createdOrder,
            timestamp: Date.now(),
          });
          channel.close();
        }
        localStorage.setItem(
          'kny_latest_order_event',
          JSON.stringify({ order: createdOrder, timestamp: Date.now() })
        );
      } catch {
        // Ignore cross-tab channel errors
      }

      // 2. Non-blocking browser-side email dispatch to notification email (kubilayhokelek7145@gmail.com)
      try {
        const targetEmail = (settings.notificationEmail || 'kubilayhokelek7145@gmail.com').trim();
        const itemsText = createdOrder.items
          .map(
            (it) =>
              `${it.quantity}x ${it.name}${it.options ? ` (${it.options})` : ''} - ${it.subtotal.toFixed(2)} TL`
          )
          .join(' | ');

        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `Yeni Sipariş - Konyalı Ahmet Usta (#${createdOrder.id})`,
            _template: 'table',
            Siparis_No: `#${createdOrder.id}`,
            Musteri_Adi: createdOrder.customerName,
            Telefon: createdOrder.customerPhone,
            Teslimat_Turu: createdOrder.deliveryType === 'delivery' ? 'Paket Servis' : 'Restorandan Gel-Al',
            Teslimat_Adresi: createdOrder.deliveryAddress || 'Restorandan Gel-Al',
            Siparis_Kalemleri: itemsText,
            Toplam_Tutar: `${createdOrder.total.toFixed(2)} TL (Nakit)`,
            Siparis_Notu: createdOrder.orderNote || '-',
          }),
        }).catch(() => {});
      } catch {
        // Non-blocking
      }

      // Order created successfully
      onOrderCompleted(createdOrder);
      onClose();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#1A3620]/10 my-8">
        {/* Header */}
        <div className="p-6 bg-[#1A3620] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#277E39] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold">Siparişi Tamamla</h2>
              <p className="text-xs text-[#CDFFCB]">
                Kapıda nakit ödeme • Hızlı & üyeliksiz sipariş
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-xs text-[#93000a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Teslimat Tercihi (Paket Servis vs Restorandan Gel-Al) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
              Teslimat Yöntemi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!settings.allowDelivery}
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-[#277E39] bg-[#e7f0e7] ring-2 ring-[#277E39] text-[#1A3620]'
                    : 'border-[#1A3620]/15 text-[#40493E] hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[#277E39] text-[24px]">
                  two_wheeler
                </span>
                <div>
                  <strong className="block text-xs">Paket Servis</strong>
                  <span className="text-[10px] text-[#6B746D]">
                    Adrese motor kurye ile teslim
                  </span>
                </div>
              </button>

              <button
                type="button"
                disabled={!settings.allowTakeaway}
                onClick={() => setDeliveryType('takeaway')}
                className={`p-3.5 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                  deliveryType === 'takeaway'
                    ? 'border-[#277E39] bg-[#e7f0e7] ring-2 ring-[#277E39] text-[#1A3620]'
                    : 'border-[#1A3620]/15 text-[#40493E] hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[#D97706] text-[24px]">
                  storefront
                </span>
                <div>
                  <strong className="block text-xs">Restorandan Gel-Al</strong>
                  <span className="text-[10px] text-[#6B746D]">
                    Fırından sıcak teslim alın
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                Adınız ve Soyadınız *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Örn: Mehmet Demir"
                className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                Telefon Numaranız *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0532 555 42 10"
                className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#277E39]"
              />
            </div>
          </div>

          {/* 3. Address fields (only for delivery) */}
          {deliveryType === 'delivery' && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                  Teslimat Adresi *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Mahalle, cadde, sokak, apartman ve daire no..."
                  className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                  Adres Tarifi & Bina Detayı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={addressDirections}
                  onChange={(e) => setAddressDirections(e.target.value)}
                  placeholder="Örn: Eczane üstü 3. kat, zili çalmayın bebek uyuyor..."
                  className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
              </div>
            </div>
          )}

          {/* 4. Order Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
              Sipariş & Mutfak Notu (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Örn: Limon bol olsun, acı biberler közlensin..."
              className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
            />
          </div>

          {/* 5. Payment Method Showcase (CASH ONLY as required!) */}
          <div className="p-4 rounded-2xl bg-[#ffdcc3]/50 border border-[#fe932c] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#D97706] text-[28px]">
                local_atm
              </span>
              <div>
                <strong className="block text-xs font-bold text-[#663500]">
                  Ödeme Yöntemi: {deliveryType === 'delivery' ? 'Kapıda Nakit Ödeme' : 'Restoranda Nakit Ödeme'}
                </strong>
                <span className="text-[11px] text-[#6e3900]">
                  Sipariş teslim edildiğinde kuryeye nakit olarak ödenir.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#fe932c] text-[#663500] text-[10px] font-extrabold uppercase">
              NAKİT
            </span>
          </div>

          {/* 6. Order Summary Box */}
          <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#1A3620]/10 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
              Sipariş Özeti ({cartItems.length} Kalem)
            </h4>
            <div className="divide-y divide-[#1A3620]/5 text-xs text-[#40493E]">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="py-1.5 flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                    {item.selectedOption ? ` (${item.selectedOption.name})` : ''}
                  </span>
                  <span className="font-mono font-bold">
                    {item.totalPrice.toFixed(2)} ₺
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1A3620]/10 space-y-1 text-xs">
              <div className="flex justify-between text-[#6B746D]">
                <span>Ara Toplam:</span>
                <span className="font-mono font-bold">{subtotal.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-[#6B746D]">
                <span>Teslimat Ücreti:</span>
                <span className="font-mono font-bold text-[#277E39]">
                  {deliveryFee === 0 ? 'Ücretsiz' : `${deliveryFee.toFixed(2)} ₺`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#006423] pt-1">
                <span>Ödenecek Toplam Tutar:</span>
                <span className="font-mono text-base">{grandTotal.toFixed(2)} ₺</span>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A3620]/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#1A3620]/20 text-xs font-bold text-[#1A3620] hover:bg-slate-50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#277E39] hover:bg-[#1e652d] text-white font-bold text-sm shadow-xl shadow-[#277E39]/30 transition-all active:scale-95 border border-[#83da89]/30"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sipariş Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                  <span>Siparişi Onayla ({grandTotal.toFixed(2)} ₺)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
