import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ListStaff() {
  const { t } = useLang();
  const { staff } = useHotelData();

  const sorted = [...staff].sort((a, b) =>
    a.last_name.localeCompare(b.last_name),
  );

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("listStaff")} — LHstaff.prt
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
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("number"),
                t("firstName"),
                t("lastName"),
                t("affectation"),
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
            {sorted.map((s) => (
              <tr key={s.number} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{s.number}</td>
                <td className="px-4 py-3">{s.first_name}</td>
                <td className="px-4 py-3">{s.last_name}</td>
                <td className="px-4 py-3">{s.poste}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
