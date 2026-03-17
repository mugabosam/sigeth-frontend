import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useLang } from "../hooks/useLang";

export default function ModuleSelection() {
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F3EF' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-hotel-border bg-white">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="SIGETH"
            className="w-9 h-9 rounded object-cover"
          />
          <span className="text-lg font-display font-bold text-hotel-text-primary">
            {t("hotelName")}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleLang}
          className="px-3 py-1.5 rounded border border-hotel-border text-xs font-medium text-hotel-text-primary hover:bg-hotel-cream transition-colors flex items-center gap-1.5"
          aria-label="Toggle language"
        >
          {lang === "en" ? (
            <>
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt="English"
                className="w-4 h-3 rounded"
              />
              <span>EN</span>
            </>
          ) : (
            <>
              <img
                src="https://flagcdn.com/w40/fr.png"
                alt="Français"
                className="w-4 h-3 rounded"
              />
              <span>FR</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-2xl font-display font-bold text-hotel-text-primary mb-2">
          {t("selectModule")}
        </h1>
        <p className="text-sm text-hotel-text-secondary mb-12">
          {t("selectModuleDesc")}
        </p>

        {/* Front Office card */}
        <button
          onClick={() => navigate("/front-office")}
          className="w-full max-w-md p-6 rounded border border-hotel-border bg-white hover:bg-hotel-cream transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded bg-hotel-navy flex items-center justify-center">
              <Building2 className="w-7 h-7 text-hotel-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-hotel-text-primary mb-1">
                {t("pillFrontOffice")}
              </h2>
              <p className="text-xs text-hotel-text-secondary">
                {t("frontOfficeDesc")}
              </p>
            </div>
          </div>
        </button>

        {/* Footer */}
        <p className="mt-12 text-xs text-hotel-text-secondary">
          © 2026 SIGETH — {t("allRightsReserved")}
        </p>
      </div>
    </div>
  );
}
