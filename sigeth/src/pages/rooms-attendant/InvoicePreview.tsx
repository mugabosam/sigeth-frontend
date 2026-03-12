import { useState } from "react";
import { Search, Printer } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useAuth } from "../../context/AuthContext";
import type { TEMPO } from "../../types";

export default function InvoicePreview() {
  const { t } = useLang();
  const { rooms, jlaundry, jbanquet, sales, setTempo, invoices, setInvoices } =
    useHotelData();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [previewItems, setPreviewItems] = useState<TEMPO[]>([]);
  const [guestInfo, setGuestInfo] = useState<{
    room_num: string;
    guest_name: string;
    phone: string;
  } | null>(null);

  const handleSearch = () => {
    const room = rooms.find(
      (r) =>
        r.room_num === query ||
        r.guest_name.toLowerCase().includes(query.toLowerCase()),
    );
    if (!room || !room.guest_name) {
      alert(t("noGuestFound"));
      return;
    }

    const items: TEMPO[] = [];
    const today = new Date().toISOString().split("T")[0];
    const nextInvoice = `INV-${String(invoices.length + 1).padStart(4, "0")}`;

    // Room charges from RDF.dat
    if (room.qty > 0 && room.puv > 0) {
      items.push({
        date: today,
        room_num: room.room_num,
        guest_name: room.guest_name,
        designation: room.designation + " (" + t("roomCharge") + ")",
        qty: room.qty,
        unity: 1,
        puv: room.puv,
        credit: room.qty * room.puv,
        debit: 0,
        phone: "",
        tin: "",
        invoice_num: nextInvoice,
        mode_payt: "",
        current_mon: room.current_mon,
      });
    }
    // Laundry from JLAUNDRY.dat
    jlaundry
      .filter((l) => l.room_num === room.room_num)
      .forEach((l) => {
        items.push({
          date: l.date,
          room_num: room.room_num,
          guest_name: room.guest_name,
          designation: l.designation + " (" + t("laundry") + ")",
          qty: l.qty,
          unity: l.unity,
          puv: l.price,
          credit: l.total,
          debit: 0,
          phone: "",
          tin: "",
          invoice_num: nextInvoice,
          mode_payt: "",
          current_mon: room.current_mon,
        });
      });
    // Banqueting from JBANQUET.dat
    jbanquet
      .filter((b) => b.room_num === room.room_num)
      .forEach((b) => {
        items.push({
          date: b.date,
          room_num: room.room_num,
          guest_name: room.guest_name,
          designation: b.item + " (" + t("banquet") + ")",
          qty: b.qty,
          unity: b.unity,
          puv: b.price,
          credit: b.total,
          debit: 0,
          phone: "",
          tin: "",
          invoice_num: nextInvoice,
          mode_payt: "",
          current_mon: room.current_mon,
        });
      });
    // Sales from SALES.dat
    sales
      .filter((s) => s.room_num === room.room_num)
      .forEach((s) => {
        items.push({
          date: s.date,
          room_num: room.room_num,
          guest_name: room.guest_name,
          designation: s.item,
          qty: s.qty_s,
          unity: s.unity,
          puv: s.price_s,
          credit: s.montant,
          debit: s.paid,
          phone: "",
          tin: "",
          invoice_num: nextInvoice,
          mode_payt: s.mode_payt,
          current_mon: s.current_mon,
        });
      });

    setPreviewItems(items);
    setGuestInfo({
      room_num: room.room_num,
      guest_name: room.guest_name,
      phone: "",
    });
    setTempo(items);
    setInvoices((prev) => [
      ...prev,
      { date: today, numero: prev.length + 1, username: user?.username ?? "" },
    ]);
  };

  const totalTTC = previewItems.reduce((s, i) => s + i.credit, 0);
  const tvaRate = 18;
  const htva = (totalTTC * 100) / (100 + tvaRate);
  const tva = (htva * tvaRate) / 100;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("invoicePreview")}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roomNumberOrGuest")}
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Search size={16} />
            {t("search")}
          </button>
        </div>
      </div>
      {guestInfo && previewItems.length > 0 && (
        <div
          className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
          id="invoice-preview"
        >
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">
              SIGETH — {t("invoicePreview")}
            </h2>
            <p className="text-sm text-gray-500">Finvoice_frm</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t("roomNumber")}:</span>{" "}
              <strong>{guestInfo.room_num}</strong>
            </div>
            <div>
              <span className="text-gray-500">{t("guestName")}:</span>{" "}
              <strong>{guestInfo.guest_name}</strong>
            </div>
            <div>
              <span className="text-gray-500">{t("invoiceNumber")}:</span>{" "}
              <strong>{previewItems[0]?.invoice_num}</strong>
            </div>
            <div>
              <span className="text-gray-500">{t("date")}:</span>{" "}
              <strong>{previewItems[0]?.date}</strong>
            </div>
          </div>
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                {[
                  t("date"),
                  t("designation"),
                  t("qty"),
                  t("unity"),
                  t("puv"),
                  t("credit"),
                  t("debit"),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 border-b font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewItems.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-2">{item.date}</td>
                  <td className="px-3 py-2">{item.designation}</td>
                  <td className="px-3 py-2">{item.qty}</td>
                  <td className="px-3 py-2">{item.unity}</td>
                  <td className="px-3 py-2 text-right">
                    {item.puv.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.credit.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.debit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t("totalTTC")}:</span>
                <strong>{totalTTC.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("htva")}:</span>
                <span>
                  {htva.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("tva")} (18%):</span>
                <span>
                  {tva.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => window.print()}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
            >
              <Printer size={16} />
              {t("print")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
