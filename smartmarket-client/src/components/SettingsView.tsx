import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Phone, Hash, Coins, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { API_URL } from '../config/api';

export const SettingsView = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form verilerini yerel state'de tutalım (Kaydete basınca asıl store'a ve backend'e gitsin)
  const [localSettings, setLocalSettings] = useState(settings);

  // Backend'den en güncel ayarları çek (Uygulama tazelemek için)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`);
        if (response.data) {
          setLocalSettings(response.data);
          updateSettings(response.data);
        }
      } catch (error) {
        console.error("Ayarlar çekilemedi", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Backend'e PostgreSQL'e kaydet (Dapper Endpoint)
      await axios.put(`${API_URL}/settings`, localSettings);
      
      // 2. Global Store'u güncelle (Zustand)
      updateSettings(localSettings);
      
      // 3. Başarı mesajı göster
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert(t('error_save_settings'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('settings_title', 'Mağaza Ayarları')}</h2>
            <p className="text-slate-400 font-medium">{t('settings_desc', 'Fiş ve fatura bilgilerini buradan düzenleyin')}</p>
          </div>
        </div>

        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl animate-bounce">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">{t('settings_saved', 'Başarıyla Kaydedildi')}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Şirket Adı */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            <Building2 size={14} /> {t('settings_company_name', 'Şirket Adı')}
          </label>
          <input
            type="text"
            value={localSettings.companyName}
            onChange={(e) => setLocalSettings({...localSettings, companyName: e.target.value})}
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
            placeholder="SMARTMARKET LTD."
          />
        </div>

        {/* Telefon */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            <Phone size={14} /> {t('settings_phone', 'Telefon Numarası')}
          </label>
          <input
            type="text"
            value={localSettings.phone}
            onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
            placeholder="+36 1 234 5678"
          />
        </div>

        {/* Adres (Geniş Alan) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 md:col-span-2">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            <MapPin size={14} /> {t('settings_address', 'Mağaza Adresi')}
          </label>
          <textarea
            rows={3}
            value={localSettings.address}
            onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})}
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold resize-none"
            placeholder="Teknoloji Cad. Bilişim Sok. No:42, Budapeşte"
          />
        </div>

        {/* Mersis No */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            <Hash size={14} /> {t('settings_mersis', 'Mersis / Vergi No')}
          </label>
          <input
            type="text"
            value={localSettings.mersisNo}
            onChange={(e) => setLocalSettings({...localSettings, mersisNo: e.target.value})}
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
            placeholder="012345678900001"
          />
        </div>

        {/* Para Birimi */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            <Coins size={14} /> {t('settings_currency', 'Para Birimi')}
          </label>
          <select
            value={localSettings.currency}
            onChange={(e) => setLocalSettings({...localSettings, currency: e.target.value})}
            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold cursor-pointer appearance-none"
          >
            <option value="₺">₺ (Türk Lirası)</option>
            <option value="€">€ (Euro)</option>
            <option value="$">$ (Dolar)</option>
            <option value="Ft">Ft (Macar Forinti)</option>
          </select>
        </div>

        {/* Kaydet Butonu */}
        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={24} />
                {t('settings_save_button', 'Ayarları Veritabanına Kaydet')}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
