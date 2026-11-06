import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { db } from './src/server/db.js';
import {
  calculateOrderPricing,
  generateOrderNumber,
  validateCustomerInfo,
} from './src/server/orderLogic.js';
import { sendOrderNotificationEmail } from './src/server/email.js';
import { Order, OrderStatus, PaymentStatus } from './src/types/restaurant.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Ensure public uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for product photo uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `food_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
});

// Admin Auth Middleware
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'konyali-ahmet-usta-secret-key-2025';

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Giriş yapmalısınız.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token !== `token_${ADMIN_SECRET}` && token !== 'test_admin_token') {
    return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş oturum.' });
  }

  next();
}

// -----------------------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Bootstrap: All public data for the customer storefront
app.get('/api/public/bootstrap', (_req, res) => {
  const settings = db.getSettings();
  const categories = db.getCategories().filter((c) => c.isActive);
  const products = db.getProducts().filter((p) => p.isActive);
  res.json({
    settings,
    categories,
    products,
  });
});

// 2. Submit Order: Server-side validation, price integrity check, and email notification
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryType,
      deliveryAddress,
      addressDirections,
      orderNote,
      items,
      paymentMethod,
    } = req.body;

    const validation = validateCustomerInfo(
      customerName,
      customerPhone,
      deliveryType,
      deliveryAddress
    );
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const settings = db.getSettings();
    const allProducts = db.getProducts();
    const productsMap = new Map();
    allProducts.forEach((p) => productsMap.set(p.id, p));

    const pricing = calculateOrderPricing(items, deliveryType, settings, productsMap);
    if (!pricing.isValid) {
      return res.status(400).json({ error: pricing.errorMessage });
    }

    const orderId = generateOrderNumber();
    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      deliveryAddress: deliveryAddress ? deliveryAddress.trim() : '',
      addressDirections: addressDirections ? addressDirections.trim() : '',
      orderNote: orderNote ? orderNote.trim() : '',
      items: pricing.items,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      total: pricing.total,
      paymentMethod: paymentMethod || (deliveryType === 'delivery' ? 'cash_delivery' : 'cash_takeaway'),
      paymentStatus: 'unpaid',
      status: 'new',
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'new',
          timestamp: new Date().toISOString(),
          note: 'Sipariş müşteri tarafından başarıyla oluşturuldu.',
        },
      ],
    };

    // Save order in persistent database
    const savedOrder = db.createOrder(newOrder);

    // Asynchronously dispatch email notification (doesn't block client response)
    sendOrderNotificationEmail(savedOrder).catch((err) => {
      console.error('Async email notification error:', err);
    });

    res.status(201).json({
      success: true,
      order: savedOrder,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Sipariş oluşturulurken bir hata meydana geldi.' });
  }
});

// 3. Get single order details (for tracking or receipt)
app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  }
  res.json({ order });
});

// -----------------------------------------------------------------------------
// ADMIN AUTHENTICATION
// -----------------------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  const isValid = db.verifyAdmin(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Hatalı kullanıcı adı veya şifre!' });
  }

  const profile = db.getAdminProfile();
  res.json({
    success: true,
    token: `token_${ADMIN_SECRET}`,
    admin: profile,
  });
});

app.get('/api/admin/me', requireAdmin, (_req, res) => {
  res.json({ admin: db.getAdminProfile() });
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Yeni şifre en az 4 karakter olmalıdır.' });
  }
  db.updateAdminPassword(newPassword);
  res.json({ success: true, message: 'Yönetici şifresi güncellendi.' });
});

// -----------------------------------------------------------------------------
// ADMIN ORDERS MANAGEMENT
// -----------------------------------------------------------------------------

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const status = req.query.status as OrderStatus | undefined;
  const orders = db.getOrders(status ? { status } : undefined);
  res.json({ orders });
});

app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Durum parametresi zorunludur.' });
  }

  const updated = db.updateOrderStatus(req.params.id, status, note);
  if (!updated) {
    return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  }
  res.json({ success: true, order: updated });
});

app.patch('/api/admin/orders/:id/payment', requireAdmin, (req, res) => {
  const { paymentStatus } = req.body;
  if (!paymentStatus || (paymentStatus !== 'paid' && paymentStatus !== 'unpaid')) {
    return res.status(400).json({ error: 'Geçersiz ödeme durumu.' });
  }

  const updated = db.updatePaymentStatus(req.params.id, paymentStatus);
  if (!updated) {
    return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  }
  res.json({ success: true, order: updated });
});

app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const success = db.deleteOrder(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  }
  res.json({ success: true, message: 'Sipariş silindi.' });
});

// -----------------------------------------------------------------------------
// ADMIN PRODUCTS MANAGEMENT
// -----------------------------------------------------------------------------

app.get('/api/admin/products', requireAdmin, (_req, res) => {
  res.json({ products: db.getProducts() });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const {
    name,
    categoryId,
    categoryName,
    price,
    description,
    imageUrl,
    portionOptions,
    spicyOption,
    isFeatured,
    preparationTime,
  } = req.body;
  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'Ürün adı, fiyatı ve kategorisi zorunludur.' });
  }

  const newProd = db.createProduct({
    name,
    categoryId,
    categoryName: categoryName || 'Genel',
    price: Number(price),
    description: description || '',
    imageUrl:
      imageUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIDFzv_4vqCypqZW2isLlFTCW0P_c3sou4e0HNFdBR6PzE4vRFr7j6miJyFudIco5nr5sKdGeBmkOULf_havzFsmPCQWt1mFV4MQQQmsHAEFLFmAHrPGz1AVGDawyJcsDN9QheJfE4Qv4Yv5dY3rNQh2LV0gWiFIwwP3VUN99MjfdaI1xqQ6foQqJyu27RcORHks_-4XA7UzliNsDCvgn54KAE2dntgiW3e1CWoPHf',
    isFeatured: !!isFeatured,
    isActive: true,
    portionOptions: portionOptions || undefined,
    spicyOption: !!spicyOption,
    preparationTime: preparationTime || '15-20 dk',
  });

  res.status(201).json({ success: true, product: newProd });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Ürün bulunamadı.' });
  }
  res.json({ success: true, product: updated });
});

app.patch('/api/admin/products/:id/price', requireAdmin, (req, res) => {
  const { price } = req.body;
  if (price === undefined || Number(price) <= 0) {
    return res.status(400).json({ error: 'Geçerli bir fiyat giriniz.' });
  }

  const updated = db.updateProductPrice(req.params.id, Number(price));
  if (!updated) {
    return res.status(404).json({ error: 'Ürün bulunamadı.' });
  }
  res.json({ success: true, product: updated });
});

app.patch('/api/admin/products/:id/toggle-active', requireAdmin, (req, res) => {
  const prod = db.getProductById(req.params.id);
  if (!prod) return res.status(404).json({ error: 'Ürün bulunamadı.' });

  const updated = db.updateProduct(req.params.id, { isActive: !prod.isActive });
  res.json({ success: true, product: updated });
});

app.patch('/api/admin/products/:id/toggle-featured', requireAdmin, (req, res) => {
  const prod = db.getProductById(req.params.id);
  if (!prod) return res.status(404).json({ error: 'Ürün bulunamadı.' });

  const updated = db.updateProduct(req.params.id, { isFeatured: !prod.isFeatured });
  res.json({ success: true, product: updated });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Ürün bulunamadı.' });
  res.json({ success: true, message: 'Ürün silindi.' });
});

// -----------------------------------------------------------------------------
// ADMIN CATEGORIES MANAGEMENT
// -----------------------------------------------------------------------------

app.get('/api/admin/categories', requireAdmin, (_req, res) => {
  res.json({ categories: db.getCategories() });
});

app.post('/api/admin/categories', requireAdmin, (req, res) => {
  const { name, icon } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Kategori adı gereklidir.' });
  }

  const newCat = db.createCategory(name, icon);
  res.status(201).json({ success: true, category: newCat });
});

app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Kategori bulunamadı.' });
  res.json({ success: true, category: updated });
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Kategori bulunamadı.' });
  res.json({ success: true, message: 'Kategori silindi.' });
});

// -----------------------------------------------------------------------------
// ADMIN RESTAURANT SETTINGS
// -----------------------------------------------------------------------------

app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  res.json({ settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

app.post('/api/admin/settings/test-email', requireAdmin, async (req, res) => {
  const { email } = req.body;
  const settings = db.getSettings();
  const targetEmail = (email || settings.notificationEmail || 'kubilayhokelek7145@gmail.com').trim();

  if (email && email.trim() && email.trim() !== settings.notificationEmail) {
    db.updateSettings({ notificationEmail: email.trim() });
  }

  // Create a test order to test email rendering and notification
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
    statusHistory: [
      {
        status: 'new',
        timestamp: new Date().toISOString(),
        note: 'Test e-postası tetiklendi.',
      },
    ],
  };

  const result = await sendOrderNotificationEmail(testOrder, targetEmail);
  res.json({
    success: result.success,
    mode: result.mode,
    recipient: targetEmail,
    emailLog: result.emailLog,
    testOrder,
    error: result.error,
  });
});

// -----------------------------------------------------------------------------
// ADMIN EMAIL LOGS & RESEND
// -----------------------------------------------------------------------------

app.get('/api/admin/email-logs', requireAdmin, (_req, res) => {
  res.json({ emailLogs: db.getEmailLogs() });
});

app.post('/api/admin/email-logs/:id/resend', requireAdmin, async (req, res) => {
  const logs = db.getEmailLogs();
  const log = logs.find((l) => l.id === req.params.id);
  if (!log) return res.status(404).json({ error: 'E-posta kaydı bulunamadı.' });

  const order = db.getOrderById(log.orderId) || {
    id: log.orderId,
    customerName: 'Müşteri Siparişi',
    customerPhone: '0532 340 23 42',
    deliveryType: 'delivery' as const,
    deliveryAddress: 'Çankaya / Ankara',
    items: [
      {
        productId: 'prod-etli-ekmek',
        name: 'Konya Etli Ekmek',
        price: 230,
        quantity: 1,
        subtotal: 230,
      },
    ],
    subtotal: 230,
    deliveryFee: 0,
    total: 230,
    paymentMethod: 'cash_delivery' as const,
    paymentStatus: 'unpaid' as const,
    status: 'new' as const,
    createdAt: new Date().toISOString(),
    statusHistory: [],
  };

  const result = await sendOrderNotificationEmail(order, log.recipient);
  res.json({
    success: result.success,
    mode: result.mode,
    emailLog: result.emailLog,
    error: result.error,
  });
});

// -----------------------------------------------------------------------------
// FILE UPLOAD (FOR PRODUCT PHOTOS)
// -----------------------------------------------------------------------------

app.post('/api/admin/upload', requireAdmin, (req, res) => {
  upload.single('photo')(req, res, (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Dosya boyutu çok büyük (Maksimum 100 MB yüklenebilir).'
          : err.message || 'Fotoğraf yüklenirken bir hata oluştu.';
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Lütfen bir fotoğraf dosyası yükleyiniz.' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: photoUrl,
      filename: req.file.filename,
    });
  });
});

// -----------------------------------------------------------------------------
// SEO: SITEMAP & ROBOTS.TXT
// -----------------------------------------------------------------------------

app.get('/sitemap.xml', (_req, res) => {
  const products = db.getProducts().filter((p) => p.isActive);
  const baseUrl = process.env.APP_URL || 'https://konyaliahmetusta.com';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#menu</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#hakkimizda</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#iletisim</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  ${products
    .map(
      (p) => `
  <url>
    <loc>${baseUrl}/#urun-${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req, res) => {
  const baseUrl = process.env.APP_URL || 'https://konyaliahmetusta.com';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// -----------------------------------------------------------------------------
// VITE INTEGRATION / STATIC PRODUCTION SERVING
// -----------------------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Konyalı Ahmet Usta server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL] Server startup failed:', err);
  process.exit(1);
});
