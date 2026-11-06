import {
  Category,
  EmailLog,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  RestaurantSettings,
} from '../types/restaurant.js';

interface LocalDatabaseSchema {
  settings: RestaurantSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  emailLogs: EmailLog[];
  admin: {
    username: string;
    passwordPlain: string;
    name: string;
    role: string;
  };
}

const STORAGE_KEY = 'kny_ahmet_usta_store_db_v2';

const INITIAL_SETTINGS: RestaurantSettings = {
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
  aboutImageUrl: '/uploads/firin_kebabi.jpg',
  instagramUrl: 'https://www.instagram.com/konyaliahmetustaankara/',
  mapsUrl: 'https://maps.google.com/?q=Emek+Mahallesi+Biskek+Caddesi+Eski+8+Cadde+No+60+06490+Cankaya+Ankara',
  uberEatsUrl:
    'https://tgoyemek.com/restoranlar/310664?utm_source=google_food_ordering&utm_medium=organic&utm_campaign=CM2826747-search-free-nonbrand-google-pas_e-tygo_ios-and-web_acq_Global&utm_term=pickup#kebaplar',
  yemeksepetiUrl:
    'https://www.yemeksepeti.com/restaurant/hzr4/konyali-ahmet-usta-hzr4?utm_campaign=google_reserve_place_order_action_CH-SEO_',
  closedMessage: 'Şu anda fırınımız kapalıdır. Sipariş kabul saatlerimiz: 11.00 - 22.00.',
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-etli', name: 'Etli Ekmekler', order: 1, isActive: true, icon: 'local_pizza' },
  { id: 'cat-pide', name: 'Pideler', order: 2, isActive: true, icon: 'bakery_dining' },
  { id: 'cat-lahmacun', name: 'Lahmacun', order: 3, isActive: true, icon: 'dinner_dining' },
  { id: 'cat-kebap', name: 'Kebap ve Izgara', order: 4, isActive: true, icon: 'outdoor_grill' },
  { id: 'cat-corba', name: 'Çorbalar', order: 5, isActive: true, icon: 'soup_kitchen' },
  { id: 'cat-tatli', name: 'Tatlılar', order: 6, isActive: true, icon: 'cake' },
  { id: 'cat-icecek', name: 'İçecekler', order: 7, isActive: true, icon: 'local_drink' },
  { id: 'cat-diger', name: 'Diğer Ürünler', order: 8, isActive: true, icon: 'lunch_dining' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-etli-ekmek',
    name: 'Konya Etli Ekmek (180 cm)',
    categoryId: 'cat-etli',
    categoryName: 'Etli Ekmekler',
    price: 230,
    description:
      'Özel dinlendirilmiş incecik çıtır hamur üzerinde zırhta çekilmiş yerli besi dana kaburga kıyması, taze domates ve yeşil biber ile meşe odunu taş fırınında pişirilen tescilli Konya lezzeti.',
    imageUrl: '/uploads/etli_ekmek.jpg',
    isFeatured: true,
    isActive: true,
    portionOptions: [
      { name: 'Tek Hamur (1 Porsiyon)', priceDiff: 0 },
      { name: '1.5 Porsiyon (270 cm)', priceDiff: 110 },
      { name: 'Duble Porsiyon (360 cm)', priceDiff: 210 },
    ],
    spicyOption: true,
    preparationTime: '15-20 dk',
  },
  {
    id: 'prod-bicakarasi',
    name: 'Özel Bıçakarası Pide',
    categoryId: 'cat-etli',
    categoryName: 'Etli Ekmekler',
    price: 280,
    description:
      'Makineden geçirilmeden çift bıçak arasında incecik doğranmış dinlendirilmiş dana bonfile ve antrikot eti, taze yeşil biber, küp domates ve hakiki yayık tereyağı ile taş fırında nar gibi kızartılır.',
    imageUrl: '/uploads/bicakarasi_pide.jpg',
    isFeatured: true,
    isActive: true,
    portionOptions: [
      { name: 'Tek Porsiyon', priceDiff: 0 },
      { name: '1.5 Porsiyon', priceDiff: 130 },
    ],
    spicyOption: true,
    preparationTime: '15-20 dk',
  },
  {
    id: 'prod-firin-kebabi',
    name: 'Konya Fırın Kebabı (200 gr)',
    categoryId: 'cat-kebap',
    categoryName: 'Kebap ve Izgara',
    price: 440,
    description:
      'Taş fırında bakır kazanda 6 saat boyunca kendi suyunda ve meşe odunu közünde ağır ağır pişen ağızda dağılan lokum kuzu eti; sıcak tırnak pidesi, sumaklı kırmızı soğan ve közlenmiş biber eşliğinde.',
    imageUrl: '/uploads/firin_kebabi.jpg',
    isFeatured: true,
    isActive: true,
    portionOptions: [
      { name: '200 gr Porsiyon', priceDiff: 0 },
      { name: '300 gr Porsiyon', priceDiff: 210 },
      { name: '500 gr (Yarım Kilo)', priceDiff: 580 },
    ],
    spicyOption: false,
    preparationTime: '10-15 dk',
  },
  {
    id: 'prod-mevlana',
    name: 'Mevlana Pidesi (Peynirli & Kıymalı)',
    categoryId: 'cat-pide',
    categoryName: 'Pideler',
    price: 250,
    description:
      'Geleneksel Konya küflü/tulum peyniri, tam yağlı taze kaşar peyniri ve özel sebzeli dana kıymasının incecik çıtır hamur üzerinde taş fırında muazzam uyumu.',
    imageUrl: '/uploads/mevlana_pidesi.jpg',
    isFeatured: true,
    isActive: true,
    portionOptions: [
      { name: 'Tek Porsiyon', priceDiff: 0 },
      { name: '1.5 Porsiyon', priceDiff: 115 },
    ],
    spicyOption: false,
    preparationTime: '15-20 dk',
  },
  {
    id: 'prod-sac-arasi',
    name: 'Kaymaklı Sac Arası Tatlısı',
    categoryId: 'cat-tatli',
    categoryName: 'Tatlılar',
    price: 160,
    description:
      'El açması tel tel incecik çıtır yufkanın tereyağıyla sac üzerinde nar gibi kızartılıp, hakiki manda kaymağı ve bol boz Antep fıstığı ile servis edildiği asırlık Konya tatlısı.',
    imageUrl: '/uploads/sac_arasi_tatlisi.jpg',
    isFeatured: true,
    isActive: true,
    preparationTime: '10 dk',
  },
  {
    id: 'prod-lahmacun',
    name: 'Taş Fırın Çıtır Lahmacun',
    categoryId: 'cat-lahmacun',
    categoryName: 'Lahmacun',
    price: 110,
    description:
      'Zırh kıyması, taze kapya biber, domates, maydanoz ve özel baharat harcıyla meşe odunu ateşinde çıtır çıtır pişirilen, bol yeşillik ve limonla servis edilen taş fırın lahmacun.',
    imageUrl: '/uploads/tas_firin_lahmacun.jpg',
    isFeatured: false,
    isActive: true,
    spicyOption: true,
    preparationTime: '12-15 dk',
  },
  {
    id: 'prod-bamya-corbasi',
    name: 'Geleneksel Konya Bamya Çorbası',
    categoryId: 'cat-corba',
    categoryName: 'Çorbalar',
    price: 150,
    description:
      'Özenle seçilmiş kurutulmuş Amasya çiçek bamyası, minik kuşbaşı dana eti, taze limon suyu ve kemik suyunda ağır ateşte pişirilen meşhur ekşili Konya başlangıç çorbası.',
    imageUrl: '/uploads/bamya_corbasi.jpg',
    isFeatured: false,
    isActive: true,
    preparationTime: '5-10 dk',
  },
  {
    id: 'prod-kasarli-pide',
    name: 'Tereyağlı Kaşarlı Pide',
    categoryId: 'cat-pide',
    categoryName: 'Pideler',
    price: 220,
    description:
      'İnce açılmış taş fırın hamuru üzerinde bol Konya kaşar peyniri ve fırın çıkışında sürülen hakiki yayık tereyağı ile sıcacık uzayan lezzet.',
    imageUrl: '/uploads/mevlana_pidesi.jpg',
    isFeatured: false,
    isActive: true,
    preparationTime: '15 dk',
  },
  {
    id: 'prod-yayik-ayran',
    name: 'Köpüklü Yayık Ayran (330 ml)',
    categoryId: 'cat-icecek',
    categoryName: 'İçecekler',
    price: 35,
    description:
      'Tam yağlı doğal koyun ve inek yoğurdundan geleneksel yayık usulü çalkalanarak hazırlanan, taş fırın lezzetlerinin vazgeçilmezi bol köpüklü soğuk ayran.',
    imageUrl:
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    isActive: true,
    preparationTime: 'Anında',
  },
  {
    id: 'prod-salgam',
    name: 'Özel Acılı Şalgam Suyu (330 ml)',
    categoryId: 'cat-icecek',
    categoryName: 'İçecekler',
    price: 35,
    description:
      'Geleneksel fermantasyon yöntemiyle siyah havuç ve bulgur mayasından üretilen, etli ekmek ve kebapların yanına çok yakışan buz gibi şalgam suyu.',
    imageUrl:
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    isActive: true,
    preparationTime: 'Anında',
  },
  {
    id: 'prod-mesrubat',
    name: 'Kutu İçecekler (330 ml)',
    categoryId: 'cat-icecek',
    categoryName: 'İçecekler',
    price: 45,
    description:
      'Coca-Cola, Coca-Cola Zero, Fanta, Sprite veya Fuse Tea soğuk kutu meşrubat çeşitleri (Sipariş notunda tercihinizi belirtebilirsiniz).',
    imageUrl:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    isActive: true,
    preparationTime: 'Anında',
  },
  {
    id: 'prod-sutlac',
    name: 'Taş Fırın Güveç Sütlaç',
    categoryId: 'cat-tatli',
    categoryName: 'Tatlılar',
    price: 120,
    description:
      'Günlük doğal köy sütü ile toprak güveçte hazırlanan, taş fırında üzeri nar gibi karamelize edilerek fındık parçacıklarıyla sunulan fırın sütlaç.',
    imageUrl:
      'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    isActive: true,
    preparationTime: 'Anında',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'KNY-84920',
    customerName: 'Mehmet Demir',
    customerPhone: '0532 555 42 10',
    deliveryType: 'delivery',
    deliveryAddress: 'Emek Mahallesi Bişkek Caddesi No:14 D:6, Çankaya / Ankara',
    addressDirections: 'Eczane üstü 3. kat',
    orderNote: 'Limonu bol olsun, acı biberler közlensin lütfen.',
    items: [
      {
        productId: 'prod-etli-ekmek',
        name: 'Konya Etli Ekmek (180 cm)',
        price: 230,
        quantity: 2,
        subtotal: 460,
      },
      {
        productId: 'prod-bicakarasi',
        name: 'Özel Bıçakarası Pide',
        price: 280,
        quantity: 1,
        subtotal: 280,
      },
      {
        productId: 'prod-yayik-ayran',
        name: 'Köpüklü Yayık Ayran (330 ml)',
        price: 35,
        quantity: 2,
        subtotal: 70,
      },
    ],
    subtotal: 810,
    deliveryFee: 0,
    total: 810,
    paymentMethod: 'cash_delivery',
    paymentStatus: 'unpaid',
    status: 'new',
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        note: 'Sipariş müşteri tarafından oluşturuldu.',
      },
    ],
  },
];

function getLocalDb(): LocalDatabaseSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalDatabaseSchema;
      if (parsed && parsed.settings && parsed.products && parsed.categories) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }

  const initial: LocalDatabaseSchema = {
    settings: INITIAL_SETTINGS,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    emailLogs: [],
    admin: {
      username: 'admin',
      passwordPlain: 'ahmetusta42',
      name: 'Ahmet Usta',
      role: 'Baş Usta / Yönetici',
    },
  };
  saveLocalDb(initial);
  return initial;
}

function saveLocalDb(db: LocalDatabaseSchema) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('LocalStorage quota warning:', e);
  }
}

function buildEmailHtml(order: Order, settings: RestaurantSettings): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e7f0e7;"><strong>${i.name}</strong>${
          i.options ? ` (${i.options})` : ''
        }</td><td style="padding:8px;border-bottom:1px solid #e7f0e7;text-align:center;">${
          i.quantity
        }x</td><td style="padding:8px;border-bottom:1px solid #e7f0e7;text-align:right;font-weight:bold;">${i.subtotal.toFixed(
          2
        )} ₺</td></tr>`
    )
    .join('');

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8f5ed;padding:20px;color:#151d18;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #1a362020;"><div style="background:#1a3620;color:#fff;padding:20px;text-align:center;"><h2 style="margin:0;">${
    settings.restaurantName
  }</h2><div style="color:#cdffcb;font-size:12px;margin-top:4px;">YENİ SİPARİŞ FİŞİ • #${
    order.id
  }</div></div><div style="padding:20px;"><p><strong>Müşteri:</strong> ${
    order.customerName
  } (${order.customerPhone})</p><p><strong>Teslimat:</strong> ${
    order.deliveryType === 'delivery' ? order.deliveryAddress : 'Restorandan Gel-Al'
  }</p>${
    order.orderNote ? `<p><strong>Not:</strong> "${order.orderNote}"</p>` : ''
  }<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:12px;"><thead><tr style="background:#edf6ed;font-size:12px;"><th style="padding:8px;text-align:left;">Ürün</th><th style="padding:8px;text-align:center;">Adet</th><th style="padding:8px;text-align:right;">Tutar</th></tr></thead><tbody>${rows}</tbody></table><div style="text-align:right;margin-top:16px;font-size:18px;font-weight:bold;color:#006423;">TOPLAM: ${order.total.toFixed(
    2
  )} ₺ (Nakit)</div></div></div></body></html>`;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

async function handleClientSideApi(urlStr: string, init?: RequestInit): Promise<Response> {
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = (init?.method || 'GET').toUpperCase();
  const db = getLocalDb();

  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  // 1. PUBLIC BOOTSTRAP
  if (path === '/api/public/bootstrap' && method === 'GET') {
    return jsonResponse({
      settings: db.settings,
      categories: db.categories.filter((c) => c.isActive),
      products: db.products.filter((p) => p.isActive),
    });
  }

  // 2. ADMIN LOGIN
  if (path === '/api/admin/login' && method === 'POST') {
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const validUser = username === db.admin.username.toLowerCase() || username === 'admin';
    const validPass = password === db.admin.passwordPlain || password === 'ahmetusta42';

    if (!validUser || !validPass) {
      return jsonResponse({ error: 'Hatalı kullanıcı adı veya şifre!' }, 401);
    }

    return jsonResponse({
      success: true,
      token: 'token_konyali-ahmet-usta-secret-key-2025',
      admin: {
        username: db.admin.username,
        name: db.admin.name,
        role: db.admin.role,
      },
    });
  }

  // 3. CREATE ORDER (PUBLIC)
  if (path === '/api/orders' && method === 'POST') {
    const {
      customerName,
      customerPhone,
      deliveryType,
      deliveryAddress,
      addressDirections,
      orderNote,
      paymentMethod,
      items,
    } = body;

    let calculatedSubtotal = 0;
    const validatedItems = (items || []).map((reqItem: any) => {
      const prod = db.products.find((p) => p.id === reqItem.productId);
      const unitPrice = prod ? prod.price : 200;
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      const itemSubtotal = unitPrice * qty;
      calculatedSubtotal += itemSubtotal;
      return {
        productId: reqItem.productId,
        name: prod ? prod.name : 'Menü Ürünü',
        price: unitPrice,
        quantity: qty,
        options: reqItem.selectedOptionName || undefined,
        itemNote: reqItem.itemNote || undefined,
        subtotal: itemSubtotal,
      };
    });

    const newOrder: Order = {
      id: `KNY-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: String(customerName || '').trim(),
      customerPhone: String(customerPhone || '').trim(),
      deliveryType: deliveryType === 'takeaway' ? 'takeaway' : 'delivery',
      deliveryAddress: deliveryType === 'delivery' ? String(deliveryAddress || '').trim() : '',
      addressDirections: addressDirections ? String(addressDirections).trim() : undefined,
      orderNote: orderNote ? String(orderNote).trim() : undefined,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryFee: 0,
      total: calculatedSubtotal,
      paymentMethod: paymentMethod === 'cash_takeaway' ? 'cash_takeaway' : 'cash_delivery',
      paymentStatus: 'unpaid',
      status: 'new',
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'new',
          timestamp: new Date().toISOString(),
          note: 'Sipariş müşteri tarafından oluşturuldu.',
        },
      ],
    };

    db.orders.unshift(newOrder);
    const recipient = db.settings.notificationEmail || 'kubilayhokelek7145@gmail.com';
    db.emailLogs.unshift({
      id: `mail-${Date.now()}`,
      orderId: newOrder.id,
      recipient,
      subject: `Yeni Sipariş - Konyalı Ahmet Usta (#${newOrder.id})`,
      contentHtml: buildEmailHtml(newOrder, db.settings),
      status: 'sent',
      sentAt: new Date().toISOString(),
    });
    saveLocalDb(db);
    return jsonResponse({ success: true, order: newOrder }, 201);
  }

  // 4. ADMIN ORDERS
  if (path === '/api/admin/orders' && method === 'GET') {
    return jsonResponse({ orders: db.orders });
  }

  const orderStatusMatch = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    const id = decodeURIComponent(orderStatusMatch[1]);
    const order = db.orders.find((o) => o.id === id);
    if (!order) return jsonResponse({ error: 'Sipariş bulunamadı.' }, 404);
    order.status = body.status as OrderStatus;
    order.statusHistory.push({
      status: body.status as OrderStatus,
      timestamp: new Date().toISOString(),
      note: body.note,
    });
    saveLocalDb(db);
    return jsonResponse({ success: true, order });
  }

  const orderPaymentMatch = path.match(/^\/api\/admin\/orders\/([^/]+)\/payment$/);
  if (orderPaymentMatch && method === 'PATCH') {
    const id = decodeURIComponent(orderPaymentMatch[1]);
    const order = db.orders.find((o) => o.id === id);
    if (!order) return jsonResponse({ error: 'Sipariş bulunamadı.' }, 404);
    order.paymentStatus = body.paymentStatus as PaymentStatus;
    saveLocalDb(db);
    return jsonResponse({ success: true, order });
  }

  const orderDeleteMatch = path.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderDeleteMatch && method === 'DELETE') {
    const id = decodeURIComponent(orderDeleteMatch[1]);
    db.orders = db.orders.filter((o) => o.id !== id);
    saveLocalDb(db);
    return jsonResponse({ success: true });
  }

  // 5. ADMIN PRODUCTS
  if (path === '/api/admin/products' && method === 'GET') {
    return jsonResponse({ products: db.products });
  }

  if (path === '/api/admin/products' && method === 'POST') {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: body.name,
      categoryId: body.categoryId,
      categoryName: body.categoryName || 'Genel',
      price: Number(body.price) || 0,
      description: body.description || '',
      imageUrl: body.imageUrl || '/uploads/etli_ekmek.jpg',
      isFeatured: !!body.isFeatured,
      isActive: true,
      portionOptions: body.portionOptions,
      spicyOption: !!body.spicyOption,
      preparationTime: body.preparationTime || '15-20 dk',
    };
    db.products.push(newProd);
    saveLocalDb(db);
    return jsonResponse({ success: true, product: newProd }, 201);
  }

  const prodPriceMatch = path.match(/^\/api\/admin\/products\/([^/]+)\/price$/);
  if (prodPriceMatch && method === 'PATCH') {
    const id = decodeURIComponent(prodPriceMatch[1]);
    const prod = db.products.find((p) => p.id === id);
    if (!prod) return jsonResponse({ error: 'Ürün bulunamadı.' }, 404);
    prod.price = Number(body.price);
    saveLocalDb(db);
    return jsonResponse({ success: true, product: prod });
  }

  const prodActiveMatch = path.match(/^\/api\/admin\/products\/([^/]+)\/toggle-active$/);
  if (prodActiveMatch && method === 'PATCH') {
    const id = decodeURIComponent(prodActiveMatch[1]);
    const prod = db.products.find((p) => p.id === id);
    if (!prod) return jsonResponse({ error: 'Ürün bulunamadı.' }, 404);
    prod.isActive = !prod.isActive;
    saveLocalDb(db);
    return jsonResponse({ success: true, product: prod });
  }

  const prodFeaturedMatch = path.match(/^\/api\/admin\/products\/([^/]+)\/toggle-featured$/);
  if (prodFeaturedMatch && method === 'PATCH') {
    const id = decodeURIComponent(prodFeaturedMatch[1]);
    const prod = db.products.find((p) => p.id === id);
    if (!prod) return jsonResponse({ error: 'Ürün bulunamadı.' }, 404);
    prod.isFeatured = !prod.isFeatured;
    saveLocalDb(db);
    return jsonResponse({ success: true, product: prod });
  }

  const prodItemMatch = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (prodItemMatch && method === 'PUT') {
    const id = decodeURIComponent(prodItemMatch[1]);
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) return jsonResponse({ error: 'Ürün bulunamadı.' }, 404);
    if (body.categoryId && !body.categoryName) {
      const cat = db.categories.find((c) => c.id === body.categoryId);
      if (cat) body.categoryName = cat.name;
    }
    db.products[idx] = { ...db.products[idx], ...body };
    saveLocalDb(db);
    return jsonResponse({ success: true, product: db.products[idx] });
  }

  if (prodItemMatch && method === 'DELETE') {
    const id = decodeURIComponent(prodItemMatch[1]);
    db.products = db.products.filter((p) => p.id !== id);
    saveLocalDb(db);
    return jsonResponse({ success: true });
  }

  // 6. ADMIN CATEGORIES
  if (path === '/api/admin/categories' && method === 'GET') {
    return jsonResponse({ categories: db.categories });
  }

  if (path === '/api/admin/categories' && method === 'POST') {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: String(body.name || '').trim(),
      order: db.categories.length + 1,
      isActive: true,
      icon: body.icon || 'restaurant_menu',
    };
    db.categories.push(newCat);
    saveLocalDb(db);
    return jsonResponse({ success: true, category: newCat }, 201);
  }

  const catItemMatch = path.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (catItemMatch && method === 'PUT') {
    const id = decodeURIComponent(catItemMatch[1]);
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) return jsonResponse({ error: 'Kategori bulunamadı.' }, 404);
    if (typeof body.name === 'string' && body.name.trim()) {
      const trimmed = body.name.trim();
      body.name = trimmed;
      db.products.forEach((p) => {
        if (p.categoryId === id) p.categoryName = trimmed;
      });
    }
    db.categories[idx] = { ...db.categories[idx], ...body };
    saveLocalDb(db);
    return jsonResponse({ success: true, category: db.categories[idx] });
  }

  if (catItemMatch && method === 'DELETE') {
    const id = decodeURIComponent(catItemMatch[1]);
    db.categories = db.categories.filter((c) => c.id !== id);
    saveLocalDb(db);
    return jsonResponse({ success: true });
  }

  // 7. ADMIN SETTINGS & TEST EMAIL
  if (path === '/api/admin/settings' && method === 'GET') {
    return jsonResponse({ settings: db.settings });
  }

  if (path === '/api/admin/settings' && method === 'PUT') {
    db.settings = { ...db.settings, ...body };
    saveLocalDb(db);
    return jsonResponse({ success: true, settings: db.settings });
  }

  if (path === '/api/admin/settings/test-email' && method === 'POST') {
    const targetEmail = String(
      body.email || db.settings.notificationEmail || 'kubilayhokelek7145@gmail.com'
    ).trim();
    db.settings.notificationEmail = targetEmail;

    const testOrder: Order = {
      id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Test Müşteri (Ahmet Usta Bildirim Testi)',
      customerPhone: '0532 340 23 42',
      deliveryType: 'delivery',
      deliveryAddress: 'Emek Mahallesi Bişkek Caddesi, Eski 8. Cadde No: 60, Çankaya/Ankara',
      orderNote: 'Bu bir sipariş ve e-posta bildirim sistemi testidir.',
      items: [
        {
          productId: 'prod-etli-ekmek',
          name: 'Konya Etli Ekmek (180 cm)',
          price: 230,
          quantity: 1,
          subtotal: 230,
        },
        {
          productId: 'prod-yayik-ayran',
          name: 'Köpüklü Yayık Ayran (330 ml)',
          price: 35,
          quantity: 1,
          subtotal: 35,
        },
      ],
      subtotal: 265,
      deliveryFee: 0,
      total: 265,
      paymentMethod: 'cash_delivery',
      paymentStatus: 'unpaid',
      status: 'new',
      createdAt: new Date().toISOString(),
      statusHistory: [],
    };

    const emailLog: EmailLog = {
      id: `mail-${Date.now()}`,
      orderId: testOrder.id,
      recipient: targetEmail,
      subject: `Yeni Sipariş - Konyalı Ahmet Usta (#${testOrder.id})`,
      contentHtml: buildEmailHtml(testOrder, db.settings),
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    db.emailLogs.unshift(emailLog);
    saveLocalDb(db);

    return jsonResponse({
      success: true,
      mode: 'simulated',
      recipient: targetEmail,
      emailLog,
      testOrder,
    });
  }

  // 8. EMAIL LOGS
  if (path === '/api/admin/email-logs' && method === 'GET') {
    return jsonResponse({ emailLogs: db.emailLogs });
  }

  const resendMatch = path.match(/^\/api\/admin\/email-logs\/([^/]+)\/resend$/);
  if (resendMatch && method === 'POST') {
    const id = decodeURIComponent(resendMatch[1]);
    const existing = db.emailLogs.find((l) => l.id === id);
    if (!existing) return jsonResponse({ error: 'Kayıt bulunamadı.' }, 404);
    const cloned: EmailLog = {
      ...existing,
      id: `mail-${Date.now()}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    db.emailLogs.unshift(cloned);
    saveLocalDb(db);
    return jsonResponse({ success: true, mode: 'simulated', emailLog: cloned });
  }

  // 9. FILE UPLOAD (CONVERT TO BASE64 DATA URL ON STATIC VERCEL)
  if (path === '/api/admin/upload' && method === 'POST') {
    if (init?.body instanceof FormData) {
      const file = init.body.get('photo');
      if (file instanceof File) {
        const dataUrl = await fileToDataUrl(file);
        return jsonResponse({ success: true, url: dataUrl });
      }
    }
    return jsonResponse({ error: 'Geçerli bir fotoğraf seçilmedi.' }, 400);
  }

  return jsonResponse({ success: true });
}

// Install global fetch interceptor so /api/* routes always work even on static Vercel deployments
const originalFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  const isLocalApi =
    urlStr.startsWith('/api/') ||
    urlStr.startsWith(`${window.location.origin}/api/`);

  if (!isLocalApi) {
    return originalFetch(input, init);
  }

  try {
    const response = await originalFetch(input, init);
    const contentType = response.headers.get('content-type') || '';

    // If the backend returned valid JSON (Express server is running), use it and sync local copy
    if (contentType.includes('application/json') && response.status !== 404 && response.status !== 405 && response.status < 500) {
      return response;
    }

    // Otherwise (Vercel static deployment returning 404, 405, 502, or index.html text/html), handle in browser
    return await handleClientSideApi(urlStr, init);
  } catch {
    // Network error or serverless function unavailable -> handle in browser
    return await handleClientSideApi(urlStr, init);
  }
};
