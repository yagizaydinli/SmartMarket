import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface Props {
  barcode: string;
}

export const BarcodeImage = ({ barcode }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false, // Sayısal değeri altında gösterme (kendi tasarımımızda göstereceğiz)
        margin: 0,
        lineColor: "#1e293b" // slate-800 rengi ile uyumlu
      });
    }
  }, [barcode]);

  return <svg ref={svgRef} className="h-10 w-full max-w-[150px]"></svg>;
};