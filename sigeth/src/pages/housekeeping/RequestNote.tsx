import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { REQUIS } from "../../types";

export default function RequestNote({
  posteDefault = "Housekeeping",
}: {
  posteDefault?: string;
}) {
  const { t } = useLang();
  const { requisitions, setRequisitions } = useHotelData();
  const [selected, setSelected] = useState<REQUIS | null>(null);
  const [isNew, setIsNew] = useState(false);

  const blank: REQUIS = {
    code_p: "",
    date_d: new Date().toISOString().split("T")[0],
    poste: posteDefault,
    libelle: "",
    qty: 0,
    credit_1: 0,
    credit_2: 0,
    date_r: "",
    statut: "Pending",
  };

  const filtered = requisitions.filter((r) => r.poste === posteDefault);

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setRequisitions((prev) => [...prev, selected]);
    else
      setRequisitions((prev) =>
        prev.map((r) =>
          r.code_p === selected.code_p && r.date_d === selected.date_d
            ? selected
            : r,
        ),
      );
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    setRequisitions((prev) =>
      prev.filter(
        (r) => !(r.code_p === selected.code_p && r.date_d === selected.date_d),
      ),
    );
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("requestNote")} — {posteDefault}
        </h1>
        <button
          onClick={() => {
            setSelected({ ...blank });
            setIsNew(true);
          }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
        >
          <Plus size={16} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {isNew ? t("newRequest") : t("editRequest")} — Request_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("codeP")}
              </label>
              <input
                type="text"
                value={selected.code_p}
                onChange={(e) =>
                  setSelected({ ...selected, code_p: e.target.value })
                }
                title={t("codeP")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("dateD")}
              </label>
              <input
                type="date"
                value={selected.date_d}
                onChange={(e) =>
                  setSelected({ ...selected, date_d: e.target.value })
                }
                title={t("dateD")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("poste")}
              </label>
              <input
                type="text"
                value={selected.poste}
                readOnly
                title={t("poste")}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("libelle")}
              </label>
              <input
                type="text"
                value={selected.libelle}
                onChange={(e) =>
                  setSelected({ ...selected, libelle: e.target.value })
                }
                title={t("libelle")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("qty")}
              </label>
              <input
                type="number"
                value={selected.qty}
                onChange={(e) =>
                  setSelected({ ...selected, qty: Number(e.target.value) })
                }
                title={t("qty")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("credit1")}
              </label>
              <input
                type="number"
                value={selected.credit_1}
                onChange={(e) =>
                  setSelected({ ...selected, credit_1: Number(e.target.value) })
                }
                title={t("credit1")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("credit2")}
              </label>
              <input
                type="number"
                value={selected.credit_2}
                onChange={(e) =>
                  setSelected({ ...selected, credit_2: Number(e.target.value) })
                }
                title={t("credit2")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("dateR")}
              </label>
              <input
                type="date"
                value={selected.date_r}
                onChange={(e) =>
                  setSelected({ ...selected, date_r: e.target.value })
                }
                title={t("dateR")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("statut")}
              </label>
              <select
                value={selected.statut}
                onChange={(e) =>
                  setSelected({ ...selected, statut: e.target.value })
                }
                title={t("statut")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="Pending">{t("pending")}</option>
                <option value="Approved">{t("approved")}</option>
                <option value="Rejected">{t("rejected")}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-red-600"
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border px-6 py-2 rounded-lg text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("codeP"),
                t("dateD"),
                t("libelle"),
                t("qty"),
                t("credit1"),
                t("credit2"),
                t("dateR"),
                t("statut"),
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
              <tr
                key={i}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3">{r.code_p}</td>
                <td className="px-4 py-3">{r.date_d}</td>
                <td className="px-4 py-3">{r.libelle}</td>
                <td className="px-4 py-3">{r.qty}</td>
                <td className="px-4 py-3">{r.credit_1.toLocaleString()}</td>
                <td className="px-4 py-3">{r.credit_2.toLocaleString()}</td>
                <td className="px-4 py-3">{r.date_r || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${r.statut === "Approved" ? "bg-green-100 text-green-700" : r.statut === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {r.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
