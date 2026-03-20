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
    <div className="min-h-screen bg-gradient-to-br from-hotel-paper to-hotel-cream p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("listStaff")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">Complete staff directory</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
        >
          <Printer size={16} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
        >
          <FileSpreadsheet size={16} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded border border-hotel-border overflow-hidden">
        <div className="px-6 py-4 border-b border-hotel-border">
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
              className="w-full pl-10 pr-10 py-2.5 border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded text-sm font-medium transition-colors"
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
          <thead className="bg-white border-b-2 border-hotel-border">
            <tr>
              {[
                t("number"),
                t("firstName"),
                t("lastName"),
                t("affectation"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 font-bold text-hotel-text-primary"
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
                className="border-b hover:bg-hotel-cream/50 transition-colors duration-150"
              >
                <td className="px-6 py-3 font-semibold text-hotel-gold">
                  {s.number}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{s.first_name}</td>
                <td className="px-6 py-3 text-hotel-text-primary">{s.last_name}</td>
                <td className="px-6 py-3 text-hotel-text-primary">{s.poste}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="px-6 py-12 text-center text-hotel-text-secondary">
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



