import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function DailyConsumptions() {
  const { t } = useLang();
  const { sales } = useHotelData();
  const [filterRoom, setFilterRoom] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filtered = sales.filter(
    (s) =>
      (!filterRoom || s.room_num === filterRoom) &&
      (!filterDate || s.date === filterDate),
  );

  const totalDebit = filtered.reduce((sum, s) => sum + s.montant, 0);
  const totalCredit = filtered.reduce((sum, s) => sum + s.credit, 0);

  const exportCSV = () => {
    const headers = [
      "date",
      "order_num",
      "refep",
      "designation",
      "unity",
      "qty",
      "price",
      "debit",
      "credit",
    ];
    const rows = filtered.map((r) =>
      [
        r.date,
        r.order_num,
        r.code_art,
        r.item,
        r.unity,
        r.qty_s,
        r.price_s,
        r.montant,
        r.credit,
      ].join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Ldcons.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-hotel-border">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("dailyConsumptions")}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-200"
          >
            <Printer size={18} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border-2 border-hotel-border text-hotel-text-primary px-6 py-3 rounded flex items-center gap-2 text-sm font-medium bg-hotel-cream hover:bg-hotel-cream hover:shadow-lg transition-colors duration-200"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded border border-hotel-border p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {t("roomNumber")}
            </label>
            <input
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              placeholder={t("roomNumber")}
              title={t("roomNumber")}
              className="w-full border border-hotel-border rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {t("date")}
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title={t("date")}
              className="w-full border border-hotel-border rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterRoom("");
                setFilterDate("");
              }}
              className="w-full bg-hotel-cream hover:bg-hotel-paper text-hotel-text-primary px-4 py-2 rounded text-sm font-medium transition-colors duration-150"
            >
              {t("clearFilters")}
            </button>
          </div>
        </div>
      </div>
      <div
        id="report-output"
        className="bg-white rounded border border-hotel-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-hotel-border bg-white border border-hotel-border rounded p-4">
          <h2 className="text-base font-bold bg-hotel-gold bg-clip-text text-transparent">
            Daily Consumptions by Guest{" "}
            <span className="font-normal text-sm text-hotel-text-secondary ml-2">
              {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </span>
          </h2>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-hotel-gold to-hotel-gold-dark">
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Order Num
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Refep
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Designation
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Unity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white">
                Debit
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white">
                Credit
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={i}
                className="border-b border-hotel-border hover:bg-hotel-cream transition-colors duration-150"
              >
                <td className="px-4 py-3 font-medium text-hotel-text-primary">
                  {s.date}
                </td>
                <td className="px-4 py-3 text-hotel-text-primary">{s.order_num}</td>
                <td className="px-4 py-3 text-hotel-text-primary">{s.code_art}</td>
                <td className="px-4 py-3 text-hotel-text-primary">{s.item}</td>
                <td className="px-4 py-3 text-hotel-text-primary">{s.unity}</td>
                <td className="px-4 py-3 text-hotel-text-primary">{s.qty_s}</td>
                <td className="px-4 py-3 text-right text-hotel-text-primary">
                  {s.price_s.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-hotel-text-primary">
                  {s.montant.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-hotel-text-primary">
                  {s.credit.toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-hotel-text-secondary font-medium"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-hotel-border bg-gradient-to-r from-hotel-paper to-hotel-cream">
          <span className="font-semibold text-hotel-text-primary">Totaux</span>
          <div className="flex gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-hotel-text-secondary mb-1">Debit</span>
              <span className="bg-hotel-cream border border-hotel-border px-4 py-2 rounded min-w-[120px] text-right font-bold text-hotel-text-primary">
                {totalDebit.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-hotel-text-secondary mb-1">Credit</span>
              <span className="bg-hotel-cream border border-hotel-border px-4 py-2 rounded min-w-[120px] text-right font-bold text-hotel-text-primary">
                {totalCredit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-output, #report-output * { visibility: visible !important; }
          #report-output { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}


