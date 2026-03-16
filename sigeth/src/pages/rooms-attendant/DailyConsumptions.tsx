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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("dailyConsumptions")}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
          >
            <Printer size={18} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium bg-green-50 hover:bg-green-100 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("roomNumber")}
            </label>
            <input
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              placeholder={t("roomNumber")}
              title={t("roomNumber")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("date")}
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title={t("date")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterRoom("");
                setFilterDate("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
            >
              {t("clearFilters")}
            </button>
          </div>
        </div>
      </div>
      <div
        id="report-output"
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Daily Consumptions by Guest{" "}
            <span className="font-normal text-sm text-gray-500 ml-2">
              {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </span>
          </h2>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
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
                className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {s.date}
                </td>
                <td className="px-4 py-3 text-gray-700">{s.order_num}</td>
                <td className="px-4 py-3 text-gray-700">{s.code_art}</td>
                <td className="px-4 py-3 text-gray-700">{s.item}</td>
                <td className="px-4 py-3 text-gray-700">{s.unity}</td>
                <td className="px-4 py-3 text-gray-700">{s.qty_s}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {s.price_s.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {s.montant.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {s.credit.toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-gray-400 font-medium"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-end items-center gap-4 px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <span className="font-semibold text-gray-700">Totaux</span>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-600 mb-1">Debit</span>
              <span className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg min-w-[120px] text-right font-bold text-gray-900">
                {totalDebit.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-600 mb-1">Credit</span>
              <span className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg min-w-[120px] text-right font-bold text-gray-900">
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
