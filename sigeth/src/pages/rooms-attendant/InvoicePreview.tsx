import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { TEMPO } from "../../types";

export default function InvoicePreview() {
  const { t } = useLang();
  const { rooms, jlaundry, jbanquet, sales, setTempo } = useHotelData();
  const [queryRoom, setQueryRoom] = useState("");
  const [queryGuest, setQueryGuest] = useState("");
  const [previewItems, setPreviewItems] = useState<TEMPO[]>([]);
  const [guestInfo, setGuestInfo] = useState<{
    room_num: string;
    guest_name: string;
  } | null>(null);

  const liveCandidates = useMemo(() => {
    const roomQuery = queryRoom.trim().toLowerCase();
    const guestQuery = queryGuest.trim().toLowerCase();
    if (!roomQuery && !guestQuery) return [];
    const matches = rooms.filter((r) => {
      const roomMatch =
        !roomQuery || r.room_num.toLowerCase().includes(roomQuery);
      const guestMatch =
        !guestQuery || r.guest_name.toLowerCase().includes(guestQuery);
      return roomMatch && guestMatch;
    });
    const byAccess = new Map<
      string,
      {
        room_num: string;
        guest_name: string;
      }
    >();
    matches.forEach((r) => {
      const key = `${r.room_num}::${r.guest_name.toLowerCase()}`;
      if (!byAccess.has(key)) {
        byAccess.set(key, {
          room_num: r.room_num,
          guest_name: r.guest_name,
        });
      }
    });
    return Array.from(byAccess.values()).slice(0, 12);
  }, [rooms, queryRoom, queryGuest]);

  const populatePreview = (roomNum: string, guestName: string) => {
    // Look up room_num in RDF.dat and verify guest_name
    const room = rooms.find(
      (r) =>
        r.room_num === roomNum &&
        r.guest_name.toLowerCase() === guestName.toLowerCase(),
    );
    if (!room) {
      alert(t("noGuestFound"));
      return;
    }

    const items: TEMPO[] = [];
    const today = new Date().toISOString().split("T")[0];

    // RDF.dat → TEMPO: date, room_num, designation, qty, puv, credit=qty*puv, guest_name
    if (room.qty > 0 && room.puv > 0) {
      items.push({
        date: today,
        room_num: room.room_num,
        guest_name: room.guest_name,
        designation: room.designation,
        qty: room.qty,
        unity: 1,
        puv: room.puv,
        credit: room.qty * room.puv,
        debit: 0,
        phone: "",
        tin: "",
        invoice_num: "",
        mode_payt: "",
        current_mon: room.current_mon,
      });
    }
    // JLAUNDRY.dat → TEMPO: date, room_num, designation, unity, qty, puv, guest_name, credit=qty*puv
    jlaundry
      .filter((l) => l.room_num === room.room_num)
      .forEach((l) => {
        items.push({
          date: l.date,
          room_num: room.room_num,
          guest_name: room.guest_name,
          designation: l.designation,
          qty: l.qty,
          unity: l.unity,
          puv: l.price,
          credit: l.qty * l.price,
          debit: 0,
          phone: "",
          tin: "",
          invoice_num: "",
          mode_payt: "",
          current_mon: room.current_mon,
        });
      });
    // JBANQUET.dat → TEMPO: date, room_num, designation, qty, puv, guest_name, credit=qty*puv
    jbanquet
      .filter((b) => b.room_num === room.room_num)
      .forEach((b) => {
        items.push({
          date: b.date,
          room_num: room.room_num,
          guest_name: room.guest_name,
          designation: b.item,
          qty: b.qty,
          unity: b.unity,
          puv: b.price,
          credit: b.qty * b.price,
          debit: 0,
          phone: "",
          tin: "",
          invoice_num: "",
          mode_payt: "",
          current_mon: room.current_mon,
        });
      });
    // SALES.dat → TEMPO: date, room_num, designation, qty, unity, puv, credit=qty*puv, guest_name
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
          credit: s.qty_s * s.price_s,
          debit: 0,
          phone: "",
          tin: "",
          invoice_num: "",
          mode_payt: "",
          current_mon: s.current_mon,
        });
      });

    setPreviewItems(items);
    setGuestInfo({ room_num: room.room_num, guest_name: room.guest_name });
    setTempo(items);
    setQueryRoom(roomNum);
    setQueryGuest(guestName);
  };

  const totalCredit = previewItems.reduce((s, i) => s + i.credit, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("invoicePreview")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Preview invoices with multi-source items
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
        >
          <Printer size={18} />
          {t("print")}
        </button>
      </div>

      {/* Search panel with live candidates */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
          {t("queryWindow")}
        </h3>
        <div className="flex gap-4 flex-wrap mb-3">
          <input
            value={queryRoom}
            onChange={(e) => setQueryRoom(e.target.value)}
            placeholder={t("roomNumber")}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm w-48 focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
          />
          <input
            value={queryGuest}
            onChange={(e) => setQueryGuest(e.target.value)}
            placeholder={t("guestName")}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
          />
        </div>
        {/* Live candidates panel */}
        {liveCandidates.length > 0 && (
          <div className="border-2 border-blue-200 rounded-xl bg-gradient-to-b from-blue-50 to-white max-h-64 overflow-y-auto">
            {liveCandidates.map((c, i) => (
              <button
                key={i}
                onClick={() => populatePreview(c.room_num, c.guest_name)}
                className="w-full text-left px-4 py-4 text-sm border-b border-gray-200 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{c.room_num}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {c.guest_name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Preview Document */}
      {guestInfo && previewItems.length > 0 && (
        <div
          className="bg-white text-[10px] leading-tight text-black max-w-[1000px] mx-auto p-6 font-sans shadow-lg rounded-2xl border border-gray-200"
          id="invoice-preview"
        >
          <div className="mb-4 pb-4 border-b-2 border-gray-300">
            <p className="text-lg font-bold text-gray-800">
              Invoice Preview — Finvoice_frm
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated: {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Header Info */}
          <div className="border-2 border-gray-800 rounded-lg overflow-hidden mb-4">
            {/* Info Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex justify-between items-center text-white">
              <p className="font-bold text-sm">Guest Invoice Preview</p>
              <div className="text-xs space-y-0.5 text-right">
                <p>
                  <span className="font-semibold">{t("roomNumber")}:</span>{" "}
                  {guestInfo.room_num}
                </p>
                <p>
                  <span className="font-semibold">{t("guestName")}:</span>{" "}
                  {guestInfo.guest_name}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
                    {[
                      "Date",
                      "Room",
                      "Designation",
                      "Qty",
                      "Unity",
                      "PUV",
                      "Credit",
                      "Guest",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border border-gray-800 px-2 py-2 text-left font-bold text-xs text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewItems.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50 transition-colors border-b border-gray-300"
                    >
                      <td className="border border-gray-300 px-2 py-2 text-xs font-mono text-gray-700">
                        {item.date}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs font-semibold text-gray-800">
                        {item.room_num}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-800">
                        {item.designation}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-center font-semibold">
                        {item.qty}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-700">
                        {item.unity}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-semibold">
                        {item.puv.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-bold text-green-700">
                        {item.credit.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-800">
                        {item.guest_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Footer */}
            <div className="flex justify-end px-4 py-4 border-t-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
              <div className="space-y-2 text-xs w-64">
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">
                    {t("total")}:
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-24 text-right font-bold text-green-700">
                    {Math.round(totalCredit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page marker */}
          <p className="text-center text-gray-400 mt-4 text-xs font-light tracking-widest">
            --
          </p>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-preview, #invoice-preview * { visibility: visible !important; }
          #invoice-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
