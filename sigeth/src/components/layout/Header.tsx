import { Bell, Menu, User } from "lucide-react";
import { useLang } from "../../hooks/useLang";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { lang, setLang } = useLang();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: menu + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          title="Menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      {/* Right: lang toggle, notifications, avatar */}
      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "fr" : "en")}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {lang === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          title="Notifications"
        >
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
      </div>
    </header>
  );
}
