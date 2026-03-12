import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ServicesList() {
  const { t } = useLang();
  const { banquetServices, events } = useHotelData();

  // Group by lot
  const grouped = events.map((e) => ({
    ...e,
    services: banquetServices.filter((b) => b.lot === e.lot),
  }));

  const handleExport = () => {
    const header = "Lot,Nature,Item,Unity,Qty,PUV,Amount";
    const rows = banquetServices.map(
      (b) =>
        `${b.lot},${b.nature},${b.item},${b.unity},${b.qty},${b.puv},${b.qty * b.puv}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lbanquet.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("servicesList")} — Lbanquet.prt
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
      {grouped.map((g) => (
        <div
          key={g.lot}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="bg-amber-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">
              {t("lot")} {g.lot} — {g.nature}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[t("item"), t("unity"), t("qty"), t("puv"), t("amount")].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-medium text-gray-600"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {g.services.map((s, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{s.item}</td>
                  <td className="px-4 py-3">{s.unity}</td>
                  <td className="px-4 py-3">{s.qty}</td>
                  <td className="px-4 py-3">{s.puv.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold">
                    {(s.qty * s.puv).toLocaleString()}
                  </td>
                </tr>
              ))}
              {g.services.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-gray-400 text-center"
                  >
                    {t("noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
