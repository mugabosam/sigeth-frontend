import { useState } from "react";
import { Search, Plus, Save, Trash2, Printer } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { validateRoom } from "../../utils/housekeepingValidation";
import type { RDF } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

// Hotel information for printing
const HOTEL_INFO = {
  name: "SIGETH",
  address: "City, Country",
  phone: "+250 788 123 456",
  email: "info@sigeth.rw",
  tm: "TM Number",
};

export default function RoomsRepertory() {
  const { t } = useLang();
  const { rooms, setRooms, catrooms } = useHotelData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RDF | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const blank: RDF = {
    categorie: 1,
    room_num: "",
    designation: "",
    price_1: 0,
    price_2: 0,
    guest_name: "",
    twin_name: "",
    twin_num: 0,
    current_mon: "RWF",
    status: "VC",
    arrival_date: "",
    depart_date: "",
    qty: 0,
    puv: 0,
    deposit: 0,
    date: new Date().toISOString().split("T")[0],
  };

  const handleSearch = () => {
    const found = rooms.find((r) => r.room_num === query);
    if (found) {
      setSelected({ ...found });
      setIsNew(false);
    } else {
      setSelected({ ...blank, room_num: query });
      setIsNew(true);
    }
  };

  const handleChange = (field: keyof RDF, value: string | number) => {
    if (!selected) return;
    setSelected({ ...selected, [field]: value });
  };

  const handleSave = () => {
    if (!selected) return;

    // Validate form
    const validation = validateRoom(selected);
    if (!validation.isValid) {
      // Log validation errors, optional: show toast notification
      console.warn("Validation errors:", validation.errors);
      return;
    }

    // Check for duplicates when creating new
    if (isNew && rooms.some((r) => r.room_num === selected.room_num)) {
      console.warn("Room number already exists");
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!selected) return;

    try {
      const saved = isNew
        ? await frontOfficeApi.createRoom(selected)
        : selected.id
          ? await frontOfficeApi.updateRoom(selected.id, selected)
          : await frontOfficeApi.createRoom(selected);

      if (isNew || !selected.id) {
        setRooms((prev) => [...prev, saved]);
      } else {
        setRooms((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      }
    } catch (error) {
      alert(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to save room",
      );
      return;
    }

    setSelected(null);
    setQuery("");
    setShowSaveConfirm(false);
  };

  const handleDelete = async () => {
    if (!selected) return;

    if (selected.id) {
      try {
        await frontOfficeApi.deleteRoom(selected.id);
      } catch (error) {
        alert(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to delete room",
        );
        return;
      }
    }

    setRooms((prev) => prev.filter((r) => r.id !== selected.id));
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("roomsRepertory")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">{t("manageRoomsDesc")}</p>
      </div>
      <div className="flex gap-3 flex-wrap print:hidden">
        <button
          onClick={handlePrint}
          className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-slate-700 hover:to-slate-800 transition-colors duration-200"
        >
          <Printer size={16} />
          {t("print")}
        </button>
      </div>
      {/* Print Header Section */}
      <div className="hidden print:block bg-white p-4 mb-6 border-b-2 border-gray-800">
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-base font-bold">{HOTEL_INFO.name}</h2>
          <p className="text-sm text-hotel-text-primary">{HOTEL_INFO.address}</p>
          <div className="flex justify-center gap-4 text-sm text-hotel-text-secondary">
            <span>
              {t("phone")}: {HOTEL_INFO.phone}
            </span>
            <span>
              {t("email")}: {HOTEL_INFO.email}
            </span>
          </div>
          <p className="text-sm text-hotel-text-primary">TM: {HOTEL_INFO.tm}</p>
        </div>
        <div className="text-center border-t border-hotel-border pt-3">
          <h3 className="text-base font-bold mb-2">LIST OF ROOMS</h3>
          <p className="text-sm text-hotel-text-secondary">
            {t("date")}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="bg-white rounded border border-emerald-100 p-4 print:border-none print:shadow-none print:p-0">
        <h3 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-2 print:hidden">
          <Search size={16} />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 flex-wrap print:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roomNumber")}
            className="border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium w-40 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200"
          >
            <Search size={16} />
            {t("search")}
          </button>
          <button
            onClick={() => {
              setSelected({ ...blank });
              setIsNew(true);
            }}
            className="border-2 border-emerald-300 text-emerald-700 px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            <Plus size={16} />
            {t("newRecord")}
          </button>
        </div>
      </div>
      {selected && (
        <div className="bg-white rounded border border-emerald-100 p-7 space-y-4 print:hidden">
          <h3 className="text-base font-bold text-emerald-700">
            {isNew ? t("newRoom") : t("editRoom")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
                {t("category")}
              </label>
              <select
                value={selected.categorie}
                onChange={(e) =>
                  handleChange("categorie", Number(e.target.value))
                }
                title={t("category")}
                className="w-full border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {catrooms.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            {(
              [
                ["room_num", t("roomNumber"), "text"],
                ["designation", t("designation"), "text"],
                ["price_1", t("price1"), "number"],
                ["price_2", t("price2"), "number"],
                ["current_mon", t("currency"), "text"],
                ["puv", t("puv"), "number"],
              ] as [keyof RDF, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  value={selected[field] ?? ""}
                  onChange={(e) =>
                    handleChange(
                      field,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  title={label}
                  className="w-full border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-5 border-t border-hotel-border">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-colors duration-200"
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border-2 border-hotel-border px-6 py-2.5 rounded text-sm font-semibold text-hotel-text-primary hover:bg-hotel-cream transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded border border-emerald-100 overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100 print:hidden">
          <h2 className="text-base font-bold text-hotel-text-primary">
            {t("roomsDirectory")}
          </h2>
        </div>
        <table className="w-full text-sm print:text-xs">
          <thead className="bg-white border-b-2 border-emerald-200 print:border-b-4 print:border-black">
            <tr>
              {[
                t("roomNumber"),
                t("designation"),
                t("category"),
                t("price1"),
                t("price2"),
                t("currency"),
                t("status"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 font-bold text-hotel-text-primary print:text-black print:font-bold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr
                key={r.room_num}
                className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150 print:border-b print:hover:bg-white"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="px-6 py-3 font-semibold text-emerald-600 print:text-black">
                  {r.room_num}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{r.designation}</td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {catrooms.find((c) => c.code === r.categorie)?.name ??
                    r.categorie}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{r.current_mon}</td>
                <td className="px-6 py-3 print:text-black">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 print:bg-transparent print:border print:border-hotel-border">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="px-6 py-12 text-center text-hotel-text-secondary print:hidden">
            <p className="text-sm">{t("noRoomsFound")}</p>
          </div>
        )}
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        title={isNew ? t("addRoom") : t("updateRoom")}
        message={`${t(isNew ? "confirmAddRoom" : "confirmUpdateRoom")} ${selected?.room_num} (${selected?.designation})?`}
        confirmText={isNew ? t("add") : t("update")}
        cancelText={t("cancel")}
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={t("deleteRoom")}
        message={`${t("confirmDeleteRoom")} ${selected?.room_num}? ${t("cannotBeUndone")}`}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
