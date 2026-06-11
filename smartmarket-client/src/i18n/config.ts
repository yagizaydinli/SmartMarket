import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  tr: {
    translation: {
      "app_name": "SmartMarket",
      "error_console_not_found": "Ürün bulunamadı",
      "error_product_not_found": "Dikkat: {{barcode}} numaralı ürün sistemde bulunamadı!",
      "error_console_search": "AI Arama Hatası",
      "error_search": "Arama sırasında bir hata oluştu.",
      "error_checkout": "İşlem sırasında hata oluştu.",
      "toggle_view_tooltip": "Yeni Ürün Ekle / Kasaya Dön",
      "manual_barcode_disabled": "Ürün eklerken devre dışı...",
      "manual_barcode_placeholder": "Barkod okumadıysa buraya gir...",
      "cart_empty": "Sepetiniz şu an boş",
      "currency_symbol": "₺",
      "total": "TOPLAM",
      "checkout_button": "Ödeme Al / Fiş Kes",
      "search_placeholder": "Yapay zekaya sor (Örn: 50 TL altı atıştırmalıklar)...",
      "stock_label": "Stok",
      "empty_search_prompt": "Akıllı arama yapmak için yukarıya yazın",
      "back_to_pos": "Kasaya Geri Dön",
      "select_payment_method": "Ödeme Yöntemi",
      "payment_amount_desc": "Tahsil edilecek tutar: {{total}} {{currency}}",
      "payment_cash": "Nakit",
      "payment_card": "Kredi Kartı"
    }
  },
  en: {
    translation: {
      "app_name": "SmartMarket",
      "error_console_not_found": "Product not found",
      "error_product_not_found": "Attention: Product with barcode {{barcode}} is not in the system!",
      "error_console_search": "AI Search Error",
      "error_search": "An error occurred during the search.",
      "error_checkout": "An error occurred during checkout.",
      "toggle_view_tooltip": "Add New Product / Back to POS",
      "manual_barcode_disabled": "Disabled while adding a product...",
      "manual_barcode_placeholder": "Enter barcode manually...",
      "cart_empty": "Your cart is currently empty",
      "currency_symbol": "€",
      "total": "TOTAL",
      "checkout_button": "Charge / Print Receipt",
      "search_placeholder": "Ask AI (e.g. Snacks under €3)...",
      "stock_label": "Stock",
      "empty_search_prompt": "Type above to start smart search",
      "back_to_pos": "Back to POS",
      "select_payment_method": "Payment Method",
      "payment_amount_desc": "Amount to be charged: {{total}} {{currency}}",
      "payment_cash": "Cash",
      "payment_card": "Credit Card"
    }
  },
  hu: {
    translation: {
      "app_name": "SmartMarket",
      "error_console_not_found": "Termék nem található",
      "error_product_not_found": "Figyelem: A(z) {{barcode}} vonalkódú termék nincs a rendszerben!",
      "error_console_search": "MI keresési hiba",
      "error_search": "Hiba történt a keresés során.",
      "error_checkout": "Hiba történt a fizetés során.",
      "toggle_view_tooltip": "Új termék hozzáadása / Vissza a kasszához",
      "manual_barcode_disabled": "Termék hozzáadása közben letiltva...",
      "manual_barcode_placeholder": "Írja be a vonalkódot kézzel...",
      "cart_empty": "A kosár jelenleg üres",
      "currency_symbol": "Ft",
      "total": "ÖSSZESEN",
      "checkout_button": "Fizetés / Nyugta nyomtatása",
      "search_placeholder": "Kérdezze az MI-t (pl. 1000 Ft alatti snackek)...",
      "stock_label": "Készlet",
      "empty_search_prompt": "Gépeljen fent az okos kereséshez",
      "back_to_pos": "Vissza a kasszához",
      "select_payment_method": "Fizetési mód",
      "payment_amount_desc": "Fizetendő összeg: {{total}} {{currency}}",
      "payment_cash": "Készpénz",
      "payment_card": "Bankkártya"
    }
  }
};

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algılar
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Algılanamazsa İngilizceye düşer
    interpolation: { 
      escapeValue: false // React zaten XSS koruması sağladığı için false bırakıyoruz
    }
  });

export default i18n;