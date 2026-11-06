import React, { useState, useEffect, useRef } from 'react';
import {
  Category,
  EmailLog,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductOption,
  RestaurantSettings,
} from '../types/restaurant.js';

interface AdminViewProps {
  onBackToStore: () => void;
  onShowToast: (message: string, isError?: boolean) => void;
  onDataChanged?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBackToStore,
  onShowToast,
  onDataChanged,
}) => {
  // Authentication state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kny_admin_token'));
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'categories' | 'settings' | 'emails'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Sound alert state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Filters & modals
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [previewEmailLog, setPreviewEmailLog] = useState<EmailLog | null>(null);
  const [liveIncomingOrder, setLiveIncomingOrder] = useState<Order | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // New Product Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPrepTime, setNewPrepTime] = useState('15-20 dk');
  const [newSpicyOption, setNewSpicyOption] = useState(false);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newPortions, setNewPortions] = useState<ProductOption[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit Product Form
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPrepTime, setEditPrepTime] = useState('15-20 dk');
  const [editSpicyOption, setEditSpicyOption] = useState(false);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPortions, setEditPortions] = useState<ProductOption[]>([]);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);
  const [uploadingRowProductId, setUploadingRowProductId] = useState<string | null>(null);
  const [uploadingSettingPhoto, setUploadingSettingPhoto] = useState(false);

  // Broadcast live changes to the customer storefront immediately
  const notifyStorefrontSync = () => {
    onDataChanged?.();
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('konyali_ahmet_usta_sync');
        channel.postMessage({ type: 'ADMIN_UPDATED', timestamp: Date.now() });
        channel.close();
      }
    } catch {
      // Ignore if BroadcastChannel is unavailable
    }
  };

  // Web Audio Brass Order Chime
  const playBellChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High bell tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Warm overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(587.33, now + 0.08); // D5
      gain2.gain.setValueAtTime(0.3, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 1.5);
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  };

  // Trigger sound, browser notification, live banner, and toast when a new order arrives
  const triggerNewOrderAlert = (newOrder: Order) => {
    if (soundEnabledRef.current) {
      playBellChime();
      setTimeout(() => playBellChime(), 600);
    }
    setLiveIncomingOrder(newOrder);
    onShowToast(
      `🔔 YENİ SİPARİŞ GELDİ! #${newOrder.id} • ${newOrder.customerName} (${newOrder.total.toFixed(2)} ₺)`
    );

    try {
      if (typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          new Notification(`🔔 Yeni Sipariş #${newOrder.id} - Konyalı Ahmet Usta`, {
            body: `${newOrder.customerName} (${newOrder.customerPhone}) • Toplam: ${newOrder.total.toFixed(2)} TL`,
            icon: '/logo.png',
          });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification(`🔔 Yeni Sipariş #${newOrder.id} - Konyalı Ahmet Usta`, {
                body: `${newOrder.customerName} (${newOrder.customerPhone}) • Toplam: ${newOrder.total.toFixed(2)} TL`,
                icon: '/logo.png',
              });
            }
          });
        }
      }
    } catch {
      // Ignore notification permission errors in iframe
    }
  };

  // Fetch all admin data
  const fetchAllData = async (silent = false) => {
    if (!token) return;
    if (!silent) setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resOrders, resProducts, resCats, resSettings, resLogs] = await Promise.all([
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/email-logs', { headers }),
      ]);

      if (resOrders.status === 401 || resOrders.status === 403) {
        handleLogout();
        return;
      }

      const dataOrders = await resOrders.json();
      const dataProducts = await resProducts.json();
      const dataCats = await resCats.json();
      const dataSettings = await resSettings.json();
      const dataLogs = await resLogs.json();

      const fetchedOrders: Order[] = dataOrders.orders || [];

      if (!initialLoadDoneRef.current) {
        fetchedOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
        initialLoadDoneRef.current = true;
      } else {
        const newlyArrived = fetchedOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));
        if (newlyArrived.length > 0) {
          newlyArrived.forEach((o) => knownOrderIdsRef.current.add(o.id));
          triggerNewOrderAlert(newlyArrived[0]);
        }
      }

      setOrders(fetchedOrders);
      setProducts(dataProducts.products || []);
      setCategories(dataCats.categories || []);
      // Only overwrite settings on initial/manual load so typing in Settings tab isn't interrupted
      if (!silent) {
        setSettings((prev) => prev || dataSettings.settings || null);
      } else {
        setSettings((prev) => prev ?? dataSettings.settings ?? null);
      }
      setEmailLogs(dataLogs.emailLogs || []);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
    } finally {
      if (!silent) setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchAllData(false);

    // Request browser notification permission gently
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {
      // Ignore
    }

    // Fast 4-second polling to detect new customer orders
    const interval = setInterval(() => fetchAllData(true), 4000);

    // Instant cross-tab BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('konyali_ahmet_usta_sync');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_ORDER' && event.data?.order) {
            const incoming: Order = event.data.order;
            if (!knownOrderIdsRef.current.has(incoming.id)) {
              knownOrderIdsRef.current.add(incoming.id);
              setOrders((prev) => [incoming, ...prev.filter((o) => o.id !== incoming.id)]);
              triggerNewOrderAlert(incoming);
              fetchAllData(true);
            }
          }
        };
      }
    } catch {
      // Ignore BroadcastChannel errors
    }

    // Also listen for localStorage event across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kny_latest_order_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.order && !knownOrderIdsRef.current.has(parsed.order.id)) {
            knownOrderIdsRef.current.add(parsed.order.id);
            setOrders((prev) => [parsed.order, ...prev.filter((o) => o.id !== parsed.order.id)]);
            triggerNewOrderAlert(parsed.order);
            fetchAllData(true);
          }
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [token]);

  // Handle Login (Works both with Node backend and static Vercel deployment)
  const performLoginWithCredentials = async (rawUser: string, rawPass: string) => {
    setLoginError(null);
    setIsLoggingIn(true);

    const cleanUser = rawUser.trim();
    const cleanPass = rawPass.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.token) {
        setToken(data.token);
        localStorage.setItem('kny_admin_token', data.token);
        onShowToast('Yönetim paneline hoş geldiniz, Ahmet Usta!');
        return;
      }

      // Direct fallback for static Vercel hosting if API returned non-JSON or 404/405
      if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'ahmetusta42') {
        const fallbackToken = 'token_konyali-ahmet-usta-secret-key-2025';
        setToken(fallbackToken);
        localStorage.setItem('kny_admin_token', fallbackToken);
        onShowToast('Yönetim paneline hoş geldiniz, Ahmet Usta!');
        return;
      }

      throw new Error(data?.error || 'Hatalı kullanıcı adı veya şifre!');
    } catch (err: any) {
      if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'ahmetusta42') {
        const fallbackToken = 'token_konyali-ahmet-usta-secret-key-2025';
        setToken(fallbackToken);
        localStorage.setItem('kny_admin_token', fallbackToken);
        onShowToast('Yönetim paneline hoş geldiniz, Ahmet Usta!');
        return;
      }
      setLoginError(err.message || 'Hatalı kullanıcı adı veya şifre.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLoginWithCredentials(usernameInput, passwordInput);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('kny_admin_token');
    onShowToast('Oturum kapatıldı.');
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, note }),
      });

      if (!res.ok) throw new Error('Durum güncellenemedi.');
      const data = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      onShowToast(`Sipariş #${orderId} durumu güncellendi.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus }),
      });

      if (!res.ok) throw new Error('Ödeme durumu güncellenemedi.');
      const data = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      onShowToast(`Ödeme durumu güncellendi: ${paymentStatus === 'paid' ? 'Tahsil Edildi' : 'Ödenmedi'}`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  // Save product price inline
  const handleSaveProductPrice = async (productId: string, priceValue: number) => {
    if (!priceValue || priceValue <= 0) {
      onShowToast('Geçerli bir fiyat giriniz.', true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price: priceValue }),
      });

      if (!res.ok) throw new Error('Fiyat güncellenemedi.');
      const data = await res.json();

      setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      notifyStorefrontSync();
      onShowToast(`${data.product.name} fiyatı ${priceValue} ₺ olarak güncellendi ve ana sitede yayında!`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleToggleProductActive = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Durum güncellenemedi.');
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      notifyStorefrontSync();
      onShowToast(`Ürün ${data.product.isActive ? 'aktif edildi ve menüde gösteriliyor' : 'pasife alındı'}.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleToggleProductFeatured = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-featured`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Öne çıkarma güncellenemedi.');
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      notifyStorefrontSync();
      onShowToast(`Ürün ${data.product.isFeatured ? 'ana sayfada öne çıkarıldı' : 'öne çıkanlardan kaldırıldı'}.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Sipariş silinemedi.');
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      onShowToast(`Sipariş #${orderId} silindi.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ürün silinemedi.');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      if (editingProduct && editingProduct.id === productId) {
        setEditingProduct(null);
      }
      notifyStorefrontSync();
      onShowToast(`"${name}" menüden silindi ve ana web sitesinden kaldırıldı.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  // Open Edit Product Modal with product data
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setEditTitle(product.name);
    setEditCategory(product.categoryId);
    setEditPrice(String(product.price));
    setEditDesc(product.description || '');
    setEditImageUrl(product.imageUrl || '');
    setEditPrepTime(product.preparationTime || '15-20 dk');
    setEditSpicyOption(!!product.spicyOption);
    setEditIsFeatured(!!product.isFeatured);
    setEditIsActive(product.isActive !== false);
    setEditPortions(
      product.portionOptions ? product.portionOptions.map((o) => ({ ...o })) : []
    );
  };

  // Compress / downscale large images on the client before uploading so high-res camera photos upload quickly without hitting size limits
  const prepareImageForUpload = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return file;
    }
    // Only compress if larger than 1.5MB
    if (file.size <= 1.5 * 1024 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 1920;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = outputMime === 'image/jpeg' ? 0.86 : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }
            const ext = outputMime === 'image/png' ? '.png' : '.jpg';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const optimizedFile = new File([blob], `${baseName}${ext}`, {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  // Upload Product Photo (New Product Modal)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    try {
      const optimizedFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append('photo', optimizedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Görsel yüklenemedi.');
      setNewImageUrl(data.url);
      onShowToast('Ürün fotoğrafı başarıyla yüklendi!');
    } catch (err: any) {
      onShowToast(err.message, true);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Upload Product Photo (Edit Product Modal)
  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEditPhoto(true);

    try {
      const optimizedFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append('photo', optimizedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Görsel yüklenemedi.');
      setEditImageUrl(data.url);
      onShowToast('Yeni ürün görseli yüklendi! Kaydet butonuna basarak yayınlayabilirsiniz.');
    } catch (err: any) {
      onShowToast(err.message, true);
    } finally {
      setUploadingEditPhoto(false);
      e.target.value = '';
    }
  };

  // Quick 1-click Photo Upload directly on a Product Row
  const handleRowQuickPhotoUpload = async (
    product: Product,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRowProductId(product.id);

    try {
      const optimizedFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append('photo', optimizedFile);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Görsel yüklenemedi.');

      const updateRes = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });
      if (!updateRes.ok) throw new Error('Ürün görseli güncellenemedi.');
      const updateData = await updateRes.json();

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updateData.product : p))
      );
      notifyStorefrontSync();
      onShowToast(`"${product.name}" görseli güncellendi ve ana sitede yayında!`);
    } catch (err: any) {
      onShowToast(err.message, true);
    } finally {
      setUploadingRowProductId(null);
      e.target.value = '';
    }
  };

  // Upload Setting Image (Logo or About Section Image)
  const handleUploadSettingImage = async (
    field: 'logoUrl' | 'aboutImageUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploadingSettingPhoto(true);

    try {
      const optimizedFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append('photo', optimizedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Görsel yüklenemedi.');
      const updatedSettings = { ...settings, [field]: data.url };
      setSettings(updatedSettings);

      // Immediately persist setting image to backend and sync storefront
      const saveRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: data.url }),
      });
      if (saveRes.ok) {
        const savedData = await saveRes.json();
        setSettings(savedData.settings);
        notifyStorefrontSync();
      }
      onShowToast('Görsel yüklendi ve ana web sitesine uygulandı!');
    } catch (err: any) {
      onShowToast(err.message, true);
    } finally {
      setUploadingSettingPhoto(false);
      e.target.value = '';
    }
  };

  // Add Product Form Submit
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newCategory) {
      onShowToast('Lütfen ürün adı, kategori ve fiyat alanlarını doldurun.', true);
      return;
    }

    try {
      const catObj = categories.find((c) => c.id === newCategory);
      const validPortions = newPortions
        .filter((o) => o.name.trim().length > 0)
        .map((o) => ({ name: o.name.trim(), priceDiff: Number(o.priceDiff) || 0 }));

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTitle.trim(),
          categoryId: newCategory,
          categoryName: catObj?.name || 'Genel',
          price: parseFloat(newPrice),
          description: newDesc.trim(),
          imageUrl:
            newImageUrl.trim() ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAIDFzv_4vqCypqZW2isLlFTCW0P_c3sou4e0HNFdBR6PzE4vRFr7j6miJyFudIco5nr5sKdGeBmkOULf_havzFsmPCQWt1mFV4MQQQmsHAEFLFmAHrPGz1AVGDawyJcsDN9QheJfE4Qv4Yv5dY3rNQh2LV0gWiFIwwP3VUN99MjfdaI1xqQ6foQqJyu27RcORHks_-4XA7UzliNsDCvgn54KAE2dntgiW3e1CWoPHf',
          preparationTime: newPrepTime.trim() || '15-20 dk',
          spicyOption: newSpicyOption,
          isFeatured: newIsFeatured,
          portionOptions: validPortions.length > 0 ? validPortions : undefined,
        }),
      });

      if (!res.ok) throw new Error('Ürün eklenemedi.');
      const data = await res.json();

      setProducts((prev) => [data.product, ...prev]);
      notifyStorefrontSync();
      setShowNewProductModal(false);
      setNewTitle('');
      setNewPrice('');
      setNewDesc('');
      setNewImageUrl('');
      setNewPrepTime('15-20 dk');
      setNewSpicyOption(false);
      setNewIsFeatured(false);
      setNewPortions([]);
      onShowToast(`"${data.product.name}" başarıyla menüye eklendi ve ana sitede yayına alındı!`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  // Edit Existing Product Form Submit
  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editTitle.trim() || !editPrice || !editCategory) {
      onShowToast('Ürün adı, kategorisi ve fiyatı zorunludur.', true);
      return;
    }

    try {
      const catObj = categories.find((c) => c.id === editCategory);
      const validPortions = editPortions
        .filter((o) => o.name.trim().length > 0)
        .map((o) => ({ name: o.name.trim(), priceDiff: Number(o.priceDiff) || 0 }));

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editTitle.trim(),
          categoryId: editCategory,
          categoryName: catObj?.name || editingProduct.categoryName,
          price: parseFloat(editPrice),
          description: editDesc.trim(),
          imageUrl:
            editImageUrl.trim() ||
            editingProduct.imageUrl,
          preparationTime: editPrepTime.trim() || '15-20 dk',
          spicyOption: editSpicyOption,
          isFeatured: editIsFeatured,
          isActive: editIsActive,
          portionOptions: validPortions,
        }),
      });

      if (!res.ok) throw new Error('Ürün bilgileri güncellenemedi.');
      const data = await res.json();

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? data.product : p))
      );
      notifyStorefrontSync();
      setEditingProduct(null);
      onShowToast(`"${data.product.name}" görseli, açıklaması ve bilgileri güncellendi! Ana web sitesinde yayında.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  // Settings Actions
  const handleToggleStoreOpen = async () => {
    if (!settings) return;
    const newStatus = !settings.isOpen;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOpen: newStatus }),
      });

      if (!res.ok) throw new Error('Ayar kaydedilemedi.');
      const data = await res.json();
      setSettings(data.settings);
      notifyStorefrontSync();
      onShowToast(newStatus ? 'Restoran online siparişe açıldı.' : 'Restoran siparişe kapatıldı!');
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleSaveSettingsForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Ayarlar güncellenemedi.');
      const data = await res.json();
      setSettings(data.settings);
      notifyStorefrontSync();
      onShowToast('Tüm restoran, görsel ve metin ayarları kaydedildi! Ana web sitesine anında yansıtıldı.');
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleTestEmail = async () => {
    const targetEmail = (settings?.notificationEmail || 'kubilayhokelek7145@gmail.com').trim();
    setIsTestingEmail(true);

    try {
      const res = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Test bildirimi gönderilemedi.');
      }

      // Also dispatch from client browser via FormSubmit AJAX (non-blocking)
      try {
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `Test Sipariş Bildirimi - Konyalı Ahmet Usta (${data.testOrder?.id || 'TEST'})`,
            _template: 'table',
            Siparis_No: `#${data.testOrder?.id || 'TEST-1001'}`,
            Musteri_Adi: 'Test Müşteri (Ahmet Usta Bildirim Testi)',
            Telefon: '0532 340 23 42',
            Teslimat_Turu: 'Paket Servis',
            Teslimat_Adresi: 'Emek Mahallesi Bişkek Caddesi, Eski 8. Cadde No: 60, Çankaya/Ankara',
            Siparis_Kalemleri: '1x Konya Etli Ekmek (180 cm) - 230 TL | 1x Köpüklü Yayık Ayran - 35 TL',
            Toplam_Tutar: '265.00 TL (Nakit)',
          }),
        }).catch(() => {});
      } catch {
        // Ignore browser relay error
      }

      if (soundEnabledRef.current) {
        playBellChime();
      }

      if (data.emailLog) {
        setEmailLogs((prev) => [data.emailLog, ...prev.filter((l) => l.id !== data.emailLog.id)]);
        setPreviewEmailLog(data.emailLog);
      }

      onShowToast(`Test sipariş bildirimi "${targetEmail}" adresine gönderildi!`);
      fetchAllData(true);
    } catch (err: any) {
      onShowToast(err.message || 'Test e-postası gönderilirken hata oluştu.', true);
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Category Add
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newCategoryNameInput.trim();
    if (!name) {
      onShowToast('Lütfen eklenecek kategori adını yazınız.', true);
      return;
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error('Kategori eklenemedi.');
      const data = await res.json();
      setCategories((prev) => [...prev, data.category]);
      setNewCategoryNameInput('');
      notifyStorefrontSync();
      onShowToast(`"${name}" kategorisi eklendi ve ana sitede yayında.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleSaveCategoryName = async (categoryId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      onShowToast('Kategori adı boş olamaz.', true);
      return;
    }
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error('Kategori güncellenemedi.');
      const data = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? data.category : c)));
      setProducts((prev) =>
        prev.map((p) => (p.categoryId === categoryId ? { ...p, categoryName: trimmed } : p))
      );
      notifyStorefrontSync();
      onShowToast(`Kategori adı "${trimmed}" olarak güncellendi ve ana siteye yansıtıldı.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Kategori silinemedi.');
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      notifyStorefrontSync();
      onShowToast(`"${categoryName}" kategorisi silindi.`);
    } catch (err: any) {
      onShowToast(err.message, true);
    }
  };

  // If not logged in, show Login Gate
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F3FCF3] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#1A3620]/10 p-8 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center">
            <img src="/logo.png" alt="Konyalı Ahmet Usta" className="h-14 w-auto object-contain mb-3" />
            <h1 className="font-serif text-2xl font-bold text-[#1A3620]">
              Yönetici Girişi
            </h1>
            <p className="text-xs text-[#6B746D] mt-1">
              Restoran sipariş, fırın ve menü kontrol merkezi
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                Şifre
              </label>
              <input
                type="password"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#e7f0e7] text-[11px] text-[#00531c] flex items-center justify-between gap-2">
              <div>
                <strong>Varsayılan Giriş Bilgileri:</strong>
                <div>Kullanıcı: <code>admin</code> • Şifre: <code>ahmetusta42</code></div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('admin');
                  setPasswordInput('ahmetusta42');
                  performLoginWithCredentials('admin', 'ahmetusta42');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#277E39] hover:bg-[#1e652d] text-white font-bold text-[11px] shrink-0 shadow-2xs transition-colors"
              >
                Hızlı Giriş Yap
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              {isLoggingIn ? 'Giriş Yapılıyor...' : 'Yönetim Paneline Giriş'}
            </button>

            <button
              type="button"
              onClick={onBackToStore}
              className="text-xs text-center text-[#6B746D] hover:text-[#1A3620] underline mt-2"
            >
              Müşteri Sayfasına Dön
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // KPI Calculations
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancel')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === 'new').length;
  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  const deliveryCount = orders.filter((o) => o.status === 'delivery').length;
  const completedCount = orders.filter((o) => o.status === 'done').length;

  return (
    <div className="min-h-screen bg-[#F3FCF3] flex flex-col antialiased text-[#151D18]">
      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-40 bg-[#1A3620] text-white shadow-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Konyalı Ahmet Usta" className="h-9 w-auto object-contain" />
          <div className="hidden sm:flex flex-col">
            <span className="font-serif font-bold text-base leading-tight">
              Konyalı Ahmet Usta
            </span>
            <span className="text-[11px] text-[#CDFFCB] font-semibold">
              Restoran Operasyon & Sipariş Kontrol Merkezi
            </span>
          </div>

          {/* Live Oven Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#277E39] animate-ping" />
            <span className="text-[#CDFFCB]">Meşe Fırını Aktif</span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Alert Toggle */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
            <span className="material-symbols-outlined text-[#D97706] text-[18px]">
              {soundEnabled ? 'notifications_active' : 'notifications_off'}
            </span>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                onShowToast(soundEnabled ? 'Sesli uyarı kapatıldı.' : 'Sesli uyarı açıldı.');
              }}
              className="text-xs text-white font-medium hover:text-[#CDFFCB]"
            >
              Ses: {soundEnabled ? 'Açık' : 'Kapalı'}
            </button>
            <button
              onClick={playBellChime}
              className="ml-1 px-2 py-0.5 rounded-lg bg-[#D97706] text-white text-[10px] font-bold hover:bg-[#b45309] transition-colors"
              title="Mutfak Zili Çal"
            >
              Çal
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchAllData();
              onShowToast('Sipariş listesi güncellendi.');
            }}
            disabled={isLoadingData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Yenile"
            aria-label="Yenile"
          >
            <span className={`material-symbols-outlined text-[20px] ${isLoadingData ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>

          {/* Return to Customer Storefront */}
          <button
            onClick={onBackToStore}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Müşteri Sayfası</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-[#ffdad6] hover:bg-[#ba1a1a]/20 transition-colors"
            title="Çıkış Yap"
            aria-label="Çıkış Yap"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Body with Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1">
        {/* LIVE INCOMING ORDER BANNER */}
        {liveIncomingOrder && (
          <div className="p-5 rounded-3xl bg-[#1A3620] text-white border-2 border-[#fe932c] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-once">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fe932c] text-[#1A3620] flex items-center justify-center shrink-0 animate-pulse">
                <span className="material-symbols-outlined text-[28px]">notifications_active</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fe932c] text-[#1A3620] text-[11px] font-extrabold uppercase">
                    YENİ SİPARİŞ GELDİ!
                  </span>
                  <span className="font-mono font-extrabold text-base text-[#CDFFCB]">
                    #{liveIncomingOrder.id}
                  </span>
                </div>
                <div className="text-sm font-bold mt-1">
                  {liveIncomingOrder.customerName} • {liveIncomingOrder.customerPhone} •{' '}
                  <span className="text-[#fe932c]">{liveIncomingOrder.total.toFixed(2)} ₺</span>
                </div>
                <div className="text-xs text-[#CDFFCB]/90 mt-0.5">
                  {liveIncomingOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderStatusFilter('all');
                  setLiveIncomingOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold shadow-md transition-colors"
              >
                Siparişi Gör & Onayla
              </button>
              <button
                type="button"
                onClick={() => setLiveIncomingOrder(null)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white rounded-2xl border border-[#1A3620]/10 shadow-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#277E39] text-white shadow-md'
                : 'text-[#40493E] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Canlı Siparişler ({orders.length})</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D97706] text-white text-[10px] flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#277E39] text-white shadow-md'
                : 'text-[#40493E] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Menü & Fiyat Kataloğu</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-[#277E39] text-white shadow-md'
                : 'text-[#40493E] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            <span>Kategoriler ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#277E39] text-white shadow-md'
                : 'text-[#40493E] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Restoran & Sipariş Ayarları</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'emails'
                ? 'bg-[#277E39] text-white shadow-md'
                : 'text-[#40493E] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
            <span>E-Posta Günlüğü ({emailLogs.length})</span>
          </button>
        </div>

        {/* 1. TAB: ORDERS & LIVE DASHBOARD */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#1A3620]/10 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[#6B746D] uppercase">Toplam Sipariş</span>
                <span className="font-mono text-2xl font-extrabold text-[#1A3620] mt-2">
                  {orders.length} Adet
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#1A3620]/10 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[#6B746D] uppercase">Toplam Ciro</span>
                <span className="font-mono text-2xl font-extrabold text-[#277E39] mt-2">
                  {todayRevenue.toFixed(0)} ₺
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#ffdcc3]/30 border border-[#fe932c] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#663500] uppercase">Yeni Bekleyen</span>
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                </div>
                <span className="font-mono text-2xl font-extrabold text-[#D97706] mt-2">
                  {pendingCount} Sipariş
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#1A3620]/10 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[#6B746D] uppercase">Fırında Pişen</span>
                <span className="font-mono text-2xl font-extrabold text-[#1A3620] mt-2">
                  {cookingCount} Sipariş
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#1A3620]/10 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[#6B746D] uppercase">Yola Çıkan</span>
                <span className="font-mono text-2xl font-extrabold text-[#1A3620] mt-2">
                  {deliveryCount} Sipariş
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#1A3620]/10 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[#6B746D] uppercase">Tamamlanan</span>
                <span className="font-mono text-2xl font-extrabold text-[#006423] mt-2">
                  {completedCount} Sipariş
                </span>
              </div>
            </div>

            {/* Filter Pills for Orders */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-[#1A3620]/10">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'new', label: 'Yeni Sipariş' },
                  { id: 'cooking', label: 'Fırında / Hazırlanıyor' },
                  { id: 'delivery', label: 'Yola Çıktı' },
                  { id: 'done', label: 'Teslim Edildi' },
                  { id: 'cancel', label: 'İptal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOrderStatusFilter(item.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderStatusFilter === item.id
                        ? 'bg-[#1A3620] text-white shadow-xs'
                        : 'text-[#40493E] hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#6B746D] font-medium">
                Gösterilen: <strong>{filteredOrders.length}</strong> sipariş
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-[#1A3620]/10 text-[#6B746D]">
                  <span className="material-symbols-outlined text-[40px] mb-2">inbox</span>
                  <p className="text-sm font-semibold">Bu filtrede sipariş bulunamadı.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isNew = order.status === 'new';

                  return (
                    <div
                      key={order.id}
                      className={`p-6 rounded-3xl bg-white border transition-all shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 ${
                        isNew
                          ? 'border-[#fe932c] ring-2 ring-[#fe932c]/30 bg-[#ffdcc3]/10'
                          : 'border-[#1A3620]/10'
                      }`}
                    >
                      {/* Left: ID & Timing & Payment */}
                      <div className="flex flex-col min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-extrabold text-[#1A3620]">
                            #{order.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              order.status === 'new'
                                ? 'bg-[#D97706] text-white animate-pulse'
                                : order.status === 'cooking'
                                ? 'bg-[#fe932c]/30 text-[#663500]'
                                : order.status === 'delivery'
                                ? 'bg-[#277E39] text-white'
                                : order.status === 'done'
                                ? 'bg-[#e7f0e7] text-[#006423]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {order.status === 'new'
                              ? 'Yeni Sipariş'
                              : order.status === 'cooking'
                              ? 'Fırında Pişiyor'
                              : order.status === 'delivery'
                              ? 'Yolda'
                              : order.status === 'done'
                              ? 'Teslim Edildi'
                              : 'İptal Edildi'}
                          </span>
                        </div>

                        <span className="text-xs text-[#6B746D] mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {/* Payment Toggle Badge */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdatePaymentStatus(
                                order.id,
                                order.paymentStatus === 'paid' ? 'unpaid' : 'paid'
                              )
                            }
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                              order.paymentStatus === 'paid'
                                ? 'bg-[#e7f0e7] text-[#00531c] border border-[#277E39]/30'
                                : 'bg-[#ffdcc3] text-[#663500] border border-[#fe932c]'
                            }`}
                            title="Ödeme durumunu değiştirmek için tıklayın"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {order.paymentStatus === 'paid' ? 'check_circle' : 'pending'}
                            </span>
                            <span>
                              {order.paymentStatus === 'paid'
                                ? 'Nakit Tahsil Edildi'
                                : 'Nakit ÖDENMEDİ'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Center: Customer & Items */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <strong className="text-sm font-bold text-[#151D18]">
                            {order.customerName}
                          </strong>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-xs text-[#277E39] font-mono font-bold hover:underline"
                          >
                            {order.customerPhone}
                          </a>
                          {order.customerEmail && (
                            <a
                              href={`mailto:${order.customerEmail}`}
                              className="text-xs text-[#40493E] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md font-medium transition-colors"
                            >
                              {order.customerEmail}
                            </a>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-[#40493E]">
                            {order.deliveryType === 'delivery' ? 'Paket Servis' : 'Gel-Al'}
                          </span>
                        </div>

                        {/* Order Items Summary */}
                        <div className="p-3 rounded-2xl bg-[#F8F5ED] text-xs space-y-1">
                          <strong className="text-[#277E39]">Sipariş Kalemleri:</strong>
                          <div className="space-y-0.5 text-[#151D18]">
                            {order.items.map((it, i) => (
                              <div key={i} className="flex justify-between">
                                <span>
                                  <strong>{it.quantity}x</strong> {it.name}
                                  {it.options ? ` (${it.options})` : ''}
                                  {it.itemNote ? ` - "${it.itemNote}"` : ''}
                                </span>
                                <span className="font-mono font-bold">{it.subtotal} ₺</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Address & Direction */}
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-1.5 text-xs text-[#40493E]">
                            <span className="material-symbols-outlined text-[#277E39] text-[16px] shrink-0">
                              location_on
                            </span>
                            <span>{order.deliveryAddress}</span>
                          </div>
                        )}
                        {order.orderNote && (
                          <div className="text-xs text-[#B45309] bg-[#ffdcc3]/30 px-2 py-1 rounded-lg">
                            <strong>Müşteri Notu:</strong> "{order.orderNote}"
                          </div>
                        )}
                      </div>

                      {/* Right: Total & Status Transition Buttons */}
                      <div className="flex flex-col items-start xl:items-end justify-between gap-3 min-w-[200px]">
                        <div>
                          <span className="text-[10px] text-[#6B746D] uppercase block">
                            Toplam Hesap
                          </span>
                          <span className="font-mono text-2xl font-extrabold text-[#277E39]">
                            {order.total.toFixed(2)} ₺
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {order.status === 'new' && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  'cooking',
                                  'Mutfak fırınına verildi.'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">skillet</span>
                              <span>Onayla & Fırına Ver</span>
                            </button>
                          )}

                          {order.status === 'cooking' && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  'delivery',
                                  'Kurye ile yola çıktı.'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                              <span>Kuryeye Ver</span>
                            </button>
                          )}

                          {order.status === 'delivery' && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  'done',
                                  'Müşteriye teslim edildi.'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-[#006423] hover:bg-[#00531c] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Teslim Edildi</span>
                            </button>
                          )}

                          {/* Print receipt */}
                          <button
                            onClick={() => {
                              setPrintingOrder(order);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#40493E] transition-colors"
                            title="Fiş Yazdır"
                          >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                          </button>

                          {/* Cancel button */}
                          {order.status !== 'done' && order.status !== 'cancel' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  'cancel',
                                  'Yönetici tarafından iptal edildi.'
                                )
                              }
                              className="p-2 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Siparişi İptal Et"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          )}

                          {/* Delete Order button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            title="Siparişi Sil"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Sil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. TAB: MENU, IMAGES, DESCRIPTIONS & INSTANT PRICE CATALOG */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#1A3620]/10">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A3620]">
                  Menü Görselleri, Açıklamalar & Hızlı Fiyat Yönetimi
                </h2>
                <p className="text-xs text-[#6B746D] mt-0.5">
                  Her ürünün fotoğrafını, açıklamasını, adını, porsiyonlarını ve fiyatını düzenleyebilirsiniz. Yapılan her değişiklik ana web sitesine anında yansır.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Ürün veya açıklama ara..."
                  className="px-4 py-2 rounded-xl border border-[#1A3620]/15 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
                <button
                  onClick={() => setShowNewProductModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#277E39] text-white text-xs font-bold hover:bg-[#1e652d] shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-[#1A3620]/10 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F5ED] text-[#6B746D] text-[11px] font-bold uppercase tracking-wider border-b border-[#1A3620]/10">
                      <th className="py-4 px-6">Ürün Görseli & Açıklaması</th>
                      <th className="py-4 px-4">Kategori</th>
                      <th className="py-4 px-4">Hızlı Fiyat (TL)</th>
                      <th className="py-4 px-4 text-center">Durum</th>
                      <th className="py-4 px-6 text-right">Görsel / Açıklama Düzenle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A3620]/5 text-xs text-[#151D18]">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          p.categoryName.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(menuSearch.toLowerCase())
                      )
                      .map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-6 max-w-md">
                            <div className="flex items-start gap-3.5">
                              {/* Thumbnail with 1-click quick photo upload overlay */}
                              <div className="relative group shrink-0">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  onClick={() => openEditProductModal(product)}
                                  className="w-16 h-16 rounded-2xl object-cover border border-[#1A3620]/15 cursor-pointer shadow-xs"
                                />
                                <label
                                  title="Cihazdan Yeni Görsel Yükle"
                                  className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    add_a_photo
                                  </span>
                                  <span>Görsel</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleRowQuickPhotoUpload(product, e)}
                                  />
                                </label>
                                {uploadingRowProductId === product.id && (
                                  <div className="absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center text-white text-[10px] font-bold">
                                    ...
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditProductModal(product)}
                                    className="font-bold text-sm text-[#1A3620] hover:text-[#277E39] text-left transition-colors"
                                  >
                                    {product.name}
                                  </button>
                                  <button
                                    onClick={() => handleToggleProductFeatured(product.id)}
                                    className={`text-[16px] transition-transform hover:scale-125 ${
                                      product.isFeatured ? 'text-[#D97706]' : 'text-[#6B746D]'
                                    }`}
                                    title={product.isFeatured ? 'Öne Çıkarıldı' : 'Ana Sayfada Öne Çıkar'}
                                  >
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontVariationSettings: product.isFeatured ? "'FILL' 1" : "'FILL' 0",
                                      }}
                                    >
                                      star
                                    </span>
                                  </button>
                                </div>
                                <p
                                  onClick={() => openEditProductModal(product)}
                                  className="text-[11px] text-[#6B746D] line-clamp-2 mt-1 cursor-pointer hover:text-[#151D18]"
                                  title="Açıklamayı düzenlemek için tıklayın"
                                >
                                  {product.description || 'Açıklama eklemek için Düzenle butonuna tıklayın...'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  {product.preparationTime && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-[#40493E]">
                                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                                      {product.preparationTime}
                                    </span>
                                  )}
                                  {product.portionOptions && product.portionOptions.length > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e7f0e7] text-[10px] text-[#00531c] font-semibold">
                                      {product.portionOptions.length} Porsiyon Seçeneği
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-semibold text-[#40493E]">
                            {product.categoryName}
                          </td>

                          {/* Editable Price Input with Instant Save */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                key={`${product.id}-${product.price}`}
                                type="number"
                                defaultValue={product.price}
                                id={`price-input-${product.id}`}
                                className="w-20 px-2.5 py-1.5 rounded-lg border border-[#1A3620]/20 font-mono text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                              />
                              <span className="font-bold text-xs text-[#1A3620]">₺</span>
                              <button
                                onClick={() => {
                                  const el = document.getElementById(
                                    `price-input-${product.id}`
                                  ) as HTMLInputElement;
                                  if (el) handleSaveProductPrice(product.id, parseFloat(el.value));
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#277E39] text-white text-[11px] font-bold hover:bg-[#1e652d] transition-all shadow-xs"
                              >
                                Kaydet
                              </button>
                            </div>
                          </td>

                          {/* Active / Passive toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleProductActive(product.id)}
                              className={`w-10 h-6 rounded-full relative p-0.5 transition-colors inline-block ${
                                product.isActive ? 'bg-[#277E39]' : 'bg-gray-300'
                              }`}
                              title={product.isActive ? 'Aktif (Menüde Görünür)' : 'Pasif (Menüde Gizli)'}
                            >
                              <span
                                className={`block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                                  product.isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          <td className="py-3 px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(product)}
                                className="px-3 py-1.5 rounded-xl bg-[#e7f0e7] hover:bg-[#277E39] text-[#00531c] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                                title="Görsel, Açıklama ve Detayları Düzenle"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span>Düzenle</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-all shadow-2xs"
                                title="Ürünü Sil"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                <span>Sil</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#1A3620]/10">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A3620]">
                  Kategori Yönetimi
                </h2>
                <p className="text-xs text-[#6B746D] mt-0.5">
                  Menü kategorilerinin adını düzenleyin, yeni kategori ekleyin veya görünürlüğünü kontrol edin.
                </p>
              </div>

              <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryNameInput}
                  onChange={(e) => setNewCategoryNameInput(e.target.value)}
                  placeholder="Yeni kategori adı..."
                  className="px-3.5 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#277E39] text-white text-xs font-bold hover:bg-[#1e652d] shadow-sm flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Kategori Ekle</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-[#1A3620]/10 divide-y divide-[#1A3620]/5 overflow-hidden">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;

                return (
                  <div key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="material-symbols-outlined text-[#D97706] text-[20px]">
                        {cat.icon || 'restaurant_menu'}
                      </span>
                      <input
                        type="text"
                        defaultValue={cat.name}
                        id={`cat-name-${cat.id}`}
                        className="px-3 py-1.5 rounded-xl border border-[#1A3620]/15 text-sm font-bold text-[#1A3620] focus:outline-none focus:ring-2 focus:ring-[#277E39] flex-1 max-w-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`cat-name-${cat.id}`) as HTMLInputElement;
                          if (el) handleSaveCategoryName(cat.id, el.value);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold transition-colors"
                      >
                        Adı Kaydet
                      </button>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="px-2.5 py-1 rounded-full bg-[#e7f0e7] text-[#00531c] text-xs font-bold">
                        {count} Ürün
                      </span>
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/categories/${cat.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ isActive: !cat.isActive }),
                          });
                          if (res.ok) {
                            setCategories((prev) =>
                              prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
                            );
                            notifyStorefrontSync();
                            onShowToast(`Kategori ${!cat.isActive ? 'görünür yapıldı' : 'gizlendi'}.`);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          cat.isActive ? 'text-[#277E39] hover:bg-[#e7f0e7]' : 'text-gray-400'
                        }`}
                        title={cat.isActive ? 'Kategori Görünür' : 'Kategori Gizli'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {cat.isActive ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                        title="Kategoriyi Sil"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Sil</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TAB: RESTAURANT & WEBSITE CONTENT SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="flex flex-col gap-6 max-w-4xl">
            {/* Master Store Toggle Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#1A3620]/10 flex items-center justify-between shadow-xs">
              <div>
                <strong className="font-serif text-xl font-bold text-[#1A3620] block">
                  Online Sipariş Kabul Durumu
                </strong>
                <p className="text-xs text-[#6B746D] mt-1">
                  {settings.isOpen
                    ? 'Şu anda sipariş alınıyor. Müşteriler sepete ürün ekleyip sipariş verebilir.'
                    : 'Sipariş kabulü kapalı! Müşterilere fırının kapalı olduğu uyarısı gösterilir.'}
                </p>
              </div>

              <button
                onClick={handleToggleStoreOpen}
                className={`w-14 h-8 rounded-full relative p-1 transition-colors ${
                  settings.isOpen ? 'bg-[#277E39]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    settings.isOpen ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* General Settings Form */}
            <form
              onSubmit={handleSaveSettingsForm}
              className="p-8 rounded-3xl bg-white border border-[#1A3620]/10 flex flex-col gap-6 shadow-xs"
            >
              <div className="border-b border-[#1A3620]/10 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#1A3620]">
                  Ana Web Sitesi Görselleri, Açıklamalar & İletişim Ayarları
                </h3>
                <p className="text-xs text-[#6B746D] mt-0.5">
                  Burada yaptığınız tüm değişiklikler kaydettiğiniz anda ana web sitesinde güncellenir.
                </p>
              </div>

              {/* Brand Name & Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Restoran Marka Adı
                  </label>
                  <input
                    type="text"
                    value={settings.restaurantName}
                    onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Restoran Logosu (Dosya Yükle veya URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={settings.logoUrl || '/logo.png'}
                      alt="Logo"
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-lg object-contain bg-[#1A3620] p-1 shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                    />
                    <label className="px-3 py-2 rounded-xl bg-[#e7f0e7] hover:bg-[#277E39] text-[#00531c] hover:text-white text-xs font-bold cursor-pointer whitespace-nowrap transition-colors">
                      Yükle
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadSettingImage('logoUrl', e)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Hero Section Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8F5ED] border border-[#1A3620]/10">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Ana Sayfa Üst Başlık (Hero)
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle || "Konya'nın Lezzeti, Sofranızda!"}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Ana Sayfa Alt Açıklama Metni
                  </label>
                  <input
                    type="text"
                    value={
                      settings.heroSubtitle ||
                      'Özenle hazırlanan lezzetlerimiz, geleneksel Konya mutfağının eşsiz tadıyla şimdi siparişinizde.'
                    }
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* About Section Image, Title & Texts */}
              <div className="p-5 rounded-2xl bg-[#F8F5ED] border border-[#1A3620]/10 flex flex-col gap-4">
                <h4 className="font-serif text-base font-bold text-[#1A3620]">
                  Hakkımızda Bölümü Görseli & Açıklama Metinleri
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4">
                    <img
                      src={
                        settings.aboutImageUrl ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAD1-ks17Nhc8koGcNnmKp8-iTn3eVhZdEiriMQM0FO1yGzr96YKvmH3JuKOGuyZCdTq3K8v5oclketbizMUM8d1DL72azHDsPkv6eNLumsh7Ack_WoONh8HLmuvolV5ve_OM1Gkk4WzvEWvGccSTYvvhntrZQO_SJpFTypvRe2leVVlw8T68VNRJGxLzuovexWmOHwCBS65uxNDXZzoB0e4Xt3DuNuAwrhsvh8UBuS'
                      }
                      alt="Hakkımızda Görseli"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover rounded-2xl border border-[#1A3620]/15 shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-8 flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                      Hakkımızda Görseli (Cihazdan Yükle veya URL)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.aboutImageUrl || ''}
                        onChange={(e) => setSettings({ ...settings, aboutImageUrl: e.target.value })}
                        placeholder="Görsel URL..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-[#1A3620]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                      />
                      <label className="px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white text-xs font-bold cursor-pointer whitespace-nowrap transition-colors">
                        {uploadingSettingPhoto ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadSettingImage('aboutImageUrl', e)}
                        />
                      </label>
                    </div>

                    <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider mt-1">
                      Hakkımızda Başlığı
                    </label>
                    <input
                      type="text"
                      value={settings.aboutTitle}
                      onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border border-[#1A3620]/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Hakkımızda 1. Paragraf Açıklaması
                  </label>
                  <textarea
                    rows={3}
                    value={settings.aboutText}
                    onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Hakkımızda 2. Paragraf Açıklaması
                  </label>
                  <textarea
                    rows={2}
                    value={
                      settings.aboutSubtext ||
                      'Etli ekmeğin hamurundan iç harcına, fırının harından dilimleme ustalığına kadar her aşamada özüne sadık kalarak gerçek lezzeti sunuyoruz. Siparişiniz verildiği an hamurumuz açılır, taş fırına sürülür ve sıcaklığı muhafaza edilerek adresinize ulaştırılır.'
                    }
                    onChange={(e) => setSettings({ ...settings, aboutSubtext: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* Order Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Minimum Sipariş Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.minOrderAmount}
                    onChange={(e) =>
                      setSettings({ ...settings, minOrderAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Paket Servis Ücreti (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) =>
                      setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })
                    }
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Ücretsiz Kurye Alt Limiti (TL)
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* Phone, Working Hours & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Restoran Telefonu
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Çalışma Saatleri
                  </label>
                  <input
                    type="text"
                    value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Adres & Paket Servis Bölgesi
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* Social & External Order Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Instagram Sayfa Bağlantısı
                  </label>
                  <input
                    type="text"
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Google Haritalar Bağlantısı
                  </label>
                  <input
                    type="text"
                    value={settings.mapsUrl}
                    onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Uber Eats Sipariş Butonu Linki
                  </label>
                  <input
                    type="text"
                    value={settings.uberEatsUrl || ''}
                    onChange={(e) => setSettings({ ...settings, uberEatsUrl: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Yemeksepeti Sipariş Butonu Linki
                  </label>
                  <input
                    type="text"
                    value={settings.yemeksepetiUrl || ''}
                    onChange={(e) => setSettings({ ...settings, yemeksepetiUrl: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* Notification Email & Closed Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Sipariş Bildirim E-Postası (Fırın & Kasa)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, notificationEmail: e.target.value })
                      }
                      className="flex-1 px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                    />
                    <button
                      type="button"
                      disabled={isTestingEmail}
                      onClick={handleTestEmail}
                      className="px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] disabled:opacity-60 text-white text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>{isTestingEmail ? 'Gönderiliyor...' : 'Test Gönder'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1A3620] uppercase tracking-wider">
                    Kapalıyken Gösterilecek Uyarı Mesajı
                  </label>
                  <input
                    type="text"
                    value={settings.closedMessage}
                    onChange={(e) => setSettings({ ...settings, closedMessage: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#277E39] hover:bg-[#1e652d] text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Tüm Ayarları Kaydet ve Ana Web Sitesine Uygula
              </button>
            </form>
          </div>
        )}

        {/* 5. TAB: EMAIL AUDIT LOGS & TEMPLATE PREVIEW */}
        {activeTab === 'emails' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#1A3620]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A3620]">
                  E-Posta Bildirim Günlüğü
                </h2>
                <p className="text-xs text-[#6B746D] mt-0.5">
                  Her yeni siparişte <strong>{settings?.notificationEmail || 'kubilayhokelek7145@gmail.com'}</strong> adresine gönderilen sipariş fişleri ve bildirim kayıtları.
                </p>
              </div>

              <button
                type="button"
                disabled={isTestingEmail}
                onClick={handleTestEmail}
                className="px-4 py-2.5 rounded-xl bg-[#277E39] text-white text-xs font-bold hover:bg-[#1e652d] disabled:opacity-60 shadow-sm flex items-center gap-1.5 self-start sm:self-center"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{isTestingEmail ? 'Test Gönderiliyor...' : 'Yeni Test Gönder'}</span>
              </button>
            </div>

            {/* Email Logs Table */}
            <div className="bg-white rounded-3xl border border-[#1A3620]/10 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F5ED] text-[#6B746D] text-[11px] font-bold uppercase tracking-wider border-b border-[#1A3620]/10">
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4">Sipariş No</th>
                    <th className="py-3 px-4">Alıcı E-Posta</th>
                    <th className="py-3 px-4">Durum</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A3620]/5 text-xs text-[#151D18]">
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#6B746D]">
                        Henüz kayıtlı e-posta gönderimi bulunmuyor. Sağ üstteki <strong>Yeni Test Gönder</strong> butonuna tıklayarak test edebilirsiniz.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {new Date(log.sentAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1A3620]">
                          #{log.orderId}
                        </td>
                        <td className="py-3 px-4 text-[#40493E] font-medium">{log.recipient}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'sent' || log.status === 'simulated'
                                ? 'bg-[#e7f0e7] text-[#006423]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {log.status === 'sent'
                              ? 'Gönderildi'
                              : log.status === 'simulated'
                              ? 'Bildirim Oluşturuldu'
                              : 'Başarısız'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewEmailLog(log)}
                              className="px-3 py-1.5 rounded-lg bg-[#e7f0e7] hover:bg-[#277E39] text-[#00531c] hover:text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                              <span>Fişi Gör</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch(`/api/admin/email-logs/${log.id}/resend`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                if (res.ok) {
                                  onShowToast(`Sipariş #${log.orderId} bildirimi ${log.recipient} adresine tekrar gönderildi.`);
                                  fetchAllData(true);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1A3620] font-bold text-[11px]"
                            >
                              Tekrar Gönder
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PRODUCT MODAL (IMAGE, DESCRIPTION, NAME, PRICE, PORTIONS) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#1A3620]/10 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A3620]/10 pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A3620]">
                  Ürünü Düzenle: {editingProduct.name}
                </h3>
                <p className="text-xs text-[#6B746D]">
                  Görsel, açıklama, fiyat ve porsiyon değişiklikleri kaydedildiği anda ana web sitesine düşer.
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full text-[#6B746D] hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-4 text-xs">
              {/* Image Preview + Upload + URL */}
              <div className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#1A3620]/10 flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-[#e7f0e7] border border-[#1A3620]/15 shrink-0">
                  {editImageUrl ? (
                    <img
                      src={editImageUrl}
                      alt={editTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6B746D]">
                      Görsel Yok
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full flex flex-col gap-2">
                  <label className="font-bold text-[#1A3620] uppercase">
                    Ürün Görseli (Cihazdan Yükle veya Bağlantı Yapıştır)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#277E39] hover:bg-[#1e652d] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors">
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>{uploadingEditPhoto ? 'Yükleniyor...' : 'Bilgisayardan / Telefondan Fotoğraf Seç'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="veya doğrudan görsel URL adresi girin..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#1A3620]/20 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1A3620] uppercase">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1A3620] uppercase">Kategori *</label>
                  <select
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Preparation Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1A3620] uppercase">Fiyat (TL) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1A3620] uppercase">Hazırlanma Süresi</label>
                  <input
                    type="text"
                    value={editPrepTime}
                    onChange={(e) => setEditPrepTime(e.target.value)}
                    placeholder="Örn: 15-20 dk"
                    className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1A3620] uppercase">
                  Ürün Açıklaması & İçindekiler
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Ürünün hazırlanışı, içindeki malzemeler ve sunum detayları..."
                  className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#1A3620]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="rounded text-[#277E39]"
                  />
                  <span className="font-semibold text-[#1A3620]">Ana Sayfada Öne Çıkar</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#1A3620]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSpicyOption}
                    onChange={(e) => setEditSpicyOption(e.target.checked)}
                    className="rounded text-[#277E39]"
                  />
                  <span className="font-semibold text-[#1A3620]">Acı Seçeneği Sun</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#1A3620]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded text-[#277E39]"
                  />
                  <span className="font-semibold text-[#1A3620]">Menüde Satışa Açık</span>
                </label>
              </div>

              {/* Portion Options Editor */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-[#1A3620]/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#1A3620] uppercase">
                    Porsiyon Seçenekleri (İsteğe Bağlı)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditPortions((prev) => [...prev, { name: '', priceDiff: 0 }])
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#e7f0e7] text-[#00531c] font-bold text-[11px] hover:bg-[#277E39] hover:text-white transition-colors"
                  >
                    + Porsiyon Ekle
                  </button>
                </div>

                {editPortions.length === 0 ? (
                  <p className="text-[11px] text-[#6B746D]">
                    Bu ürün için ekstra porsiyon seçeneği tanımlanmamış (Tek standart porsiyon).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editPortions.map((portion, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={portion.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditPortions((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                            );
                          }}
                          placeholder="Örn: 1.5 Porsiyon"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[#1A3620]/20 bg-white text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-[#6B746D]">+Fark:</span>
                          <input
                            type="number"
                            value={portion.priceDiff}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditPortions((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, priceDiff: val } : item
                                )
                              );
                            }}
                            className="w-20 px-2.5 py-1.5 rounded-xl border border-[#1A3620]/20 bg-white font-mono text-xs text-right"
                          />
                          <span className="text-xs font-bold">₺</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditPortions((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Porsiyonu Kaldır"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1A3620]/10">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Ürünü Sil</span>
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 font-bold text-[#40493E] hover:bg-slate-100"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#277E39] text-white font-bold hover:bg-[#1e652d] shadow-md transition-all"
                  >
                    Değişiklikleri Kaydet ve Sitede Yayınla
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#1A3620]/10 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A3620]/10 pb-4 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1A3620]">
                Yeni Menü Ürünü Ekle
              </h3>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="p-1 rounded-full text-[#6B746D] hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1A3620] uppercase">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Tereyağlı Bamya Çorbası"
                  className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1A3620] uppercase">Kategori *</label>
                  <select
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1A3620] uppercase">Fiyat (TL) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="180"
                    className="px-3.5 py-2.5 rounded-xl border border-[#1A3620]/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1A3620] uppercase">Açıklama & Malzemeler</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ürün içeriği, hamur ve malzeme detayları..."
                  className="px-3.5 py-2 rounded-xl border border-[#1A3620]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#277E39]"
                />
              </div>

              {/* Photo Upload & URL with Preview */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#1A3620]/10">
                <label className="font-bold text-[#1A3620] uppercase">Ürün Fotoğrafı</label>
                {newImageUrl && (
                  <img
                    src={newImageUrl}
                    alt="Önizleme"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-xl border border-[#1A3620]/15 mb-1"
                  />
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-[#6B746D] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#277E39] file:text-white hover:file:bg-[#1e652d]"
                  />
                  {uploadingPhoto && <span className="text-xs text-[#277E39]">Yükleniyor...</span>}
                </div>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="veya doğrudan görsel bağlantısı (URL)..."
                  className="px-3 py-2 rounded-xl border border-[#1A3620]/20 bg-white text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#1A3620]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFeatured}
                    onChange={(e) => setNewIsFeatured(e.target.checked)}
                  />
                  <span className="font-semibold text-[#1A3620]">Öne Çıkan Ürün</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#1A3620]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSpicyOption}
                    onChange={(e) => setNewSpicyOption(e.target.checked)}
                  />
                  <span className="font-semibold text-[#1A3620]">Acı Seçeneği Var</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1A3620]/10">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#277E39] text-white font-bold hover:bg-[#1e652d] shadow-sm"
                >
                  Ürünü Menüye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL NOTIFICATION PREVIEW MODAL */}
      {previewEmailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-[#1A3620]/10 my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1A3620]/10 pb-3 mb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A3620]">
                  Gönderilen Sipariş Bildirimi (#{previewEmailLog.orderId})
                </h3>
                <p className="text-xs text-[#6B746D]">
                  Alıcı: <strong>{previewEmailLog.recipient}</strong> •{' '}
                  {new Date(previewEmailLog.sentAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEmailLog(null)}
                className="p-1.5 rounded-full text-[#6B746D] hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl border border-[#1A3620]/10 bg-[#f8f5ed]">
              <iframe
                title="E-Posta Önizleme"
                srcDoc={previewEmailLog.contentHtml}
                className="w-full h-[460px] border-0 rounded-2xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-[#1A3620]/10">
              <button
                type="button"
                onClick={() => setPreviewEmailLog(null)}
                className="px-5 py-2 rounded-xl bg-[#277E39] text-white text-xs font-bold hover:bg-[#1e652d]"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN THERMAL RECEIPT (FOR KITCHEN PRINTER) */}
      {printingOrder && (
        <div id="thermal-receipt" className="hidden print:block p-4 font-mono text-black text-xs">
          <div className="text-center font-bold text-sm mb-1">KONYALI AHMET USTA</div>
          <div className="text-center text-[10px] mb-2">MEŞE TAŞ FIRINI & PAKET SERVİS</div>
          <div className="border-b border-black pb-1 mb-2">
            <div>Sipariş: #{printingOrder.id}</div>
            <div>Tarih: {new Date(printingOrder.createdAt).toLocaleString('tr-TR')}</div>
            <div>Tür: {printingOrder.deliveryType === 'delivery' ? 'PAKET SERVİS' : 'GEL-AL'}</div>
          </div>

          <div className="border-b border-black pb-1 mb-2">
            <div>Müşteri: {printingOrder.customerName}</div>
            <div>Telefon: {printingOrder.customerPhone}</div>
            {printingOrder.deliveryAddress && <div>Adres: {printingOrder.deliveryAddress}</div>}
            {printingOrder.orderNote && <div>Not: "{printingOrder.orderNote}"</div>}
          </div>

          <div className="border-b border-black pb-1 mb-2">
            {printingOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{it.quantity}x {it.name}</span>
                <span>{it.subtotal} TL</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-sm">
            <span>TOPLAM:</span>
            <span>{printingOrder.total} TL</span>
          </div>
          <div className="mt-2 text-center text-[10px]">ÖDEME: NAKİT ({printingOrder.paymentStatus === 'paid' ? 'TAHSİL EDİLDİ' : 'ÖDENMEDİ'})</div>
        </div>
      )}
    </div>
  );
};
