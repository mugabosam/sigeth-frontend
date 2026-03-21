import { useState } from "react";
import { Search, User, Users, FileText } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

type Tab = "guest" | "group";

export default function ReprintInvoice() {
  const { t } = useLang();
  // wired for future use
  useHotelData();

  const [tab, setTab] = useState<Tab>("guest");
  const [invoiceNum, setInvoiceNum] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="space-y-4 p-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded p-1">
        <button
          onClick={() => { setTab("guest"); setInvoiceNum(""); setName(""); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
            tab === "guest"
              ? "bg-hotel-gold text-white"
              : "text-hotel-text-secondary hover:bg-hotel-cream"
          }`}
        >
          <User size={16} />
          {t("invoiceByGuest")}
        </button>
        <button
          onClick={() => { setTab("group"); setInvoiceNum(""); setName(""); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
            tab === "group"
              ? "bg-hotel-gold text-white"
              : "text-hotel-text-secondary hover:bg-hotel-cream"
          }`}
        >
          <Users size={16} />
          {t("invoiceByGroup")}
        </button>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {tab === "guest" ? "Search Guest Invoice" : "Search Group Invoice"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              Invoice Number
            </label>
            <input
              value={invoiceNum}
              onChange={(e) => setInvoiceNum(e.target.value)}
              placeholder="INV-0000001"
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {tab === "guest" ? "Guest Name" : "Group Name"}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tab === "guest" ? "Guest name..." : "Group name..."}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="flex items-end">
            <button
              disabled
              title="Available after Sales module is connected"
              className="w-full bg-hotel-gold text-white p-2.5 rounded flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty results */}
      <div className="bg-white rounded p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-hotel-cream flex items-center justify-center mb-4">
          <FileText size={28} className="text-hotel-text-secondary" />
        </div>
        <p className="text-hotel-text-secondary text-sm">
          Invoice reprint will be available once the Sales module is connected.
        </p>
        <p className="text-hotel-text-secondary text-xs mt-2 opacity-60">
          Module 3 — Sales &amp; Billing
        </p>
      </div>
    </div>
  );
}
