import { create } from 'zustand';

export interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  taxRate: number;
}

export interface CartItem extends Product {
  quantity: number;
}

// Fiş ayarları için arayüz - currency eklendi
export interface ReceiptSettings {
  companyName: string;
  address: string;
  phone: string;
  mersisNo: string;
  currency: string; 
}

interface PosState {
  cart: CartItem[];
  settings: ReceiptSettings;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  updateSettings: (newSettings: ReceiptSettings) => void;
}

export const useStore = create<PosState>((set, get) => ({
  cart: [],
  
  // Varsayılan Ayarlar
  settings: {
    companyName: "SMARTMARKET",
    address: "Teknoloji Cad. Bilişim Sok. No:42, Budapeşte",
    phone: "+36 1 234 5678",
    mersisNo: "012345678900001",
    currency: "₺" // Varsayılan değer
  },

  updateSettings: (newSettings) => set({ settings: newSettings }),

  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),

  clearCart: () => set({ cart: [] }),
  
  cartTotal: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0)
}));