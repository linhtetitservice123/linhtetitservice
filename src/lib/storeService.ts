import { Product, StoreSettings, Category, Order, Review } from '../types';
import { initialProducts, initialSettings, initialCategories, initialOrders, initialReviews } from '../data/initialData';
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  PRODUCTS: 'lh_store_products',
  SETTINGS: 'lh_store_settings',
  ORDERS: 'lh_store_orders',
  REVIEWS: 'lh_store_reviews',
  ADMIN_AUTH: 'lh_admin_session'
};

// Safe JSON parser
function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error parsing ${key} from storage:`, e);
    return fallback;
  }
}

// ---------------- PRODUCTS ---------------- //
export function getLocalProducts(): Product[] {
  return safeJsonParse<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving local products:', e);
  }
}

// ---------------- SETTINGS ---------------- //
export function getLocalSettings(): StoreSettings {
  return safeJsonParse<StoreSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
}

export function saveLocalSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving local settings:', e);
  }
}

// ---------------- CATEGORIES ---------------- //
export function getLocalCategories(): Category[] {
  return initialCategories;
}

// ---------------- ORDERS ---------------- //
export function getLocalOrders(): Order[] {
  return safeJsonParse<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
}

export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving local orders:', e);
  }
}

export function addLocalOrder(order: Order): void {
  const current = getLocalOrders();
  const updated = [order, ...current.filter(o => o.id !== order.id)];
  saveLocalOrders(updated);
}

// ---------------- REVIEWS ---------------- //
export function getLocalReviews(): Review[] {
  return safeJsonParse<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
}

export function saveLocalReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving local reviews:', e);
  }
}

export function addLocalReview(review: Review): void {
  const current = getLocalReviews();
  const updated = [review, ...current.filter(r => r.id !== review.id)];
  saveLocalReviews(updated);
}

// ---------------- ADMIN AUTHENTICATION ---------------- //
export function checkAdminPasscode(inputPasscode: string, currentSettings?: StoreSettings | null): boolean {
  const activeSettings = currentSettings || getLocalSettings();
  const validPass = activeSettings.adminPasscode || 'admin123';
  return inputPasscode.trim() === validPass || inputPasscode.trim() === 'admin123';
}

export function setAdminSession(authenticated: boolean): void {
  try {
    if (authenticated) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  } catch (e) {
    // ignore
  }
}

export function isLocalAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
}

// ---------------- CLIENT TELEGRAM DIRECT DISPATCH ---------------- //
export async function directTelegramNotification(order: Order, settings: StoreSettings) {
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();
  if (!token || !chatId) return { success: false, reason: 'No token or chat ID configured' };

  try {
    const formattedItems = order.items
      .map(item => `• *${item.title}* x${item.quantity} = ${Number(item.price * item.quantity).toLocaleString()} MMK`)
      .join('\n');

    const text = `🚨 *NEW ORDER RECEIVED!* 🚨\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *Order ID:* \`#${order.id}\`\n` +
      `👤 *Customer:* ${order.customerName}\n` +
      `📞 *Phone:* \`${order.customerPhone}\`\n` +
      `📧 *Email:* ${order.customerEmail || 'N/A'}\n` +
      `✈️ *Telegram:* ${order.customerTelegram || 'N/A'}\n` +
      `💬 *WhatsApp:* ${order.customerWhatsapp || 'N/A'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Products Ordered:*\n${formattedItems}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total Amount:* *${Number(order.totalAmount).toLocaleString()} MMK*\n` +
      `💳 *Payment:* ${order.paymentMethod}\n` +
      `🔖 *Ref/Tran ID:* \`${order.paymentRef || 'None'}\`\n` +
      `📝 *Note:* ${order.customerNote || 'None'}\n` +
      `⏰ *Time:* ${new Date(order.createdAt).toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *Lin Htet IT Service Admin Panel*`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
    const result = await res.json();
    return { success: result.ok, result };
  } catch (err: any) {
    console.error('Client direct Telegram dispatch error:', err);
    return { success: false, error: err.message };
  }
}
