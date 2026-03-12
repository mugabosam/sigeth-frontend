import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLang } from "../../hooks/useLang";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLang();
  const title = usePageTitle();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div
        className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}
      >
        <Header title={t(title)} onMenuClick={() => setCollapsed(!collapsed)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
