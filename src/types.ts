export type DeliveryType = 'instant_key' | 'account_credentials' | 'manual_delivery' | 'download_link';

export type StockStatus = 'in_stock' | 'out_of_stock' | 'pre_order';

export type OrderStatus = 'pending' | 'verified' | 'delivered' | 'cancelled';

export type DeviceFormat = 'desktop' | 'tablet' | 'mobile';

export type Language = 'my' | 'en';

export interface Product {
  id: string;
  title: string;
  titleMm: string;
  category: string;
  price: number;
  priceUsd: number;
  badge?: string;
  image: string;
  description: string;
  deliveryType: DeliveryType;
  stockStatus: StockStatus;
  availableKeys?: string[];
  features?: string[];
  instructions?: string;
}

export interface Category {
  id: string;
  name: string;
  nameMm: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  deliveryType: DeliveryType;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerTelegram: string;
  customerWhatsapp: string;
  customerNote: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentRef: string;
  paymentSlipUrl?: string;
  status: OrderStatus;
  deliveredKeys: string[];
  adminNote?: string;
}

export interface PaymentAccount {
  id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  qrCode?: string;
  note?: string;
}

export interface StoreSettings {
  shopName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  telegramUsername: string;
  telegramBotToken: string;
  telegramChatId: string;
  telegramChannelId?: string;
  whatsappNumber: string;
  currency: string;
  exchangeRateUsdToMmk: number;
  autoNotifyTelegram: boolean;
  autoPostProductsToTelegram?: boolean;
  autoNotifyWhatsapp: boolean;
  paymentAccounts: PaymentAccount[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
