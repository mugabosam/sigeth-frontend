import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  Brush,
  UtensilsCrossed,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useLang } from "../hooks/useLang";
import type { TranslationKey } from "../i18n/translations";

interface Submodule {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: typeof BedDouble;
}

const submodules: Submodule[] = [
  {
    id: "rooms",
    labelKey: "roomsSubmodule",
    descKey: "roomsSubmoduleDesc",
    icon: BedDouble,
  },
  {
    id: "housekeeping",
    labelKey: "housekeepingSubmodule",
    descKey: "housekeepingSubmoduleDesc",
    icon: Brush,
  },
  {
    id: "banqueting",
    labelKey: "banquetingSubmodule",
    descKey: "banquetingSubmoduleDesc",
    icon: UtensilsCrossed,
  },
];

export default function SubmoduleSelection() {
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F3EF' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-hotel-border">
        {/* Logo section */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="SIGETH"
            className="w-9 h-9 rounded object-cover"
          />
          <div>
            <span className="text-lg font-display font-bold text-hotel-text-primary">
              {t("hotelName")}
            </span>
            <span className="block text-xs text-hotel-text-secondary">
              {t("pillFrontOffice")}
            </span>
          </div>
        </div>

        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLang}
          className="px-3 py-1.5 rounded border border-hotel-border text-xs font-medium text-hotel-text-primary hover:bg-hotel-cream transition-colors flex items-center gap-1.5"
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
      <div className="flex-1 flex flex-col items-center px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-hotel-text-secondary hover:text-hotel-text-primary transition-colors mb-8 self-start"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">{t("back")}</span>
        </button>

        {/* Header section */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-hotel-gold uppercase tracking-widest mb-2">
            {t("selectYourDepartment")}
          </p>
          <h1 className="text-2xl font-display font-bold text-hotel-text-primary mb-2">
            {t("chooseYourModule")}
          </h1>
          <p className="text-sm text-hotel-text-secondary max-w-2xl mx-auto">
            {t("accessModuleDesc")}
          </p>
        </div>

        {/* Submodule cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {submodules.map((sub) => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => navigate(`/login/${sub.id}`)}
                className="relative group"
              >
                <div className="bg-white border border-hotel-border rounded p-5 h-full flex flex-col transition-colors hover:bg-hotel-cream">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded bg-hotel-navy flex items-center justify-center mb-3 group-hover:bg-hotel-gold transition-colors">
                    <Icon className="w-6 h-6 text-white" size={24} />
                  </div>

                  {/* Title and description */}
                  <h3 className="text-base font-semibold text-hotel-text-primary mb-1 text-left">
                    {t(sub.labelKey)}
                  </h3>
                  <p className="text-xs text-hotel-text-secondary leading-relaxed text-left flex-1">
                    {t(sub.descKey)}
                  </p>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-2 mt-4 text-hotel-gold font-semibold group-hover:gap-3 transition-all">
                    <span className="text-xs">{t("accessModule")}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-16 text-xs text-hotel-text-secondary">
          © 2026 SIGETH Hotel Management — {t("allRightsReserved")}
        </p>
      </div>
    </div>
  );
}
