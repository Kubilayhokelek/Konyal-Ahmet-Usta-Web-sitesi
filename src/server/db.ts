import fs from 'node:fs';
import path from 'node:path';
import {
  Category,
  EmailLog,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  RestaurantSettings,
} from '../types/restaurant.js';

interface DatabaseSchema {
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_SETTINGS: RestaurantSettings = {
  restaurantName: 'Konyalı Ahmet Usta',
  logoUrl: '/logo.png',
  phone: '0532 340 23 42',
  address: 'Emek Mahallesi Bişkek Caddesi, Eski 8. Cadde No: 60, 06490 Çankaya/Ankara',
  city: 'Ankara',
  email: 'info@konyaliahmetusta.com',
  notificationEmail: 'siparis@konyaliahmetusta.com',
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
    deliveryAddress: 'Nalçacı Cad. Vatan Apt. No:14 D:6, Selçuklu / Konya',
    addressDirections: 'Vatan Eczanesi üstü 3. kat',
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
  {
    id: 'KNY-84918',
    customerName: 'Ayşe Yılmaz',
    customerPhone: '0541 230 19 88',
    deliveryType: 'delivery',
    deliveryAddress: 'Meram Yeni Yol Cad. Zambak Konakları B Blok K:3, Meram / Konya',
    addressDirections: 'Güvenlikten sonra sağdaki ilk blok',
    orderNote: 'Zil bozuk lütfen gelince arayın.',
    items: [
      {
        productId: 'prod-mevlana',
        name: 'Mevlana Pidesi (Peynirli & Kıymalı)',
        price: 250,
        quantity: 1,
        subtotal: 250,
      },
      {
        productId: 'prod-firin-kebabi',
        name: 'Konya Fırın Kebabı (200 gr)',
        price: 440,
        quantity: 1,
        subtotal: 440,
      },
      {
        productId: 'prod-sac-arasi',
        name: 'Kaymaklı Sac Arası Tatlısı',
        price: 160,
        quantity: 1,
        subtotal: 160,
      },
    ],
    subtotal: 850,
    deliveryFee: 0,
    total: 850,
    paymentMethod: 'cash_delivery',
    paymentStatus: 'unpaid',
    status: 'cooking',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      },
      {
        status: 'cooking',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        note: 'Mutfak taş fırınına verildi.',
      },
    ],
  },
  {
    id: 'KNY-84912',
    customerName: 'Osman Kara',
    customerPhone: '0505 889 44 21',
    deliveryType: 'delivery',
    deliveryAddress: 'Şefik Can Cad. Erguvan Sitesi C Blok No:8, Selçuklu / Konya',
    items: [
      {
        productId: 'prod-etli-ekmek',
        name: 'Konya Etli Ekmek (180 cm)',
        price: 230,
        quantity: 3,
        subtotal: 690,
      },
      {
        productId: 'prod-bamya-corbasi',
        name: 'Geleneksel Konya Bamya Çorbası',
        price: 150,
        quantity: 1,
        subtotal: 150,
      },
      {
        productId: 'prod-salgam',
        name: 'Özel Acılı Şalgam Suyu (330 ml)',
        price: 35,
        quantity: 1,
        subtotal: 35,
      },
    ],
    subtotal: 875,
    deliveryFee: 0,
    total: 875,
    paymentMethod: 'cash_delivery',
    paymentStatus: 'unpaid',
    status: 'delivery',
    createdAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
      },
      {
        status: 'cooking',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        status: 'delivery',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        note: 'Kurye Ali Usta yola çıktı.',
      },
    ],
  },
  {
    id: 'KNY-84905',
    customerName: 'Fatma Şahin',
    customerPhone: '0533 112 90 04',
    deliveryType: 'delivery',
    deliveryAddress: 'Kerkük Cad. Çiğdem Apt. No:5, Selçuklu / Konya',
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
    paymentStatus: 'paid',
    status: 'done',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      },
      {
        status: 'done',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        note: 'Teslim edildi ve nakit tahsil edildi.',
      },
    ],
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.error('Error reading database file, creating fresh database', e);
      }
    }

    const initial: DatabaseSchema = {
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

    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- SETTINGS ---
  getSettings(): RestaurantSettings {
    return { ...this.data.settings };
  }

  updateSettings(newSettings: Partial<RestaurantSettings>): RestaurantSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.persist();
    return this.getSettings();
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  createCategory(name: string, icon?: string): Category {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      order: this.data.categories.length + 1,
      isActive: true,
      icon: icon || 'restaurant_menu',
    };
    this.data.categories.push(newCategory);
    this.persist();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.data.categories[index] = { ...this.data.categories[index], ...updates };
    if (updates.name) {
      const trimmedName = updates.name.trim();
      this.data.categories[index].name = trimmedName;
      this.data.products.forEach((p) => {
        if (p.categoryId === id) {
          p.categoryName = trimmedName;
        }
      });
    }
    this.persist();
    return this.data.categories[index];
  }

  deleteCategory(id: string): boolean {
    const prevLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return [...this.data.products];
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    this.data.products.push(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    if (updates.categoryId && !updates.categoryName) {
      const cat = this.data.categories.find((c) => c.id === updates.categoryId);
      if (cat) {
        updates.categoryName = cat.name;
      }
    }
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.persist();
    return this.data.products[index];
  }

  updateProductPrice(id: string, newPrice: number): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.products[index].price = newPrice;
    this.persist();
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- ORDERS ---
  getOrders(filter?: { status?: OrderStatus }): Order[] {
    let result = [...this.data.orders];
    if (filter?.status) {
      result = result.filter((o) => o.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.persist();
    return order;
  }

  updateOrderStatus(id: string, status: OrderStatus, note?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note,
    });
    this.persist();
    return order;
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Order | null {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) return null;
    order.paymentStatus = paymentStatus;
    this.persist();
    return order;
  }

  // --- EMAIL LOGS ---
  getEmailLogs(): EmailLog[] {
    return [...this.data.emailLogs].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  addEmailLog(log: Omit<EmailLog, 'id' | 'sentAt'>): EmailLog {
    const newLog: EmailLog = {
      ...log,
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
    };
    this.data.emailLogs.unshift(newLog);
    // Keep last 100 logs
    if (this.data.emailLogs.length > 100) {
      this.data.emailLogs = this.data.emailLogs.slice(0, 100);
    }
    this.persist();
    return newLog;
  }

  // --- ADMIN AUTH ---
  verifyAdmin(username: string, passwordPlain: string): boolean {
    return (
      username === this.data.admin.username &&
      passwordPlain === this.data.admin.passwordPlain
    );
  }

  getAdminProfile() {
    return {
      username: this.data.admin.username,
      name: this.data.admin.name,
      role: this.data.admin.role,
    };
  }

  updateAdminPassword(newPasswordPlain: string): boolean {
    this.data.admin.passwordPlain = newPasswordPlain;
    this.persist();
    return true;
  }
}

export const db = new Database();
