import { useState } from "react";
import { Printer } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function CashierHandover() {
  const { t } = useLang();
  const { users, sales, paymentModes } = useHotelData();
  const [closingCashier, setClosingCashier] = useState("");
  const [openingCashier, setOpeningCashier] = useState("");
  const [generated, setGenerated] = useState(false);

  const cashiers = users.filter((u) => u.level === "Cashier");
  const closingUser = cashiers.find((u) => u.username === closingCashier);
  const openingUser = cashiers.find((u) => u.username === openingCashier);

  // Filter sales by closing cashier
  const cashierSales = sales.filter((s) => s.username === closingCashier);

  // Cumulate by payment mode
  const totals = paymentModes.map((pm) => ({
    ...pm,
    total: cashierSales
      .filter((s) => s.mode_payt === pm.code)
      .reduce((sum, s) => sum + s.montant, 0),
  }));
  const grandTotal = totals.reduce((s, t) => s + t.total, 0);
  const cashTotal = totals.find((t) => t.code === "01")?.total ?? 0;
  const lastInvoice =
    cashierSales.length > 0
      ? cashierSales[cashierSales.length - 1].invoice_num
      : "—";

  const handleGenerate = () => {
    if (!closingCashier || !openingCashier) return;
    setGenerated(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("cashierHandover")} — Lcashier.prt
      </h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("closingCashier")}
            </label>
            <select
              value={closingCashier}
              onChange={(e) => {
                setClosingCashier(e.target.value);
                setGenerated(false);
              }}
              title={t("closingCashier")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t("selectCashier")}...</option>
              {cashiers.map((c) => (
                <option key={c.username} value={c.username}>
                  {c.name} ({c.username})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("openingCashier")}
            </label>
            <select
              value={openingCashier}
              onChange={(e) => {
                setOpeningCashier(e.target.value);
                setGenerated(false);
              }}
              title={t("openingCashier")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t("selectCashier")}...</option>
              {cashiers
                .filter((c) => c.username !== closingCashier)
                .map((c) => (
                  <option key={c.username} value={c.username}>
                    {c.name} ({c.username})
                  </option>
                ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!closingCashier || !openingCashier}
          className="bg-amber-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50"
        >
          {t("generateReport")}
        </button>
      </div>
      {generated && closingUser && openingUser && (
        <>
          {/* Transaction details */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-sm">
                {t("transactionDetails")} — {closingUser.name}
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    t("date"),
                    t("orderNum"),
                    t("codeArt"),
                    t("item"),
                    t("unity"),
                    t("qtyS"),
                    t("priceS"),
                    t("montant"),
                    t("paid"),
                    t("credit"),
                    t("username"),
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-medium text-gray-600 text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cashierSales.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 text-xs">
                    <td className="px-3 py-2">{s.date}</td>
                    <td className="px-3 py-2">{s.order_num}</td>
                    <td className="px-3 py-2">{s.code_art}</td>
                    <td className="px-3 py-2">{s.item}</td>
                    <td className="px-3 py-2">{s.unity}</td>
                    <td className="px-3 py-2">{s.qty_s}</td>
                    <td className="px-3 py-2">{s.price_s.toLocaleString()}</td>
                    <td className="px-3 py-2">{s.montant.toLocaleString()}</td>
                    <td className="px-3 py-2">{s.paid.toLocaleString()}</td>
                    <td className="px-3 py-2">{s.credit.toLocaleString()}</td>
                    <td className="px-3 py-2">{s.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Payment totals */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-amber-50">
              <h3 className="font-semibold text-sm">{t("paymentTotals")}</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("code")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("paymentMode")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {totals.map((pm) => (
                  <tr key={pm.code} className="border-b">
                    <td className="px-4 py-3 font-mono">{pm.code}</td>
                    <td className="px-4 py-3">{pm.label}</td>
                    <td className="px-4 py-3 font-semibold">
                      {pm.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-amber-50 border-t">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 font-semibold text-right"
                  >
                    {t("grandTotal")}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Handover summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h3 className="font-semibold">{t("handoverSummary")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2 border-r pr-6">
                <p className="font-semibold text-gray-700">
                  {t("closingCashier")}
                </p>
                <p>{closingUser.name}</p>
                <p>
                  {t("date")}: {new Date().toLocaleDateString()}
                </p>
                <p>
                  {t("time")}: {new Date().toLocaleTimeString()}
                </p>
                <p>
                  {t("lastInvoice")}: {lastInvoice}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700">
                  {t("openingCashier")}
                </p>
                <p>{openingUser.name}</p>
                <p>
                  {t("date")}: {new Date().toLocaleDateString()}
                </p>
                <p>
                  {t("time")}: {new Date().toLocaleTimeString()}
                </p>
                <p className="font-bold text-amber-600">
                  {t("petitCash")}: {cashTotal.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <button
                onClick={() => window.print()}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-700"
              >
                <Printer size={16} />
                {t("print")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
