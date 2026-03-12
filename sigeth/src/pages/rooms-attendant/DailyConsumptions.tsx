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

  const exportCSV = () => {
    const headers = [
      "date",
      "order_num",
      "code_art",
      "item",
      "unity",
      "qty_s",
      "price_s",
      "montant",
      "credit",
    ];
    const rows = filtered.map((r) =>
      headers
        .map((h) => String((r as unknown as Record<string, unknown>)[h] ?? ""))
        .join(","),
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("dailyConsumptions")}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Printer size={16} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border border-green-600 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-50"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-3 flex-wrap">
        <input
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          placeholder={t("roomNumber")}
          className="border rounded-lg px-3 py-2 text-sm w-32"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          title={t("date")}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            setFilterRoom("");
            setFilterDate("");
          }}
          className="text-sm text-amber-600 hover:underline"
        >
          {t("clearFilters")}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-500">
            Ldcons.prt — {filtered.length} {t("records")}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("date"),
                t("orderNum"),
                t("codeArt"),
                t("designation"),
                t("unity"),
                t("qty"),
                t("price"),
                t("debit"),
                t("credit"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-3 font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{s.date}</td>
                <td className="px-3 py-2">{s.order_num}</td>
                <td className="px-3 py-2">{s.code_art}</td>
                <td className="px-3 py-2">{s.item}</td>
                <td className="px-3 py-2">{s.unity}</td>
                <td className="px-3 py-2">{s.qty_s}</td>
                <td className="px-3 py-2 text-right">
                  {s.price_s.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  {s.montant.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  {s.credit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
