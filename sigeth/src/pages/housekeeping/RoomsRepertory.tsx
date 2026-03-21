import { useState } from "react";
import {
  Search,
  Plus,
  Save,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { validateRoom } from "../../utils/housekeepingValidation";
import type { RDF } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";
import type { RoomStatusCode } from "../../types";

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
  const { rooms, setRooms, catrooms, statuses } = useHotelData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RDF | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    setValidationErrors([]);
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

  const handleStatusChange = (newStatus: RoomStatusCode) => {
    if (!selected) return;
    setSelected({ ...selected, status: newStatus });
  };

  // Just open modal — same pattern as room attendant pages
  const handleSave = () => {
    if (!selected) return;

    const validation = validateRoom(selected);
    if (!validation.isValid) {
      setValidationErrors(validation.errors.map((e) => t(e.message)));
      return;
    }

    if (isNew && rooms.some((r) => r.room_num === selected.room_num)) {
      setValidationErrors([t("roomNumberExists")]);
      return;
    }

    setValidationErrors([]);
    setConfirmSaveOpen(true);
  };

  // Runs only when user clicks Confirm in the modal
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

      setSuccessMessage(isNew ? t("roomAddedSuccess") : t("roomUpdatedSuccess"));
      setShowSuccessModal(true);
      setSelected(null);
      setQuery("");
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to save room";
      setSuccessMessage(`Error: ${errorMessage}`);
      setShowSuccessModal(true);
    } finally {
      setConfirmSaveOpen(false);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;

    if (selected.id) {
      try {
        await frontOfficeApi.deleteRoom(selected.id);
      } catch (error) {
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to delete room";
        setSuccessMessage(`Error: ${errorMessage}`);
        setShowSuccessModal(true);
        setConfirmDeleteOpen(false);
        return;
      }
    }

    setRooms((prev) => prev.filter((r) => r.id !== selected.id));
    setSelected(null);
    setConfirmDeleteOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap print:hidden">
        <button
          onClick={handlePrint}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Printer size={14} />
          {t("print")}
        </button>
      </div>
      {/* Print Header Section */}
      <div className="hidden print:block bg-white p-4 mb-6 border-b-2 border-hotel-border">
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-base font-bold">{HOTEL_INFO.name}</h2>
          <p className="text-sm text-hotel-text-primary">
            {HOTEL_INFO.address}
          </p>
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
      <div className="bg-white rounded p-4 space-y-4 print:border-none print:shadow-none print:p-0">
        <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide flex items-center gap-2 print:hidden">
          <Search size={14} />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 flex-wrap print:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roomNumber")}
            className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold w-40"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
          >
            <Search size={14} />
            {t("search")}
          </button>
          <button
            onClick={() => {
              setSelected({ ...blank });
              setIsNew(true);
            }}
            className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
          >
            <Plus size={14} />
            {t("newRecord")}
          </button>
        </div>
      </div>
      {selected && (
        <div className="bg-white rounded p-4 space-y-4 print:hidden">
          <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
            {isNew ? t("newRoom") : t("editRoom")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("category")}
              </label>
              <select
                value={selected.categorie}
                onChange={(e) =>
                  handleChange("categorie", Number(e.target.value))
                }
                title={t("category")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                />
              </div>
            ))}
            {!isNew && (
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {t("status")}
                </label>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as RoomStatusCode)
                  }
                  title={t("status")}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                >
                  {statuses.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} — {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {validationErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2 border-t border-hotel-border">
            <button
              onClick={handleSave}
              className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              <Save size={14} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-hotel-danger text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border border-hotel-border text-hotel-text-primary px-4 py-2 rounded text-sm font-medium hover:bg-hotel-cream transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        <h2 className="text-sm font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide px-4 pt-4 print:hidden">
          {t("roomsDirectory")}
        </h2>
        <table className="w-full text-sm print:text-xs">
          <thead className="bg-hotel-navy text-white sticky top-0 print:border-b-4 print:border-black">
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
                  className="text-left py-2 px-2 font-medium print:text-black print:font-bold"
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
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors print:border-b print:hover:bg-white"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary print:text-black">
                  {r.room_num}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.designation}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {catrooms.find((c) => c.code === r.categorie)?.name ??
                    r.categorie}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.current_mon}
                </td>
                <td className="py-2 px-2 print:text-black">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-hotel-cream text-hotel-gold print:bg-transparent print:border print:border-hotel-border">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="px-4 py-8 text-center text-hotel-text-secondary print:hidden">
            <p className="text-sm">{t("noRoomsFound")}</p>
          </div>
        )}
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmSaveOpen}
        title={t("confirm")}
        message={t("confirmSave")}
        onConfirm={confirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title={t("confirm")}
        message={t("confirmDelete")}
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Success/Error Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white border border-hotel-border rounded p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              {successMessage.includes("Error") ? (
                <div className="w-10 h-10 rounded-full bg-hotel-danger/20 flex items-center justify-center">
                  <AlertTriangle className="text-hotel-danger" size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-hotel-success/20 flex items-center justify-center">
                  <CheckCircle2 className="text-hotel-success" size={20} />
                </div>
              )}
              <h3 className="text-base font-semibold text-hotel-text-primary">
                {successMessage.includes("Error") ? t("error") : t("success")}
              </h3>
            </div>
            <p className="text-sm text-hotel-text-secondary mb-4">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-hotel-gold text-white py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
