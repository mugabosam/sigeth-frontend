import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../hooks/useLang";
import { useAuth } from "../context/AuthContext";

// Default routes for each role
const ROLE_ROUTES: Record<string, string> = {
  "rooms-attendant": "/rooms-attendant/group-reservation",
  housekeeping: "/housekeeping/room-categories",
  banqueting: "/banqueting/events-lots",
};

export default function Login() {
  const { t, lang, dark, toggleDark, toggleLang } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authenticatedUser = await login(username, password);
      const defaultRoute = ROLE_ROUTES[authenticatedUser.submodule] || "/rooms-attendant/group-reservation";
      navigate(defaultRoute, { replace: true });
    } catch (err: unknown) {
      const responseData =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data
          : undefined;

      if (
        responseData &&
        typeof (responseData.detail ?? responseData.message) === "string"
      ) {
        setError((responseData.detail ?? responseData.message) as string);
      } else {
        setError(t("loginError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <div className={`min-h-screen flex ${dark ? "dark" : ""} overflow-hidden`}>
      {/* Left - Elegant Brand Section */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden ${
          dark
            ? "from-slate-900 via-slate-800 to-slate-900"
            : "from-slate-50 via-blue-50/30 to-white"
        } bg-gradient-to-br`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ float: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${
              dark ? "bg-blue-500" : "bg-blue-300"
            }`}
          />
          <motion.div
            animate={{ float: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className={`absolute bottom-0 left-10 w-96 h-96 rounded-full blur-3xl opacity-10 ${
              dark ? "bg-slate-400" : "bg-slate-300"
            }`}
          />
        </div>

        {/* Logo Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10">
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-12">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className="relative">
              <img
                src="/logo.jpeg"
                alt="SIGETH"
                className="w-16 h-16 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20"
              />
            </motion.div>
            <div>
              <h1 className={`text-2xl font-semibold mb-1 ${dark ? "text-white" : "text-slate-900"}`}>
                SIGETH
              </h1>
              <p className={`text-xs tracking-widest uppercase ${dark ? "text-slate-400" : "text-slate-600"}`}>
                Hotel Management Suite
              </p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2
              className={`text-4xl font-bold mb-6 leading-tight ${
                dark
                  ? "text-white"
                  : "bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
              }`}
            >
              Welcome to Excellence
            </h2>
            <p
              className={`text-lg leading-relaxed ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Streamline your hotel operations with our comprehensive management system. Designed for hoteliers who demand elegance, efficiency, and excellence.
            </p>
          </motion.div>

          {/* Features List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {["Seamless Operations", "Guest Satisfaction", "Real-time Analytics"].map(
              (feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      dark ? "bg-blue-400" : "bg-blue-500"
                    }`}
                  />
                  <span className={dark ? "text-slate-300" : "text-slate-700"}>
                    {feature}
                  </span>
                </motion.div>
              )
            )}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`text-sm ${
            dark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          © 2026 SIGETH. Excellence in hospitality management.
        </motion.p>
      </motion.div>

      {/* Right - Login Form Section */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`w-full lg:w-7/12 flex flex-col justify-between ${
          dark
            ? "from-white/5 to-white/5"
            : "from-white via-blue-50/20 to-white"
        } bg-gradient-to-br backdrop-blur-md relative overflow-hidden`}
      >
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 z-10">
          <img src="/logo.jpeg" alt="SIGETH" className="w-10 h-10 rounded-lg" />
          <span className={`font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
            SIGETH
          </span>
        </div>

        {/* Top Controls Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`flex justify-end items-center gap-3 p-6 ${
            dark ? "border-slate-700/50" : "border-slate-200/50"
          } border-b backdrop-blur-sm`}
        >
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDark}
            className={`p-2.5 rounded-lg transition-all ${
              dark
                ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                : "bg-blue-100/50 text-amber-600 hover:bg-blue-100"
            } backdrop-blur border ${
              dark ? "border-slate-700/50" : "border-blue-200/50"
            }`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLang}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold backdrop-blur border ${
              dark
                ? "bg-slate-800 text-slate-300 border-slate-700/50 hover:bg-slate-700"
                : "bg-white/50 text-blue-700 border-blue-200/50 hover:bg-white/70"
            }`}
          >
            {lang === "en" ? (
              <>
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-4 h-2.5 rounded" />
                <span>EN</span>
              </>
            ) : (
              <>
                <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-4 h-2.5 rounded" />
                <span>FR</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="mb-8 text-center">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-3"
              >
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur border ${
                    dark
                      ? "bg-blue-900/40 text-blue-300 border-blue-700/50"
                      : "bg-blue-100/60 text-blue-700 border-blue-200/80"
                  }`}
                >
                  ✨ Welcome Back
                </span>
              </motion.div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  dark
                    ? "text-white"
                    : "bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
                }`}
              >
                Login
              </h1>
              <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>
                Access your hotel management dashboard
              </p>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-3 p-4 mb-6 rounded-xl border backdrop-blur ${
                    dark
                      ? "bg-red-900/30 border-red-700/50 text-red-300"
                      : "bg-red-50/80 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Username Input */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    dark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Username
                </label>
                <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setIsFocused("username")}
                    onBlur={() => setIsFocused(null)}
                    required
                    placeholder="Enter your username"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-sm 
                      ${
                        dark
                          ? "bg-slate-800/50 text-white placeholder:text-slate-500"
                          : "bg-white/70 text-slate-900 placeholder:text-slate-400"
                      }
                      ${
                        isFocused === "username"
                          ? dark
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : "border-blue-400 ring-2 ring-blue-400/30"
                          : dark
                          ? "border-slate-700 hover:border-slate-600"
                          : "border-slate-200 hover:border-slate-300"
                      }
                      backdrop-blur focus:outline-none`}
                  />
                </motion.div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    dark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Password
                </label>
                <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused("password")}
                    onBlur={() => setIsFocused(null)}
                    required
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all text-sm 
                      ${
                        dark
                          ? "bg-slate-800/50 text-white placeholder:text-slate-500"
                          : "bg-white/70 text-slate-900 placeholder:text-slate-400"
                      }
                      ${
                        isFocused === "password"
                          ? dark
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : "border-blue-400 ring-2 ring-blue-400/30"
                          : dark
                          ? "border-slate-700 hover:border-slate-600"
                          : "border-slate-200 hover:border-slate-300"
                      }
                      backdrop-blur focus:outline-none`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                      dark
                        ? "text-slate-500 hover:text-slate-400"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-6 backdrop-blur border ${
                  dark
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500/50 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/50 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                }`}
              >
                <motion.div animate={{ rotate: loading ? 360 : 0 }} transition={{ duration: 1, repeat: Infinity }}>
                  <LogIn size={18} />
                </motion.div>
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Demo Credentials Info */}
            <motion.div
              variants={itemVariants}
              className={`p-4 rounded-lg text-xs text-center ${
                dark ? "bg-slate-800/50" : "bg-blue-50/60"
              } backdrop-blur border ${
                dark ? "border-slate-700/50" : "border-blue-200/50"
              }`}
            >
              <p className={dark ? "text-slate-400" : "text-slate-600"}>
                Demo: <span className="font-semibold">Rooms</span> / <span className="font-semibold">Guest</span>
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`text-center py-4 text-xs ${
            dark ? "text-slate-500" : "text-slate-400"
          } border-t ${dark ? "border-slate-700/50" : "border-slate-200/50"}`}
        >
          © 2026 SIGETH. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
}

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
    <div className={`min-h-screen flex ${dark ? "dark" : ""} overflow-hidden selection:bg-amber-300 dark:selection:bg-amber-600 selection:text-gray-950`}>
      {/* ───── Left branding panel with enhanced visuals ───── */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        className={`hidden lg:flex lg:w-5/12 relative overflow-hidden ${gradientClass} shadow-2xl`}
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
        className={`w-full lg:w-7/12 flex flex-col ${
          dark
            ? "from-gray-950 via-gray-900 to-black"
            : "from-gradient-start via-gradient-middle to-gradient-end"
        } bg-gradient-to-br ${dark ? "from-gray-950 via-gray-900 to-black" : "from-slate-50 via-white to-gray-50"} transition-colors duration-300 relative overflow-hidden`}
      >
        {/* Premium animated background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Gradient mesh animation */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-30 dark:opacity-10"
            style={{
              backgroundImage: `linear-gradient(45deg, 
                transparent 0%, 
                rgba(168, 85, 247, 0.1) 25%, 
                transparent 50%, 
                rgba(59, 130, 246, 0.1) 75%, 
                transparent 100%)`,
              backgroundSize: "400% 400%",
            }}
          />
          
          {/* Floating orbs */}
          <motion.div
            className="absolute top-12 right-12 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
            animate={{
              y: [-20, 20, -20],
              x: [10, -10, 10],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-12 -left-12 w-96 h-96 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl"
            animate={{
              y: [20, -20, 20],
              x: [-10, 10, -10],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Top bar with premium styling */}
        <div className="relative z-20 flex justify-between items-center px-8 py-4 backdrop-blur-md border-b border-white/10 dark:border-gray-800/20 bg-white/30 dark:bg-gray-950/30 flex-shrink-0">
          {/* Back button with modern styling */}
          <motion.button
            whileHover={{ x: -3, scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(isGenericLogin ? "/" : "/front-office")}
            className="relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {/* Subtle hover background */}
            <div className="absolute inset-0 -z-10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200/30 dark:bg-gray-700/30" />

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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark mode toggle - Premium style */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={toggleDark}
              className="relative group p-2.5 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-amber-600 dark:text-blue-300 hover:shadow-lg transition-all border border-white/40 dark:border-gray-700/40"
              aria-label="Toggle dark mode"
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute -inset-1.5 rounded-lg bg-gradient-to-r from-yellow-400/0 to-amber-400/0 blur opacity-0 group-hover:opacity-75 transition-opacity"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.75 }}
              />
              <motion.div
                className="relative"
                animate={{ rotate: dark ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </motion.button>

            {/* Language selector */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={toggleLang}
              className="relative group px-2.5 py-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1.5 border border-blue-200/50 dark:border-blue-700/30 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
            >
              {/* Flag image */}
              {lang === "en" ? (
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  className="w-4 h-2.5 rounded"
                />
              ) : (
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="Français"
                  className="w-4 h-2.5 rounded"
                />
              )}
              {/* Language code */}
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {lang === "en" ? "EN" : "FR"}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Centered form with animations */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-8 py-8 overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Mobile-only logo */}
            <motion.div
              variants={itemVariants}
              className="lg:hidden flex items-center gap-3 mb-8 justify-center"
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
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300" />
                <img
                  src="/logo.jpeg"
                  alt="SIGETH"
                  className="relative w-14 h-14 rounded-xl object-cover shadow-xl"
                />
              </motion.div>
              <div>
                <span className="block text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {t("hotelName")}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                  Suite Hôtelière
                </span>
              </div>
            </motion.div>

            {/* Welcome message */}
            <motion.div variants={itemVariants} className="mb-6 text-center">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-3 inline-block"
              >
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur border border-blue-200/50 dark:border-blue-800/50">
                  ✨ Welcome Back
                </span>
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-2">
                Hotel Management Suite
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your hotel operations efficiently
              </p>
            </motion.div>

            {/* Enhanced submodule badge with animation */}
            {!isGenericLogin && (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`flex items-center gap-3 mb-6 p-4 rounded-2xl ${design.accentBgLight} dark:${design.accentBgDark} border ${design.accentBorder} dark:${design.accentBorderDark} backdrop-blur-sm transition-all cursor-default shadow-lg`}
              >
                <motion.div
                  animate={{ rotate: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${design.gradientFrom} ${design.gradientTo} flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <SubIcon size={22} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <span
                    className={`text-xs uppercase tracking-widest font-bold ${design.accentText} dark:${design.accentTextDark} opacity-70`}
                  >
                    Department
                  </span>
                  <span
                    className={`block text-base font-bold ${design.accentText} dark:${design.accentTextDark}`}
                  >
                    {isGenericLogin ? t("user") : t(design.labelKey as TranslationKey)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error alert with animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 mb-6 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-300 backdrop-blur-sm"
                >
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <AlertCircle size={18} className="shrink-0" />
                  </motion.div>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced login form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Username field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                  {t("username")}
                </label>
                <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setIsFocused("username")}
                    onBlur={() => setIsFocused(null)}
                    required
                    autoComplete="username"
                    placeholder={t("usernamePlaceholder")}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none
                      ${
                        isFocused === "username"
                          ? "border-blue-500 ring-4 ring-blue-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                  />
                  <motion.div
                    animate={{ scale: isFocused === "username" ? 1 : 0 }}
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 rounded-full"
                  />
                </motion.div>
              </motion.div>

              {/* Password field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                  {t("password")}
                </label>
                <motion.div whileFocus={{ scale: 1.01 }} className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused("password")}
                    onBlur={() => setIsFocused(null)}
                    required
                    autoComplete="current-password"
                    placeholder={t("passwordPlaceholder")}
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none
                      ${
                        isFocused === "password"
                          ? "border-purple-500 ring-4 ring-purple-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                  <motion.div
                    animate={{ scale: isFocused === "password" ? 1 : 0 }}
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 rounded-full"
                  />
                </motion.div>
              </motion.div>

              {/* Submit button with enhanced animation */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className={`relative w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group
                    bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white
                    hover:shadow-2xl hover:shadow-blue-500/30 disabled:shadow-none
                  `}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 0.5,
                    }}
                  />

                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <LogIn size={20} />
                      </motion.div>
                      <span className="font-semibold">{t("loginButton")}</span>
                      <motion.div
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        <ChevronRight size={20} />
                      </motion.div>
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Demo credentials info box */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -1 }}
              className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-50/60 to-purple-50/60 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm"
            >
              {/* Animated shine on info box */}
              <motion.div
                className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {t("demoAccounts")} Available
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={fillDemoCredentials}
                    className="ml-auto text-xs px-3 py-1.5 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-lg"
                  >
                    {t("autoFill")}
                  </motion.button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">User:</span>
                    <code className="font-mono font-semibold text-blue-600 dark:text-blue-300 bg-white/40 dark:bg-gray-900/40 px-2 py-1 rounded">
                      {design.demoUser}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">Pass:</span>
                    <code className="font-mono font-semibold text-purple-600 dark:text-purple-300 bg-white/40 dark:bg-gray-900/40 px-2 py-1 rounded">
                      {design.demoPass}
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Footer message */}
            <motion.div variants={itemVariants} className="text-center mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Secure hotel management at your fingertips
              </p>
            </motion.div>

            {/* Mobile footer */}
            <motion.p
              variants={itemVariants}
              className="lg:hidden text-center text-xs text-gray-400 dark:text-gray-500 mt-6 font-light"
            >
              © 2026 SIGETH
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
