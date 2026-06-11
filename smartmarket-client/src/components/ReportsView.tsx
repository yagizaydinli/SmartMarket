import { useState } from 'react';
import { Sparkles, Send, Loader2, Package } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const QUICK_REPORTS = [
  { label: "Kritik Stok Uyarısı", query: "SELECT name, stock FROM products WHERE stock < 10" },
  { label: "Günlük Ciro", query: "SELECT SUM(total_amount) as ciro FROM receipts WHERE created_at >= CURRENT_DATE" },
  { label: "Çok Satanlar", query: "SELECT p.name, SUM(ri.quantity) as toplam FROM receipt_items ri JOIN products p ON ri.product_id = p.id GROUP BY p.name ORDER BY toplam DESC LIMIT 5" }
];

export const ReportsView = () => {
  const [query, setQuery] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const executeQuery = async (sql: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ai/report`, { prompt: sql });
      if (res.data?.data) {
        setReportData(res.data.data);
      }
    } catch (error) {
      alert("Rapor alınamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-black text-slate-800">Akıllı Raporlar</h2>

      {/* Hazır Butonlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {QUICK_REPORTS.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => executeQuery(item.query)}
            className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all font-bold text-sm text-slate-600"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* AI Sorgu Kutusu - Çok daha sade */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <Sparkles className="ml-4 text-yellow-500" size={20} />
        <input 
          className="flex-1 p-3 outline-none font-medium text-slate-700"
          placeholder="Örneğin: 'Hangi ürünler en az satıldı?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && executeQuery(query)}
        />
        <button onClick={() => executeQuery(query)} className="bg-blue-600 text-white p-3 rounded-xl">
          {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* Tablo Bölümü */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {reportData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white-50">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reportData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-6 py-3 text-sm font-bold text-slate-600">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p>Raporları görüntülemek için bir buton seçin veya soru sorun.</p>
          </div>
        )}
      </div>
    </div>
  );
};
