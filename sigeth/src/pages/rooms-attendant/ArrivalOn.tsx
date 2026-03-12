import { useState, useMemo } from "react";
import { Printer, FileSpreadsheet, Filter } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

const today = () => new Date().toISOString().slice(0, 10);

export default function ArrivalOn() {
  const { t } = useLang();
  const { reservations } = useHotelData();
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("0");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState("");
  const [guestSearch, setGuestSearch] = useState("");

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== Number(statusFilter))
        return false;
      if (dateFrom && r.arrival_date < dateFrom) return false;
      if (dateTo && r.arrival_date > dateTo) return false;
      if (
        guestSearch &&
        !r.guest_name.toLowerCase().includes(guestSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [reservations, statusFilter, dateFrom, dateTo, guestSearch]);

  const exportCSV = () => {
    const headers = [
      "room_num",
      "guest_name",
      "phone",
      "email",
      "arrival_date",
      "depart_date",
      "adulte",
      "children",
      "puv",
      "qty",
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
    a.download = "Larrival.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t("arrivalOn")}</h1>
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
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500">
          <Filter size={14} /> {t("filters")}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "0" | "1")
            }
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="0">{t("statusOpen")}</option>
            <option value="1">{t("statusClosed")}</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            title={t("dateFrom")}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            title={t("dateTo")}
          />
          <input
            value={guestSearch}
            onChange={(e) => setGuestSearch(e.target.value)}
            placeholder={t("guestName")}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[150px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-500">
            Larrival.prt — {t("arrivalOnDesc")} ({filtered.length})
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("roomNumber"),
                t("guestName"),
                t("phone"),
                t("email"),
                t("arrivalDate"),
                t("departDate"),
                t("adults"),
                t("children"),
                t("pricePerNight"),
                t("nights"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.room_num}</td>
                <td className="px-4 py-3">{r.guest_name}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.arrival_date}</td>
                <td className="px-4 py-3">{r.depart_date}</td>
                <td className="px-4 py-3">{r.adulte}</td>
                <td className="px-4 py-3">{r.children}</td>
                <td className="px-4 py-3">{r.puv.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {(() => {
                    const a = new Date(r.arrival_date);
                    const d = new Date(r.depart_date);
                    return Math.max(
                      Math.round((d.getTime() - a.getTime()) / 86400000),
                      0,
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
