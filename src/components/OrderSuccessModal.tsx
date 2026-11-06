import React from 'react';
import { Order } from '../types/restaurant.js';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#1A3620]/10 my-8">
        {/* Success Header */}
        <div className="p-8 bg-[#1A3620] text-white text-center flex flex-col items-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#277E39] text-[#CDFFCB] flex items-center justify-center mb-3 shadow-lg ring-8 ring-white/10 animate-scale-up">
            <span className="material-symbols-outlined text-[36px]">check</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
            Siparişiniz başarıyla alındı.
          </h2>

          {/* Order ID Pill */}
          <div className="mt-3 px-5 py-2 rounded-full bg-white/15 border border-white/20 text-[#ffdcc3] font-mono text-base font-extrabold tracking-wider">
            Sipariş numaranız: #{order.id}
          </div>

          <p className="text-xs sm:text-sm text-[#CDFFCB] font-medium mt-3">
            En kısa sürede sizinle iletişime geçeceğiz.
          </p>
        </div>

        {/* Status Timeline */}
        <div className="p-6 bg-[#F3FCF3] border-b border-[#1A3620]/10">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#277E39] text-white flex items-center justify-center font-bold text-xs mb-1 shadow-sm">
                1
              </div>
              <span className="text-[10px] font-bold text-[#277E39]">Alındı</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white text-[#D97706] border-2 border-[#D97706] flex items-center justify-center font-bold text-xs mb-1">
                2
              </div>
              <span className="text-[10px] font-bold text-[#6B746D]">Fırında</span>
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-white text-[#6B746D] border border-gray-300 flex items-center justify-center font-bold text-xs mb-1">
                3
              </div>
              <span className="text-[10px] text-[#6B746D]">Yolda</span>
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-white text-[#6B746D] border border-gray-300 flex items-center justify-center font-bold text-xs mb-1">
                4
              </div>
              <span className="text-[10px] text-[#6B746D]">Teslim</span>
            </div>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 flex flex-col gap-4 max-h-96 overflow-y-auto">
          {/* Customer & Delivery Information */}
          <div className="p-4 rounded-2xl bg-[#F8F5ED] text-xs space-y-1.5 text-[#40493E]">
            <div className="flex justify-between">
              <span className="text-[#6B746D]">Müşteri:</span>
              <strong className="text-[#151D18]">{order.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B746D]">Telefon:</span>
              <span className="font-mono font-bold">{order.customerPhone}</span>
            </div>
            {order.customerEmail && (
              <div className="flex justify-between">
                <span className="text-[#6B746D]">E-Posta:</span>
                <span className="font-medium text-[#151D18]">{order.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B746D]">Teslimat Türü:</span>
              <span className="font-bold text-[#277E39]">
                {order.deliveryType === 'delivery' ? 'Paket Servis (Adrese Teslim)' : 'Restorandan Gel-Al'}
              </span>
            </div>
            {order.deliveryAddress && (
              <div className="pt-1 border-t border-[#1A3620]/5">
                <span className="text-[#6B746D] block">Adres:</span>
                <span className="text-[#151D18] font-medium">{order.deliveryAddress}</span>
              </div>
            )}
            {order.orderNote && (
              <div className="pt-1 text-[#b45309]">
                <span>Sipariş Notu: "{order.orderNote}"</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
              Sipariş Edilen Ürünler
            </h4>
            <div className="border border-[#1A3620]/10 rounded-2xl overflow-hidden divide-y divide-[#1A3620]/5 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1A3620]">
                      {item.quantity}x {item.name}
                    </span>
                    {item.options && (
                      <span className="text-[10px] text-[#6B746D] block">
                        {item.options}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#1A3620]">
                    {item.subtotal.toFixed(2)} ₺
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Notice Banner */}
          <div className="p-4 rounded-2xl bg-[#ffdcc3]/60 border border-[#fe932c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D97706] text-[24px]">payments</span>
              <div>
                <strong className="block text-xs text-[#663500]">
                  Kapıda Nakit Tahsil Edilecektir
                </strong>
                <span className="text-[11px] text-[#6e3900]">
                  Toplam hesap: <strong>{order.total.toFixed(2)} ₺</strong>
                </span>
              </div>
            </div>
            <span className="font-mono font-extrabold text-base text-[#006423]">
              {order.total.toFixed(2)} ₺
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-[#1A3620]/10 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#1A3620]/20 hover:bg-slate-100 text-xs font-bold text-[#1A3620] transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Fiş Yazdır</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Ana Sayfaya Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};
