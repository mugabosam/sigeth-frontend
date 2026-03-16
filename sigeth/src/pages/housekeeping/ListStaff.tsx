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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("listStaff")}
        </h1>
        <p className="text-sm text-gray-600">Complete staff directory</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
        >
          <Printer size={16} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
        >
          <FileSpreadsheet size={16} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} staff by name, number, or position...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg text-sm font-medium transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-emerald-200">
            <tr>
              {[
                t("number"),
                t("firstName"),
                t("lastName"),
                t("affectation"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 font-bold text-gray-700"
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
                className="border-b hover:bg-emerald-50/50 transition-colors duration-150"
              >
                <td className="px-6 py-3 font-semibold text-emerald-600">
                  {s.number}
                </td>
                <td className="px-6 py-3 text-gray-700">{s.first_name}</td>
                <td className="px-6 py-3 text-gray-700">{s.last_name}</td>
                <td className="px-6 py-3 text-gray-700">{s.poste}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
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
