import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { History, ShoppingBag, CreditCard, Sparkles, Trash2, PackageOpen, PlusCircle, Banknote, Settings, BarChart3 } from 'lucide-react';
import { BarcodeScanner } from './components/BarcodeScanner';
import { NewProductEntry } from './components/NewProductEntry';
import { SettingsView } from './components/SettingsView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { useStore } from './store/useStore';
import type { Product } from './store/useStore';
import axios from 'axios';
import { ReceiptModal } from './components/ReceiptModal';
import { ReportsView } from './components/ReportsView'; 
import { API_URL } from './config/api';

function App() {
  const { t } = useTranslation();
  const { cart, addToCart, removeFromCart, cartTotal, clearCart, updateSettings } = useStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResults, setAiResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{ items: any[], total: number, paymentMethod: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentView, setCurrentView] = useState<'checkout' | 'new-product' | 'settings' | 'history' | 'reports'>('checkout');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`);
        if (response.data) updateSettings(response.data);
      } catch (error) {
        console.error("Ayarlar yüklenemedi", error);
      }
    };
    fetchSettings();
  }, [updateSettings]);

  const handleBarcodeScan = async (barcode: string) => {
    if (currentView !== 'checkout') return;
    try {
      const response = await axios.get(`${API_URL}/pos/product/${barcode}`);
      if (response.data) addToCart(response.data);
    } catch (error) {
      alert(t('error_product_not_found', { barcode }));
    }
  };

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/ai/search?query=${searchQuery}`);
      setAiResults(response.data.results);
    } catch (error) {
      alert(t('error_search'));
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (method: 'cash' | 'card') => {
    setShowPaymentModal(false);
    setIsLoading(true);
    try {
      const payload = {
        totalAmount: cartTotal(),
        paymentMethod: method,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
      };
      await axios.post(`${API_URL}/pos/checkout`, payload);
      setReceiptData({ items: [...cart], total: cartTotal(), paymentMethod: method });
      setShowReceipt(true);
      clearCart();
    } catch (error) {
      alert(t('error_checkout'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-800 flex overflow-hidden font-sans selection:bg-yellow-100 selection:text-yellow-900">
      {/* SOL PANEL */}
      <div className="w-[35%] min-w-[400px] bg-white border-r border-slate-200 flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-800 p-4 rounded-xl text-white"><ShoppingBag size={24} /></div>
            <h5 className="text-2xl font-extrabold">{t('app_name')}</h5>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentView(currentView === 'settings' ? 'checkout' : 'settings')} className="p-2.5 text-slate-400 hover:text-blue-600"><Settings size={22} /></button>
            <button onClick={() => setCurrentView(currentView === 'new-product' ? 'checkout' : 'new-product')} className="p-2.5 text-slate-400 hover:text-blue-600"><PlusCircle size={22} /></button>
            <button onClick={() => setCurrentView(currentView === 'history' ? 'checkout' : 'history')} className={`p-2.5 transition-all ${currentView === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><History size={22} /></button>
            <button onClick={() => setCurrentView('reports')} className="p-2 text-slate-400 hover:text-blue-600"><BarChart3 size={20} /></button>
          </div>
        </div>

        <div className="px-8 pt-6">
          <BarcodeScanner onScan={handleBarcodeScan} />
          <input value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { handleBarcodeScan(manualBarcode); setManualBarcode(""); } }} disabled={currentView !== 'checkout'} placeholder={t('manual_barcode_placeholder')} className="w-full p-3 mt-2 border rounded-xl" />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4">
          {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-400"><PackageOpen size={48} /><p>{t('cart_empty')}</p></div> : 
          <ul className="space-y-4">{cart.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border">
              <div><span className="font-bold">{item.name}</span><p className="text-xs text-slate-500">{item.price.toFixed(2)} {t('currency_symbol')}</p></div>
              <div className="flex items-center gap-4"><span className="font-black">{(item.price * item.quantity).toFixed(2)} {t('currency_symbol')}</span><button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></div>
            </li>
          ))}</ul>}
        </div>

        <div className="p-8 border-t border-slate-100">
          <button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0 || currentView !== 'checkout' || isLoading} className="w-full bg-gradient-to-r from-yellow-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl">
            {isLoading ? "..." : t('checkout_button')}
          </button>
        </div>
      </div>

      {/* SAĞ PANEL */}
      <div className="w-[65%] flex-1 bg-slate-50 p-12 overflow-y-auto relative">
        {currentView === 'checkout' ? (
          <>
            <div className="relative mb-8">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()} className="w-full pl-16 pr-8 py-5 rounded-[2rem] border shadow-sm" placeholder={t('search_placeholder')} />
              <Sparkles className="absolute left-6 top-5 text-yellow-500" />
            </div>
            <div className="grid grid-cols-4 gap-6">
              {aiResults.map(p => (
                <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-6 rounded-3xl border shadow-sm cursor-pointer hover:shadow-lg transition-all relative">
                   <div className="absolute top-4 left-4 bg-slate-100 text-[10px] px-2 rounded font-mono font-bold text-slate-400">{p.barcode}</div>
                   <div className="h-6"></div>
                   <h3 className="font-bold text-slate-800">{p.name}</h3>
                   <div className="flex justify-between items-end mt-4"><span className="text-xs text-slate-500">{t('stock_label')}: {p.stock}</span><span className="text-xl font-black">{p.price.toFixed(2)} {t('currency_symbol')}</span></div>
                </div>
              ))}
            </div>
          </>
        ) : currentView === 'new-product' ? (
          <NewProductEntry onProductAdded={() => setCurrentView('checkout')} onClose={() => setCurrentView('checkout')} />
        ) : 
        currentView === 'history' ? (
              <SalesHistoryView onBack={() => setCurrentView('checkout')} />
            ) : currentView === 'settings' ? (
              <SettingsView onBack={() => setCurrentView('checkout')} />
            ) : currentView === 'reports' ? (
              <ReportsView  />
            )
        :
        (
          <SettingsView onBack={() => setCurrentView('checkout')} />
        )}
      </div>

      {showReceipt && receiptData && <ReceiptModal items={receiptData.items} total={receiptData.total} onClose={() => setShowReceipt(false)} />}
      
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center">
            <h4 className="text-xl font-bold mb-6">{t('select_payment_method')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => processPayment('cash')} className="p-6 bg-emerald-50 rounded-2xl flex flex-col items-center"><Banknote className="text-emerald-500 mb-2" />{t('payment_cash')}</button>
              <button onClick={() => processPayment('card')} className="p-6 bg-blue-50 rounded-2xl flex flex-col items-center"><CreditCard className="text-blue-500 mb-2" />{t('payment_card')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
