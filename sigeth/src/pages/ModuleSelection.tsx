import { useNavigate } from "react-router-dom";
import { Building2, Sun, Moon } from "lucide-react";
import { useLang } from "../hooks/useLang";

export default function ModuleSelection() {
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
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
              {t("hotelName")}
            </span>
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
              className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-sm"
              aria-label="Toggle language"
            >
              {/* Flag image */}
              {lang === "en" ? (
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  className="w-5 h-3 rounded"
                />
              ) : (
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="Français"
                  className="w-5 h-3 rounded"
                />
              )}
              {/* Language code */}
              <span className="text-xs font-bold">
                {lang === "en" ? "EN" : "FR"}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("selectModule")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-12">
            {t("selectModuleDesc")}
          </p>

          {/* Front Office card */}
          <button
            onClick={() => navigate("/front-office")}
            className="group w-full max-w-md p-8 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-gold-400 dark:hover:border-gold-400 shadow-sm hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sigeth-800 to-sigeth-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {t("pillFrontOffice")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("frontOfficeDesc")}
                </p>
              </div>
            </div>
          </button>

          {/* Footer */}
          <p className="mt-16 text-xs text-gray-400">
            © 2026 SIGETH — {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </div>
  );
}
