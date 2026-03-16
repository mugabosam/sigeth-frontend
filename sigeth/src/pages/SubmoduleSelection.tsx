import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  Brush,
  UtensilsCrossed,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "../hooks/useLang";
import type { TranslationKey } from "../i18n/translations";

interface Submodule {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: typeof BedDouble;
  color: string;
  gradient: string;
  accentColor: string;
}

const submodules: Submodule[] = [
  {
    id: "rooms",
    labelKey: "roomsSubmodule",
    descKey: "roomsSubmoduleDesc",
    icon: BedDouble,
    color: "from-blue-600 to-blue-800",
    gradient: "from-blue-500/10 to-blue-600/10",
    accentColor: "blue",
  },
  {
    id: "housekeeping",
    labelKey: "housekeepingSubmodule",
    descKey: "housekeepingSubmoduleDesc",
    icon: Brush,
    color: "from-emerald-600 to-emerald-800",
    gradient: "from-emerald-500/10 to-emerald-600/10",
    accentColor: "emerald",
  },
  {
    id: "banqueting",
    labelKey: "banquetingSubmodule",
    descKey: "banquetingSubmoduleDesc",
    icon: UtensilsCrossed,
    color: "from-amber-600 to-amber-800",
    gradient: "from-amber-500/10 to-amber-600/10",
    accentColor: "amber",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function SubmoduleSelection() {
  const { t, lang, dark, toggleDark, toggleLang } = useLang();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col ${dark ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
        </div>

        {/* Top bar with premium styling */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center justify-between px-8 py-3 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30 bg-gradient-to-r from-white/50 to-gray-50/30 dark:from-gray-900/50 dark:to-gray-800/30"
        >
          {/* Logo section */}
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="/logo.jpeg"
                alt="SIGETH"
                className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-blue-400/20"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {t("hotelName")}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t("pillFrontOffice")}
              </span>
            </div>
          </motion.div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={toggleDark}
              className="relative group p-2.5 rounded-lg bg-gradient-to-br from-yellow-100/50 to-amber-100/50 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm text-yellow-600 dark:text-blue-300 hover:shadow-lg transition-all border border-yellow-200/50 dark:border-gray-600/50"
              aria-label="Toggle dark mode"
            >
              <motion.div
                animate={{ rotate: dark ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </motion.button>

            {/* Language selector - Match Header style */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={toggleLang}
              className="relative group px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 border border-gray-200/50 dark:border-gray-700/30"
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
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {lang === "en" ? "EN" : "FR"}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center px-6 py-4 flex-1 justify-between"
        >
          {/* Back button */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/")}
            className="relative group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-3 self-start max-w-4xl w-full mx-auto px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Hover background */}
            <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-blue-50/50 to-emerald-50/50 dark:from-blue-900/20 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <motion.div
              className="relative"
              whileHover={{ rotate: -15, x: -2 }}
              transition={{
                type: "spring" as const,
                stiffness: 300,
                damping: 20,
              }}
            >
              <ArrowLeft
                size={18}
                className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              />
            </motion.div>
            <span className="font-semibold">{t("back")}</span>
          </motion.button>

          {/* Main content wrapper */}
          <div className="flex flex-col items-center w-full">
            {/* Header section */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <Sparkles size={20} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {t("selectYourDepartment")}
                </span>
                <Sparkles size={20} className="text-amber-500" />
              </motion.div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-800 dark:from-white dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent mb-2">
                {t("chooseYourModule")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
                {t("accessModuleDesc")}
              </p>
            </motion.div>

            {/* Submodule cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl"
            >
              {submodules.map((sub) => {
                const Icon = sub.icon;
                return (
                  <motion.button
                    key={sub.id}
                    variants={itemVariants}
                    onClick={() => navigate(`/login/${sub.id}`)}
                    className="relative group h-full"
                  >
                    {/* Card container */}
                    <motion.div
                      className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 h-full flex flex-col transition-all duration-300"
                      whileHover={{
                        borderColor: "rgb(156, 163, 175)",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {/* Background gradient on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${sub.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Animated border gradient */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r ${sub.color} bg-clip-border opacity-0 group-hover:opacity-20`}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.3 }}
                      />

                      {/* Shine effect */}
                      <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.8 }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon with animation */}
                        <motion.div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sub.color} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all`}
                          whileHover={{
                            scale: 1.1,
                            rotate: 360,
                          }}
                          transition={{
                            type: "spring" as const,
                            stiffness: 200,
                            damping: 10,
                          }}
                        >
                          <Icon
                            className="w-7 h-7 text-white"
                            strokeWidth={1.5}
                          />
                        </motion.div>

                        {/* Title and description */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 text-left">
                          {t(sub.labelKey)}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed text-left flex-1">
                          {t(sub.descKey)}
                        </p>

                        {/* Arrow indicator */}
                        <motion.div
                          className="flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-sm">{t("accessModule")}</span>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <ChevronRight size={18} />
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p
            variants={itemVariants}
            className="mt-45 text-sm text-gray-400 dark:text-gray-500 font-light"
          >
            © 2026 SIGETH Hotel Management — {t("allRightsReserved")}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
