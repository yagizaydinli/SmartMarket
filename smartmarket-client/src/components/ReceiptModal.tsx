import { Printer, X } from 'lucide-react';
import { useStore, type Product } from '../store/useStore';
import { BarcodeImage } from './BarcodeImage';

interface ReceiptItem extends Product {
  quantity: number;
}

interface ReceiptModalProps {
  items: ReceiptItem[];
  total: number;
  onClose: () => void;
}

export const ReceiptModal = ({ items, total, onClose }: ReceiptModalProps) => {
  const handlePrint = () => {
    window.print(); // Tarayıcının yazdırma diyaloğunu açar
  };

  // Basit KDV hesaplaması (Sende sepette ürün bazlı varsa onu da kullanabilirsin)
  const taxAmount = total * 0.18; 
  const subTotal = total - taxAmount;

  const date = new Date().toLocaleDateString('tr-TR');
  const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const receiptNo = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const { settings } = useStore(); // Ayarları buradan çek

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0">
      
      {/* Modal Kutusu */}
      <div className="bg-slate-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:max-h-none print:rounded-none">

        {/* Üst Bar (Yazdırılırken Gizlenir) */}
        <div className="flex justify-between items-center p-5 bg-white border-b border-slate-200 print:hidden">
          <h3 className="font-bold text-slate-800 text-lg">Satış Fişi</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- YAZDIRILACAK ALAN BAŞLANGICI --- */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 flex justify-center bg-slate-100 print:bg-white print:p-0">
          
          {/* Gerçek Fiş Kağıdı Tasarımı */}
          <div 
            id="printable-receipt" 
            className="bg-white p-6 shadow-sm w-full max-w-[340px] text-slate-800 font-mono text-sm leading-tight print:shadow-none"
          >
            {/* Fiş Başlığı */}
             <div className="text-center mb-6">
                <h2 className="font-bold text-xl">{settings.companyName}</h2>
                <p className="text-xs text-slate-500">{settings.address}</p>
                <p className="text-xs text-slate-500">{settings.phone}</p>
                <p className="text-xs font-mono mt-2">MERSIS NO: {settings.mersisNo}</p>
             </div>

            <div className="border-b-2 border-dashed border-slate-300 mb-4 pb-4 text-xs flex justify-between">
              <div>
                <p>TARİH: {date}</p>
                <p>SAAT : {time}</p>
              </div>
              <div className="text-right">
                <p>FİŞ NO : {receiptNo}</p>
                <p>KASİYER: YAGIZ</p>
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="mb-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs">
                    <th className="pb-2 font-semibold">ÜRÜN</th>
                    <th className="pb-2 font-semibold text-right">MİK</th>
                    <th className="pb-2 font-semibold text-right">TUTAR</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 pr-2">
                        <div className="line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-slate-500">%18 KDV</div>
                      </td>
                      <td className="py-2 text-right align-top">{item.quantity}</td>
                      <td className="py-2 text-right align-top">{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Toplamlar */}
            <div className="border-t-2 border-dashed border-slate-300 pt-3 mb-8 text-sm">
              <div className="flex justify-between mb-1 text-slate-600">
                <span>ARA TOPLAM:</span>
                <span>{subTotal.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between mb-1 text-slate-600">
                <span>TOPLAM KDV:</span>
                <span>{taxAmount.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-slate-800">
                <span>TOPLAM:</span>
                <span>{total.toFixed(2)} ₺</span>
              </div>
            </div>

            {/* Fiş Altı (Footer) */}
            <div className="text-center text-xs flex flex-col items-center">
              <p className="font-bold mb-1">YİNE BEKLERİZ</p>
              <p className="text-slate-500 text-[10px] mb-4">Mali değeri yoktur, bilgi içindir.</p>
              
              {/* Barkod Görseli (İade işlemleri için) */}
              <div className="grayscale opacity-80 scale-90">
                 <BarcodeImage barcode={receiptNo.padStart(13, '0')} />
                 <p className="mt-1 tracking-widest">{receiptNo}</p>
              </div>
            </div>
          </div>
        </div>
        {/* --- YAZDIRILACAK ALAN BİTİŞİ --- */}

        {/* Aksiyon Butonları (Yazdırılırken Gizlenir) */}
        <div className="p-5 bg-white border-t border-slate-200 print:hidden flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Yeni Satış
          </button>
          <button 
            onClick={handlePrint}
            className="flex-[2] px-4 py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98]"
          >
            <Printer size={20} />
            Fişi Yazdır
          </button>
        </div>

      </div>
    </div>
  );
};