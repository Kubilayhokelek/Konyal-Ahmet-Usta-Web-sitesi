import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderPricing, validateCustomerInfo, generateOrderNumber } from './orderLogic.js';
import { Product } from '../types/restaurant.js';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Konya Etli Ekmek',
    categoryId: 'cat-1',
    categoryName: 'Etli Ekmekler',
    price: 230,
    description: 'Özel dinlendirilmiş hamur',
    imageUrl: 'https://example.com/etli.jpg',
    isFeatured: true,
    isActive: true,
    portionOptions: [
      { name: '1.5 Porsiyon', priceDiff: 95 },
      { name: 'Duble Porsiyon', priceDiff: 160 }
    ]
  },
  {
    id: 'prod-2',
    name: 'Yayık Ayran',
    categoryId: 'cat-drink',
    categoryName: 'İçecekler',
    price: 35,
    description: 'Köpüklü yayık ayran',
    imageUrl: 'https://example.com/ayran.jpg',
    isFeatured: false,
    isActive: true
  },
  {
    id: 'prod-inactive',
    name: 'Tükenmiş Ürün',
    categoryId: 'cat-1',
    categoryName: 'Etli Ekmekler',
    price: 200,
    description: 'Şu an yok',
    imageUrl: '',
    isFeatured: false,
    isActive: false
  }
];

const mockProductsMap = new Map<string, Product>();
mockProducts.forEach((p) => mockProductsMap.set(p.id, p));

const mockSettings = {
  isOpen: true,
  allowDelivery: true,
  allowTakeaway: true,
  minOrderAmount: 200,
  deliveryFee: 40,
  freeDeliveryThreshold: 500
};

test('orderLogic: calculates single item correctly without delivery fee below free threshold', () => {
  const result = calculateOrderPricing(
    [{ productId: 'prod-1', quantity: 1 }],
    'delivery',
    mockSettings,
    mockProductsMap
  );

  assert.equal(result.isValid, true);
  assert.equal(result.subtotal, 230);
  assert.equal(result.deliveryFee, 40);
  assert.equal(result.total, 270);
  assert.equal(result.items.length, 1);
});

test('orderLogic: applies free delivery fee when subtotal exceeds threshold', () => {
  const result = calculateOrderPricing(
    [
      { productId: 'prod-1', quantity: 2 }, // 460
      { productId: 'prod-2', quantity: 2 }  // 70 -> total 530
    ],
    'delivery',
    mockSettings,
    mockProductsMap
  );

  assert.equal(result.isValid, true);
  assert.equal(result.subtotal, 530);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.total, 530);
});

test('orderLogic: takeaway delivery has 0 delivery fee and no minimum limit constraint', () => {
  const result = calculateOrderPricing(
    [{ productId: 'prod-2', quantity: 1 }], // 35 TL (< 200 min)
    'takeaway',
    mockSettings,
    mockProductsMap
  );

  assert.equal(result.isValid, true);
  assert.equal(result.subtotal, 35);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.total, 35);
});

test('orderLogic: rejects order if subtotal is below minimum order amount for delivery', () => {
  const result = calculateOrderPricing(
    [{ productId: 'prod-2', quantity: 2 }], // 70 TL
    'delivery',
    mockSettings,
    mockProductsMap
  );

  assert.equal(result.isValid, false);
  assert.match(result.errorMessage || '', /Minimum paket sipariş tutarı/);
});

test('orderLogic: portion option price diff is correctly factored into unit price', () => {
  const result = calculateOrderPricing(
    [{ productId: 'prod-1', quantity: 1, selectedOptionName: '1.5 Porsiyon' }], // 230 + 95 = 325
    'delivery',
    mockSettings,
    mockProductsMap
  );

  assert.equal(result.isValid, true);
  assert.equal(result.subtotal, 325);
  assert.equal(result.items[0].price, 325);
});

test('orderLogic: blocks ordering if restaurant is closed', () => {
  const result = calculateOrderPricing(
    [{ productId: 'prod-1', quantity: 2 }],
    'delivery',
    { ...mockSettings, isOpen: false },
    mockProductsMap
  );

  assert.equal(result.isValid, false);
  assert.match(result.errorMessage || '', /kapalıdır/);
});

test('orderLogic: customer validator checks name, phone, address', () => {
  assert.equal(validateCustomerInfo('A', '05551234567', 'delivery', 'Adres cadde').isValid, false);
  assert.equal(validateCustomerInfo('Ahmet Yılmaz', '123', 'delivery', 'Adres cadde').isValid, false);
  assert.equal(validateCustomerInfo('Ahmet Yılmaz', '05551234567', 'delivery', '').isValid, false);
  assert.equal(validateCustomerInfo('Ahmet Yılmaz', '05551234567', 'delivery', 'Nalçacı Cad. No:4 Konya').isValid, true);
  assert.equal(validateCustomerInfo('Ahmet Yılmaz', '05551234567', 'takeaway', '').isValid, true);
});

test('orderLogic: generates KNY- prefixed order number', () => {
  const orderNum = generateOrderNumber();
  assert.match(orderNum, /^KNY-\d{5}$/);
});
