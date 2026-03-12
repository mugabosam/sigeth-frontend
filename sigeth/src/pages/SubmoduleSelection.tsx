import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  Brush,
  UtensilsCrossed,
  ArrowLeft,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useLang } from "../hooks/useLang";
import type { TranslationKey } from "../i18n/translations";

interface Submodule {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: typeof BedDouble;
  color: string;
}

const submodules: Submodule[] = [
  {
    id: "rooms",
    labelKey: "roomsSubmodule",
    descKey: "roomsSubmoduleDesc",
    icon: BedDouble,
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "housekeeping",
    labelKey: "housekeepingSubmodule",
    descKey: "housekeepingSubmoduleDesc",
    icon: Brush,
    color: "from-emerald-600 to-emerald-800",
  },
  {
    id: "banqueting",
    labelKey: "banquetingSubmodule",
    descKey: "banquetingSubmoduleDesc",
    icon: UtensilsCrossed,
    color: "from-amber-600 to-amber-800",
  },
];

export default function SubmoduleSelection() {
  const { t, lang, dark, toggleDark, toggleLang } = useLang();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col ${dark ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="SIGETH"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                {t("hotelName")}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {t("pillFrontOffice")}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleDark}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleLang}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm"
              aria-label="Toggle language"
            >
              <Globe size={16} />
              {lang.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center px-8 py-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-8 self-start max-w-3xl w-full mx-auto"
          >
            <ArrowLeft size={16} />
            {t("backToModules")}
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("selectSubmodule")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-12">
            {t("selectSubmoduleDesc")}
          </p>

          {/* Submodule cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            {submodules.map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/login/${sub.id}`)}
                  className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-gold-400 dark:hover:border-gold-400 shadow-sm hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sub.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {t(sub.labelKey)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t(sub.descKey)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-16 text-xs text-gray-400">
            © 2026 SIGETH — {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </div>
  );
}
