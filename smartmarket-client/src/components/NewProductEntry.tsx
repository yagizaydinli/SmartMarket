import { useState } from 'react';
import { PackagePlus, Barcode, Percent, Coins, Layers, Tag } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';
import axios from 'axios';
import { API_URL } from '../config/api';

interface NewProductEntryProps {
  onProductAdded?: () => void; // Ürün başarıyla eklenince ana sayfayı tazelemek için
  onClose?: () => void;
}

export const NewProductEntry = ({ onProductAdded, onClose }: NewProductEntryProps) => {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    price: '',
    stock: '',
    taxRate: '20' // Varsayılan KDV oranı %20
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Görünmez barkod tarayıcıdan gelen veriyi yakala ve inputa yaz
  const handleBarcodeScan = (scannedBarcode: string) => {
    setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barcode || !formData.name || !formData.price || !formData.stock) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        barcode: formData.barcode,
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        taxRate: parseInt(formData.taxRate, 10)
      };

      // Arka yüze (Backend) ürünü post et
      await axios.post(`${API_URL}/products`, payload);
      
      alert("Ürün başarıyla sisteme kaydedildi!");
      
      // Formu temizle
      setFormData({
        barcode: '',
        name: '',
        price: '',
        stock: '',
        taxRate: '20'
      });

      if (onProductAdded) onProductAdded();
    } catch (error) {
      console.error("Ürün kaydedilirken hata oluştu:", error);
      alert("Ürün kaydedilemedi. Barkod sistemde zaten mevcut olabilir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl relative z-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-3.5 rounded-2xl text-white shadow-lg shadow-amber-100">
          <PackagePlus size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Yeni Ürün Tanımla</h2>
          <p className="text-sm font-medium text-slate-400 mt-0.5">Sisteme yeni stok ve fiyat bilgisi girin</p>
        </div>
      </div>

      {/* Arka Planda Çalışan Tarayıcı Entegrasyonu */}
      <div className="mb-6 p-2 bg-slate-50 rounded-2xl border border-slate-100">
        <BarcodeScanner onScan={handleBarcodeScan} />
        <p className="text-center text-xs font-semibold text-blue-500 mt-2">
          * Butona basıp kamerayı açtıktan sonra ürünü okutursanız barkod alanı otomatik dolar.
        </p>
      </div>

      {/* Form Yapısı */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Barkod Girişi */}
        <div className="relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">Barkod Numarası</label>
          <div className="relative">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="Barkodu okutun veya manuel girin..."
              className="w-full bg-slate-50 pl-12 pr-4 py-3.5 font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        {/* Ürün Adı */}
        <div className="relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">Ürün Adı</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Örn: Ülker Çikolatalı Gofret 35g"
              className="w-full bg-slate-50 pl-12 pr-4 py-3.5 font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Fiyat ve Stok Yan Yana */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Satış Fiyatı */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">Satış Fiyatı (₺)</label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-50 pl-12 pr-4 py-3.5 font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Stok Miktarı */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">Başlangıç Stoğu</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-slate-50 pl-12 pr-4 py-3.5 font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

        </div>

        {/* KDV Vergi Bilgisi */}
        <div className="relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">KDV Oranı</label>
          <div className="relative">
            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              className="w-full bg-slate-50 pl-12 pr-4 py-3.5 font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="1">%1 (Temel Gıda vb.)</option>
              <option value="10">%10 (Gıda, Tekstil vb.)</option>
              <option value="20">%20 (Genel Ticari Ürünler)</option>
            </select>
            {/* Custom Select Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
            >
              İptal Et
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 disabled:from-slate-200 disabled:to-slate-200 text-white font-bold py-4 rounded-2xl shadow-xl shadow-amber-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Ürünü Veritabanına Kaydet"
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
