import React, { useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  Category,
  Order,
  Product,
  ProductOption,
  RestaurantSettings,
} from './types/restaurant.js';
import { SplashIntro } from './components/SplashIntro.js';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { FeaturedSection } from './components/FeaturedSection.js';
import { MenuCatalog } from './components/MenuCatalog.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { AboutSection } from './components/AboutSection.js';
import { WhyUsSection } from './components/WhyUsSection.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { OrderSuccessModal } from './components/OrderSuccessModal.js';
import { AdminView } from './components/AdminView.js';
import { Toast, ToastMessage } from './components/Toast.js';

const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: 'Konyalı Ahmet Usta',
  logoUrl: '/logo.png',
  phone: '0532 340 23 42',
  address: 'Emek Mahallesi Bişkek Caddesi, Eski 8. Cadde No: 60, 06490 Çankaya/Ankara',
  city: 'Ankara',
  email: 'kubilayhokelek7145@gmail.com',
  notificationEmail: 'kubilayhokelek7145@gmail.com',
  workingHours: '11.00 - 22.00',
  isOpen: true,
  allowDelivery: true,
  allowTakeaway: true,
  minOrderAmount: 150,
  deliveryFee: 0,
  freeDeliveryThreshold: 300,
  heroTitle: "Konya'nın Lezzeti, Sofranızda!",
  heroSubtitle:
    'Özenle hazırlanan lezzetlerimiz, geleneksel Konya mutfağının eşsiz tadıyla şimdi siparişinizde.',
  aboutTitle: 'Geleneksel Konya Lezzeti',
  aboutText:
    "Konyalı Ahmet Usta, Konya'nın asırlık taş fırın geleneğini ve meşe odunu ateşinde pişen eşsiz etli ekmek mirasını sofranıza taşır. İncecik dinlendirilmiş hamurumuz, yerli besi etlerimiz ve asırlık Selçuklu lezzet mirasımızla her siparişi aynı lezzet ve tazelikte hazırlıyoruz.",
  aboutSubtext:
    'Etli ekmeğin hamurundan iç harcına, fırının harından dilimleme ustalığına kadar her aşamada özüne sadık kalarak gerçek lezzeti sunuyoruz. Siparişiniz verildiği an hamurumuz açılır, taş fırına sürülür ve sıcaklığı muhafaza edilerek adresinize ulaştırılır.',
  aboutImageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAD1-ks17Nhc8koGcNnmKp8-iTn3eVhZdEiriMQM0FO1yGzr96YKvmH3JuKOGuyZCdTq3K8v5oclketbizMUM8d1DL72azHDsPkv6eNLumsh7Ack_WoONh8HLmuvolV5ve_OM1Gkk4WzvEWvGccSTYvvhntrZQO_SJpFTypvRe2leVVlw8T68VNRJGxLzuovexWmOHwCBS65uxNDXZzoB0e4Xt3DuNuAwrhsvh8UBuS',
  instagramUrl: 'https://www.instagram.com/konyaliahmetustaankara/',
  mapsUrl: 'https://maps.google.com/?q=Emek+Mahallesi+Biskek+Caddesi+Eski+8+Cadde+No+60+06490+Cankaya+Ankara',
  uberEatsUrl:
    'https://tgoyemek.com/restoranlar/310664?utm_source=google_food_ordering&utm_medium=organic&utm_campaign=CM2826747-search-free-nonbrand-google-pas_e-tygo_ios-and-web_acq_Global&utm_term=pickup#kebaplar',
  yemeksepetiUrl:
    'https://www.yemeksepeti.com/restaurant/hzr4/konyali-ahmet-usta-hzr4?utm_campaign=google_reserve_place_order_action_CH-SEO_',
  closedMessage: 'Şu anda fırınımız kapalıdır. Sipariş kabul saatlerimiz: 11.00 - 22.00.',
};

export default function App() {
  // Splash screen state (check autostart=1 or session)
  const [showSplash, setShowSplash] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || sessionStorage.getItem('splash_shown')) {
      return false;
    }
    return true;
  });

  // Navigation view: 'storefront' or 'admin'
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      ? 'admin'
      : 'storefront';
  });

  // App data loaded from backend
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [, setIsLoading] = useState(true);

  // Cart state stored in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kny_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, isError = false) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, isError }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('kny_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch public bootstrap data and sync cart items with latest product metadata/prices
  const loadBootstrapData = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/bootstrap?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.categories) setCategories(data.categories);
        if (data.products) {
          const freshProducts: Product[] = data.products;
          setProducts(freshProducts);

          // Keep any open product modal or cart items synced with latest admin edits
          setSelectedProductForModal((prev) => {
            if (!prev) return null;
            return freshProducts.find((p) => p.id === prev.id) || null;
          });

          setCartItems((prevCart) =>
            prevCart
              .map((item) => {
                const updatedProd = freshProducts.find((p) => p.id === item.product.id);
                if (!updatedProd) return null;
                const matchedOption = item.selectedOption
                  ? updatedProd.portionOptions?.find((o) => o.name === item.selectedOption?.name) ||
                    item.selectedOption
                  : undefined;
                const unitPrice = updatedProd.price + (matchedOption ? matchedOption.priceDiff : 0);
                return {
                  ...item,
                  product: updatedProd,
                  selectedOption: matchedOption,
                  unitPrice,
                  totalPrice: unitPrice * item.quantity,
                };
              })
              .filter(Boolean) as CartItem[]
          );
        }
      }
    } catch (err) {
      console.warn('Could not fetch bootstrap data from API, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + cross-tab / window focus / popstate live sync
  useEffect(() => {
    loadBootstrapData();

    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('storefront');
        loadBootstrapData();
      }
    };

    const handleWindowFocus = () => {
      loadBootstrapData();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', handleWindowFocus);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('konyali_ahmet_usta_sync');
        channel.onmessage = () => {
          loadBootstrapData();
        };
      }
    } catch {
      // Ignore if BroadcastChannel is not supported
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', handleWindowFocus);
      if (channel) channel.close();
    };
  }, [loadBootstrapData]);

  // Cart Calculations
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1, option?: ProductOption, spicy?: any, note?: string) => {
    const cartItemId = `${product.id}_${option ? option.name : 'std'}_${spicy || 'norm'}`;
    const unitPrice = product.price + (option ? option.priceDiff : 0);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * unitPrice,
                itemNote: note || item.itemNote,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            cartItemId,
            product,
            quantity,
            selectedOption: option,
            spicyPreference: spicy,
            itemNote: note,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });

    showToast(`"${product.name}" sepete eklendi.`);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Ürün sepetten çıkarıldı.');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Sepet temizlendi.');
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentView === 'admin') {
      setCurrentView('storefront');
      window.history.pushState(null, '', '/');
      loadBootstrapData();
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    setCartItems([]); // Clear cart
    showToast(`Siparişiniz alındı (#${order.id})! Mutfak fırınına iletildi.`);
  };

  const openAdminView = () => {
    setCurrentView('admin');
    window.history.pushState(null, '', '/admin');
  };

  const closeAdminView = () => {
    setCurrentView('storefront');
    window.history.pushState(null, '', '/');
    loadBootstrapData(); // Refresh products, images, descriptions, and settings
  };

  // Render Splash Screen if active
  if (showSplash) {
    return <SplashIntro onComplete={() => setShowSplash(false)} />;
  }

  // Render Admin View
  if (currentView === 'admin') {
    return (
      <>
        <AdminView
          onBackToStore={closeAdminView}
          onShowToast={showToast}
          onDataChanged={loadBootstrapData}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Render Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5ED] text-[#151D18]">
      {/* Sticky Header */}
      <Navbar
        settings={settings}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateToSection={handleScrollToSection}
        onOpenAdmin={openAdminView}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          settings={settings}
          onOrderClick={() => handleScrollToSection('menu')}
          onExploreMenuClick={() => handleScrollToSection('menu')}
        />

        {/* Featured Products */}
        <FeaturedSection
          products={products}
          onAddToCart={handleAddToCart}
          onOpenProductModal={(p) => setSelectedProductForModal(p)}
        />

        {/* Full Menu Catalog */}
        <MenuCatalog
          categories={categories}
          products={products}
          onAddToCart={handleAddToCart}
          onOpenProductModal={(p) => setSelectedProductForModal(p)}
        />

        {/* About Ahmet Usta */}
        <AboutSection settings={settings} />

        {/* Why Choose Us */}
        <WhyUsSection />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigateToSection={handleScrollToSection}
        onOpenAdmin={openAdminView}
      />

      {/* Mobile Persistent Floating Cart Bar (Bottom) */}
      {cartCount > 0 && !isCartOpen && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-30 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#277E39] text-white shadow-2xl border border-white/20 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D97706] text-white text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
              <span className="text-xs font-bold">Sepeti Görüntüle</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-base font-extrabold">{cartTotal.toFixed(2)} ₺</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Product Customizer Modal */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onConfirmAdd={handleAddToCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        settings={settings}
        onOrderCompleted={handleOrderSuccess}
      />

      {/* Order Success Screen */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Global Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
