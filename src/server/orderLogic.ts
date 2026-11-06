import { DeliveryType, OrderItem, Product, RestaurantSettings } from '../types/restaurant.js';

export interface OrderInputItem {
  productId: string;
  quantity: number;
  selectedOptionName?: string;
  itemNote?: string;
}

export interface CalculationResult {
  isValid: boolean;
  errorMessage?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `KNY-${num}`;
}

export function validateCustomerInfo(
  name: string,
  phone: string,
  deliveryType: DeliveryType,
  address: string
): { isValid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Lütfen geçerli bir ad ve soyad giriniz.' };
  }
  
  const cleanedPhone = phone.replace(/\D/g, '');
  if (cleanedPhone.length < 10) {
    return { isValid: false, error: 'Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).' };
  }

  if (deliveryType === 'delivery') {
    if (!address || address.trim().length < 5) {
      return { isValid: false, error: 'Paket servis için lütfen açık teslimat adresinizi eksiksiz giriniz.' };
    }
  }

  return { isValid: true };
}

export function calculateOrderPricing(
  inputItems: OrderInputItem[],
  deliveryType: DeliveryType,
  settings: Pick<RestaurantSettings, 'minOrderAmount' | 'deliveryFee' | 'freeDeliveryThreshold' | 'isOpen' | 'allowDelivery' | 'allowTakeaway'>,
  productsMap: Map<string, Product>
): CalculationResult {
  if (!settings.isOpen) {
    return {
      isValid: false,
      errorMessage: 'Restoranımız şu anda online siparişe kapalıdır.',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  if (deliveryType === 'delivery' && !settings.allowDelivery) {
    return {
      isValid: false,
      errorMessage: 'Paket servis şu anda aktif değildir.',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  if (deliveryType === 'takeaway' && !settings.allowTakeaway) {
    return {
      isValid: false,
      errorMessage: 'Gel-al teslimat şu anda aktif değildir.',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  if (!inputItems || inputItems.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Sepetinizde ürün bulunmamaktadır.',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  const verifiedItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const input of inputItems) {
    const product = productsMap.get(input.productId);
    if (!product || !product.isActive) {
      return {
        isValid: false,
        errorMessage: `Menüdeki bazı ürünler güncel değil veya tükendi: ${input.productId}`,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
      };
    }

    if (input.quantity <= 0 || !Number.isInteger(input.quantity)) {
      return {
        isValid: false,
        errorMessage: 'Geçersiz ürün adedi.',
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
      };
    }

    let unitPrice = product.price;
    let optionText = '';

    if (input.selectedOptionName && product.portionOptions) {
      const matchOpt = product.portionOptions.find((o) => o.name === input.selectedOptionName);
      if (matchOpt) {
        unitPrice += matchOpt.priceDiff;
        optionText = matchOpt.name;
      }
    }

    const itemSubtotal = unitPrice * input.quantity;
    calculatedSubtotal += itemSubtotal;

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity: input.quantity,
      options: optionText || undefined,
      itemNote: input.itemNote ? input.itemNote.trim() : undefined,
      subtotal: itemSubtotal,
    });
  }

  if (deliveryType === 'delivery' && calculatedSubtotal < settings.minOrderAmount) {
    return {
      isValid: false,
      errorMessage: `Minimum paket sipariş tutarı ${settings.minOrderAmount} ₺'dir. Sepet tutarınız: ${calculatedSubtotal} ₺`,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  let finalDeliveryFee = 0;
  if (deliveryType === 'delivery') {
    if (settings.freeDeliveryThreshold > 0 && calculatedSubtotal >= settings.freeDeliveryThreshold) {
      finalDeliveryFee = 0;
    } else {
      finalDeliveryFee = settings.deliveryFee || 0;
    }
  }

  const finalTotal = calculatedSubtotal + finalDeliveryFee;

  return {
    isValid: true,
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    deliveryFee: finalDeliveryFee,
    total: finalTotal,
  };
}
