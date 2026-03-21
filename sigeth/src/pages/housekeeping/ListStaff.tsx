import { useState } from "react";
import { Printer, FileSpreadsheet, Search, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ListStaff() {
  const { t } = useLang();
  const { staff } = useHotelData();
  const [searchTerm, setSearchTerm] = useState("");

  const sorted = [...staff].sort((a, b) =>
    a.last_name.localeCompare(b.last_name),
  );

  // Live search filter
  const filteredStaff = sorted.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.number.toString().includes(search) ||
      s.first_name.toLowerCase().includes(search) ||
      s.last_name.toLowerCase().includes(search) ||
      s.poste.toLowerCase().includes(search)
    );
  });

  const handleExport = () => {
    const header = "Number,First_name,Last_name,Affectation";
    const rows = sorted.map(
      (s) => `${s.number},${s.first_name},${s.last_name},${s.poste}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "LHstaff.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Printer size={14} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <FileSpreadsheet size={14} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded overflow-hidden">
        <div className="px-4 py-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hotel-text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} staff by name, number, or position...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hotel-text-secondary hover:text-hotel-text-secondary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              {[
                t("number"),
                t("firstName"),
                t("lastName"),
                t("affectation"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-2 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((s) => (
              <tr
                key={s.number}
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary">
                  {s.number}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{s.first_name}</td>
                <td className="py-2 px-2 text-hotel-text-primary">{s.last_name}</td>
                <td className="py-2 px-2 text-hotel-text-primary">{s.poste}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="px-4 py-8 text-center text-hotel-text-secondary">
            <p className="text-sm">
              {searchTerm
                ? `No staff members match "${searchTerm}"`
                : "No staff members found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
