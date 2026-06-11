import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, Banknote, CreditCard, Eye, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

export const SalesHistoryView = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const [sales, setSales] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchSales = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/pos/sales?page=${page}&pageSize=8`);
      setSales(response.data.items);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error("Satış geçmişi yüklenemedi", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSales(1); }, []);

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border rounded-2xl text-slate-500 hover:text-blue-600 shadow-sm transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('history_title', 'Satış Geçmişi')}</h2>
            <p className="text-slate-400 font-medium">{t('history_desc', 'Son yapılan işlemler ve kasa dökümü')}</p>
          </div>
        </div>
      </div>

      {/* Tablo Tasarımı */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('table_date', 'Tarih / Saat')}</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t('table_method', 'Ödeme')}</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t('total')}</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr><td colSpan={5} className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div></td></tr>
            ) : sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-mono text-slate-400 text-sm">#{sale.id}</td>
                <td className="p-6 italic text-slate-600 font-medium">
                   <div className="flex items-center gap-2">
                     <Calendar size={14} />
                     {new Date(sale.created_at).toLocaleString('tr-TR')}
                   </div>
                </td>
                <td className="p-6">
                  {sale.payment_method === 'cash' ? (
                    <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                      <Banknote size={14} /> {t('payment_cash')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                      <CreditCard size={14} /> {t('payment_card')}
                    </span>
                  )}
                </td>
                <td className="p-6 text-right font-black text-slate-900 text-lg">
                  {sale.total_amount.toFixed(2)} ₺
                </td>
                <td className="p-6 text-center">
                   <button className="p-2 text-slate-300 hover:text-blue-600 transition-all hover:scale-110">
                      <Eye size={20} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Kontrolleri */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-400">
            Toplam {pagination.totalPages} sayfa içerisinden {pagination.currentPage}. sayfa
          </span>
          <div className="flex gap-2">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => fetchSales(pagination.currentPage - 1)}
              className="p-2 bg-white border rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchSales(pagination.currentPage + 1)}
              className="p-2 bg-white border rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
