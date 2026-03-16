import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  ArrowLeft,
  Check,
  Shield,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../hooks/useLang";
import { useAuth } from "../context/AuthContext";
import { mockUsers } from "../utils/mockData";
import { getLoginDesign } from "../utils/LoginDesigns";
import type { TranslationKey } from "../i18n/translations";

export default function Login() {
  const { t, lang, dark, toggleDark, toggleLang } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { submodule } = useParams<{ submodule: string }>();

  const design = getLoginDesign(submodule);

  const SubIcon = design.icon;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      const found = mockUsers.find((u) => u.username === username);
      if (found && found.level !== design.level) {
        setError(t("loginError"));
        setLoading(false);
        return;
      }
      navigate(design.defaultRoute, { replace: true });
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

  const fillDemoCredentials = () => {
    setUsername(design.demoUser);
    setPassword(design.demoPass);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 12 },
    },
  };

  const glowVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0, 0.3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
      },
    },
  };

  // Dynamic gradient class
  const gradientClass = `bg-gradient-to-br ${design.gradientFrom} ${design.gradientVia} ${design.gradientTo}`;

  return (
    <div className={`min-h-screen flex ${dark ? "dark" : ""} overflow-hidden`}>
      {/* ───── Left branding panel with enhanced visuals ───── */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${gradientClass}`}
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Parallax floating orbs */}
        <motion.div
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{ type: "spring" as const, stiffness: 50, damping: 30 }}
          className="absolute inset-0"
        >
          {/* Decorative circles with animation */}
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className={`absolute -top-20 -left-20 w-80 h-80 ${design.decorCircle1} rounded-full blur-3xl`}
          />
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className={`absolute -bottom-32 -right-32 w-96 h-96 ${design.decorCircle2} rounded-full blur-3xl`}
          />
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className={`absolute top-1/4 right-1/4 w-72 h-72 ${design.decorCircle3} rounded-full blur-2xl`}
          />
        </motion.div>

        {/* Floating elements from design config */}
        {design.floatingElements?.map((element, index) => {
          const Icon = element.icon;
          return (
            <motion.div
              key={index}
              className={`absolute ${element.position} pointer-events-none`}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6 + element.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: element.delay,
              }}
            >
              <Icon className={`${element.color} ${element.size} opacity-20`} />
            </motion.div>
          );
        })}

        {/* Luxury accent overlay */}
        <div
          className={`absolute inset-0 ${design.luxuryAccent} mix-blend-overlay`}
        />

        {/* Animated wave effect */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 2, delay: 0.5 }}
            fill="rgba(255,255,255,0.1)"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,165.3C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        {/* Content container */}
        <div className="relative z-10 flex flex-col justify-between p-8 w-full">
          {/* Logo + name with animation */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-10"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="relative"
            >
              <img
                src="/logo.jpeg"
                alt="SIGETH"
                className="w-12 h-12 rounded-xl object-cover shadow-2xl ring-4 ring-white/20"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </motion.div>
            <div>
              <span className="text-lg font-bold text-white tracking-wide">
                {t("hotelName")}
              </span>
              <span className="block text-xs text-white/60 tracking-widest uppercase">
                {t("hotelManagement")}
              </span>
            </div>
          </motion.div>

          {/* Main content with staggered animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            {/* Icon with animation */}
            <motion.div
              variants={itemVariants}
              className="relative mb-4"
              animate={{
                rotateY: [0, 10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="relative inline-block">
                <div
                  className={`absolute inset-0 ${design.decorCircle1} rounded-full blur-2xl`}
                />
                <SubIcon
                  className="relative w-16 h-16 text-white/90"
                  strokeWidth={1.5}
                />
              </div>
            </motion.div>

            {/* Branding text with enhanced typography */}
            <motion.h1
              variants={itemVariants}
              className={`text-white leading-tight mb-4 text-3xl lg:text-4xl font-bold`}
            >
              {t(design.brandingTitlePart1Key as TranslationKey)}{" "}
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 8px rgba(255,255,255,0.3)",
                    "0 0 16px rgba(255,255,255,0.6)",
                    "0 0 8px rgba(255,255,255,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="block font-bold bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent"
              >
                {t(design.brandingTitlePart2Key as TranslationKey)}
              </motion.span>
              <span className="text-white/80">
                {t(design.brandingTitlePart3Key as TranslationKey)}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={`text-white/80 leading-relaxed max-w-lg text-xs lg:text-sm font-light mb-4`}
            >
              {t(design.brandingDescriptionKey as TranslationKey)}
            </motion.p>

            {/* Feature list with hover effects */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6"
            >
              {design.features.map((featureKey, index) => (
                <motion.div
                  key={featureKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden rounded-xl p-3 backdrop-blur-sm cursor-default group"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 rounded-xl border border-white/10" />

                  {/* Animated glow effect on hover */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-3">
                    {/* Icon container with animation */}
                    <motion.div
                      className={`relative flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${design.gradientFrom} ${design.gradientTo} flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      <Check size={20} className="text-white/90" />
                      <motion.div
                        className="absolute inset-1 rounded-md border border-white/30"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block text-sm font-semibold text-white leading-tight`}
                      >
                        {t(featureKey as TranslationKey)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Footer with animation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-white/40 text-sm font-light"
          >
            © 2026 SIGETH — {t("allRightsReserved")}
          </motion.p>
        </div>
      </motion.div>

      {/* ───── Right form panel with enhanced UI ───── */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        className={`w-full lg:w-1/2 flex flex-col bg-gradient-to-br ${
          dark
            ? "from-gray-950 via-gray-900 to-gray-950"
            : "from-white via-gray-50 to-white"
        } transition-colors duration-300 relative overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute top-0 right-0 w-96 h-96 ${design.ambientGlow1} rounded-full blur-3xl`}
          />
          <div
            className={`absolute bottom-0 left-0 w-96 h-96 ${design.ambientGlow2} rounded-full blur-3xl`}
          />
        </div>

        {/* Top bar with enhanced styling */}
        <div className="relative z-10 flex justify-between items-center px-8 py-4 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30 bg-gradient-to-r from-white/50 to-gray-50/30 dark:from-gray-900/50 dark:to-gray-800/30">
          {/* Back button with modern styling */}
          <motion.button
            whileHover={{ x: -3, scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/front-office")}
            className="relative group flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {/* Subtle hover background */}
            <div className="absolute inset-0 -z-10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100/40 dark:bg-gray-800/40" />

            <motion.div
              className="relative"
              whileHover={{ rotate: -15, x: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowLeft
                size={16}
                className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              />
            </motion.div>
            <span className="hidden sm:inline">{t("back")}</span>
          </motion.button>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Dark mode toggle - Premium style */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={toggleDark}
              className="relative group p-2.5 rounded-lg bg-gradient-to-br from-yellow-100/50 to-amber-100/50 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm text-yellow-600 dark:text-blue-300 hover:shadow-lg transition-all border border-yellow-200/50 dark:border-gray-600/50"
              aria-label="Toggle dark mode"
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute -inset-1 rounded-lg bg-gradient-to-r from-yellow-400/0 to-amber-400/0 blur opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.5 }}
              />
              <motion.div
                className="relative"
                animate={{ rotate: dark ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {dark ? t("lightMode") : t("darkMode")}
              </div>
            </motion.button>

            {/* Language selector - Match Header style */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={toggleLang}
              className="relative group px-3 py-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2 border border-blue-200/50 dark:border-blue-700/30"
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
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {lang === "en" ? "EN" : "FR"}
              </span>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {lang === "en" ? t("englishLanguage") : t("frenchLanguage")}
              </div>
            </motion.button>
          </div>
        </div>

        {/* Centered form with animations */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Mobile-only logo */}
            <motion.div
              variants={itemVariants}
              className="lg:hidden flex items-center gap-3 mb-6 justify-center"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{
                  type: "spring" as const,
                  stiffness: 200,
                  damping: 10,
                }}
                className="relative"
              >
                <img
                  src="/logo.jpeg"
                  alt="SIGETH"
                  className="w-12 h-12 rounded-xl object-cover shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("hotelName")}
              </span>
            </motion.div>

            {/* Enhanced submodule badge with animation */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`flex items-center gap-3 mb-4 p-3 rounded-2xl ${design.accentBgLight} dark:${design.accentBgDark} border ${design.accentBorder} dark:${design.accentBorderDark} backdrop-blur-sm transition-all cursor-default shadow-xl`}
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${design.gradientFrom} ${design.gradientTo} flex items-center justify-center shadow-lg`}
              >
                <SubIcon size={20} className="text-white" />
              </motion.div>
              <div>
                <span
                  className={`text-xs uppercase tracking-wider font-bold ${design.accentText} dark:${design.accentTextDark} opacity-75`}
                >
                  {t("signInAs")}
                </span>
                <span
                  className={`block text-base font-bold ${design.accentText} dark:${design.accentTextDark}`}
                >
                  {t(design.labelKey as TranslationKey)}
                </span>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="ml-auto"
              >
                <SubIcon
                  size={20}
                  className={`${design.accentText} dark:${design.accentTextDark} opacity-40`}
                />
              </motion.div>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={itemVariants} className="mb-4">
              <h2
                className={`text-2xl font-bold text-gray-900 dark:text-white mb-1`}
              >
                {t("loginTitle")}
              </h2>
              <p className={`text-gray-500 dark:text-gray-400 text-sm`}>
                {t(design.descriptionKey as TranslationKey)}
              </p>
            </motion.div>

            {/* Enhanced demo credentials banner */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative overflow-hidden p-3 mb-4 rounded-2xl ${design.accentBgLight} dark:${design.accentBgDark} border ${design.accentBorder} dark:${design.accentBorderDark} cursor-default`}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <Shield
                    className={`w-5 h-5 ${design.accentText} dark:${design.accentTextDark}`}
                  />
                  <span
                    className={`text-sm font-semibold ${design.accentText} dark:${design.accentTextDark}`}
                  >
                    {t("demoAccounts")}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={fillDemoCredentials}
                  className={`text-xs px-4 py-1.5 rounded-full ${design.accentBgDark} ${design.accentTextDark} hover:${design.accentBgDark} transition-all font-medium shadow-sm`}
                >
                  {t("autoFill")}
                </motion.button>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("demoUsername")}
                  </span>
                  <code
                    className={`${design.accentText} dark:${design.accentTextDark} font-mono font-semibold bg-white/50 dark:bg-black/20 px-2 py-1 rounded`}
                  >
                    {design.demoUser}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("demoPassword")}
                  </span>
                  <code
                    className={`${design.accentText} dark:${design.accentTextDark} font-mono font-semibold bg-white/50 dark:bg-black/20 px-2 py-1 rounded`}
                  >
                    {design.demoPass}
                  </code>
                </div>
              </div>
            </motion.div>

            {/* Error alert with animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-300"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced login form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Username field */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2`}
                >
                  {t("username")}
                </label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setIsFocused("username")}
                    onBlur={() => setIsFocused(null)}
                    required
                    autoComplete="username"
                    placeholder={t("usernamePlaceholder")}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500
                      ${
                        isFocused === "username"
                          ? `border-${design.accentColor}-500 ring-4 ring-${design.accentColor}-500/20`
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                  />
                  <motion.div
                    animate={{ scale: isFocused === "username" ? 1 : 0 }}
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r ${design.gradientFrom} ${design.gradientTo} rounded-full`}
                  />
                </motion.div>
              </motion.div>

              {/* Password field */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2`}
                >
                  {t("password")}
                </label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused("password")}
                    onBlur={() => setIsFocused(null)}
                    required
                    autoComplete="current-password"
                    placeholder={t("passwordPlaceholder")}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500
                      ${
                        isFocused === "password"
                          ? `border-${design.accentColor}-500 ring-4 ring-${design.accentColor}-500/20`
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                  <motion.div
                    animate={{ scale: isFocused === "password" ? 1 : 0 }}
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r ${design.gradientFrom} ${design.gradientTo} rounded-full`}
                  />
                </motion.div>
              </motion.div>

              {/* Submit button with enhanced animation */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className={`relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group
                    bg-gradient-to-r ${design.gradientFrom} ${design.gradientTo} text-white
                    hover:shadow-2xl hover:shadow-${design.accentColor}-500/25
                  `}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                  />

                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn
                        size={20}
                        className="group-hover:rotate-12 transition-transform"
                      />
                      <span>{t("loginButton")}</span>
                      <ChevronRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Demo credentials reminder */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t("secureLoginMessage")}
              </p>
            </motion.div>

            {/* Mobile footer */}
            <motion.p
              variants={itemVariants}
              className="lg:hidden text-center text-xs text-gray-400 dark:text-gray-500 mt-8 font-light"
            >
              © 2026 SIGETH — {t("allRightsReserved")}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
