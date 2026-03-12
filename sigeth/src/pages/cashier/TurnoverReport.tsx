import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function TurnoverReport() {
  const { t } = useLang();
  const { sales, paymentModes } = useHotelData();

  const totals = paymentModes.map((pm) => ({
    ...pm,
    total: sales
      .filter((s) => s.mode_payt === pm.code)
      .reduce((sum, s) => sum + s.montant, 0),
  }));
  const grandTotal = totals.reduce((s, t) => s + t.total, 0);

  const handleExport = () => {
    const header = "Code,Payment_Mode,Total";
    const rows = totals.map((t) => `${t.code},${t.label},${t.total}`);
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lturnover.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("turnoverReport")} — Lturnover.prt
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-700"
          >
            <Printer size={16} />
            {t("print")}
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700"
          >
            <FileSpreadsheet size={16} />
            {t("excel")}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-amber-50">
          <h3 className="font-semibold text-sm">{t("chiffreAffaires")}</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                {t("code")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                {t("paymentMode")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                {t("total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.map((pm) => (
              <tr key={pm.code} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{pm.code}</td>
                <td className="px-4 py-3">{pm.label}</td>
                <td className="px-4 py-3 font-semibold">
                  {pm.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-amber-50 border-t">
            <tr>
              <td colSpan={2} className="px-4 py-3 font-semibold text-right">
                {t("grandTotal")}
              </td>
              <td className="px-4 py-3 font-bold text-lg">
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
