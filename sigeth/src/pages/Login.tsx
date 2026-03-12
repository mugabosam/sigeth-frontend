import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  Globe,
  Building2,
  ArrowLeft,
  BedDouble,
  Brush,
  UtensilsCrossed,
} from "lucide-react";
import { useLang } from "../hooks/useLang";
import { useAuth } from "../context/AuthContext";
import { mockUsers } from "../utils/mockData";
import type { TranslationKey } from "../i18n/translations";

const SUBMODULE_META: Record<
  string,
  {
    labelKey: TranslationKey;
    icon: typeof BedDouble;
    level: string;
    defaultRoute: string;
    demoUser: string;
    demoPass: string;
  }
> = {
  rooms: {
    labelKey: "roomsSubmodule",
    icon: BedDouble,
    level: "Manager_R",
    defaultRoute: "/rooms-attendant/group-reservation",
    demoUser: "Rooms",
    demoPass: "Guest",
  },
  housekeeping: {
    labelKey: "housekeepingSubmodule",
    icon: Brush,
    level: "Manager_H",
    defaultRoute: "/housekeeping/room-categories",
    demoUser: "House",
    demoPass: "Keep",
  },
  banqueting: {
    labelKey: "banquetingSubmodule",
    icon: UtensilsCrossed,
    level: "Manager_B",
    defaultRoute: "/banqueting/events-lots",
    demoUser: "Banquet",
    demoPass: "Bguest",
  },
};

const PILLS = [
  "pillFrontOffice",
  "pillLogistics",
  "pillSales",
  "pillHr",
  "pillFinance",
  "pillProcedures",
] as const;

export default function Login() {
  const { t, lang, dark, toggleDark, toggleLang } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { submodule } = useParams<{ submodule: string }>();

  const meta = submodule ? SUBMODULE_META[submodule] : undefined;
  const SubIcon = meta?.icon ?? Building2;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      // Validate user has access to this submodule
      const found = mockUsers.find((u) => u.username === username);
      if (meta && found && found.level !== meta.level) {
        // Wrong role for this submodule
        setError(t("loginError"));
        setLoading(false);
        return;
      }
      navigate(meta?.defaultRoute ?? "/", { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        setError(
          (err as { response: { data: { message: string } } }).response.data
            .message,
        );
      } else {
        setError(t("loginError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* ───── Left branding panel ───── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sigeth-950 via-sigeth-900 to-sigeth-800">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sigeth-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo + name */}
          <div>
            <div className="flex items-center gap-3 mb-16">
              <img
                src="/logo.jpeg"
                alt="SIGETH"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <span className="text-xl font-bold text-white tracking-wide">
                  {t("hotelName")}
                </span>
                <span className="block text-xs text-sigeth-300 tracking-widest uppercase">
                  {t("hotelManagement")}
                </span>
              </div>
            </div>

            {/* Branding headline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              {t("loginBrandingTitle")}{" "}
              <span className="text-gold-400">
                {t("loginBrandingHighlight")}
              </span>{" "}
              {t("loginBrandingSuffix")}
            </h1>
            <p className="text-sigeth-300 text-lg max-w-md">
              {t("loginBrandingDesc")}
            </p>

            {/* Module pills */}
            <div className="flex flex-wrap gap-3 mt-10">
              {PILLS.map((key) => (
                <span
                  key={key}
                  className="px-4 py-1.5 rounded-full bg-sigeth-800/60 text-sigeth-200 text-sm border border-sigeth-700/40"
                >
                  {t(key)}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sigeth-400 text-sm">
            © 2026 SIGETH — {t("allRightsReserved")}
          </p>
        </div>
      </div>

      {/* ───── Right form panel ───── */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="flex justify-between items-center p-6">
          <button
            onClick={() => navigate("/front-office")}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            {t("backToSubmodules")}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleDark}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={toggleLang}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
              aria-label="Toggle language"
            >
              <Globe size={16} />
              {lang.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12">
          <div className="w-full max-w-md">
            {/* Mobile-only logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
              <img
                src="/logo.jpeg"
                alt="SIGETH"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t("hotelName")}
              </span>
            </div>

            {/* Submodule badge */}
            {meta && (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-sigeth-50 dark:bg-sigeth-900/30 border border-sigeth-100 dark:border-sigeth-800/40">
                <SubIcon
                  size={20}
                  className="text-sigeth-600 dark:text-sigeth-400"
                />
                <span className="text-sm font-semibold text-sigeth-700 dark:text-sigeth-300">
                  {t("signInAs")} {t(meta.labelKey)}
                </span>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("loginTitle")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {t("loginSubtitle")}
            </p>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("username")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder={t("usernamePlaceholder")}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder={t("passwordPlaceholder")}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-400 hover:bg-gold-500 disabled:opacity-50 text-sigeth-950 font-semibold text-sm transition-colors"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-sigeth-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {t("loginButton")}
              </button>
            </form>

            {/* Demo hint */}
            {meta && (
              <div className="mt-8 p-3 rounded-lg bg-sigeth-50 dark:bg-sigeth-900/30 border border-sigeth-100 dark:border-sigeth-800/40 text-center">
                <p className="text-xs text-sigeth-500 dark:text-sigeth-300">
                  Demo: {meta.demoUser} / {meta.demoPass}
                </p>
              </div>
            )}

            {/* Mobile footer */}
            <p className="lg:hidden text-center text-xs text-gray-400 mt-6">
              © 2026 SIGETH — {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
