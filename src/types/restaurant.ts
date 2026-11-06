export interface ProductOption {
  name: string;
  priceDiff: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPrice?: number;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  portionOptions?: ProductOption[];
  spicyOption?: boolean;
  preparationTime?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  icon?: string;
  description?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
  itemNote?: string;
  subtotal: number;
}

export type OrderStatus = 'new' | 'cooking' | 'delivery' | 'done' | 'cancel';
export type PaymentMethod = 'cash_delivery' | 'cash_takeaway' | 'credit_delivery';
export type PaymentStatus = 'unpaid' | 'paid';
export type DeliveryType = 'delivery' | 'takeaway';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  deliveryAddress: string;
  addressDirections?: string;
  orderNote?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface RestaurantSettings {
  restaurantName: string;
  logoUrl: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  notificationEmail: string;
  workingHours: string;
  isOpen: boolean;
  allowDelivery: boolean;
  allowTakeaway: boolean;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutTitle: string;
  aboutText: string;
  aboutSubtext?: string;
  aboutImageUrl?: string;
  instagramUrl: string;
  mapsUrl: string;
  uberEatsUrl?: string;
  yemeksepetiUrl?: string;
  closedMessage: string;
}

export interface EmailLog {
  id: string;
  orderId: string;
  recipient: string;
  subject: string;
  contentHtml: string;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
  sentAt: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOption?: ProductOption;
  spicyPreference?: 'standart' | 'az_acili' | 'bol_acili';
  itemNote?: string;
  unitPrice: number;
  totalPrice: number;
}
