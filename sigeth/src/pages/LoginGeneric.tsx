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

// Demo credentials - customize as needed
const DEMO_CREDENTIALS = {
  username: "Rooms",
  password: "Guest",
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
      const defaultRoute =
        ROLE_ROUTES[authenticatedUser.submodule] ||
        "/rooms-attendant/group-reservation";
      navigate(defaultRoute, { replace: true });
    } catch (err: unknown) {
      const responseData =
        typeof err === "object" && err !== null && "response" in err
          ? (
              err as {
                response?: { data?: { detail?: string; message?: string } };
              }
            ).response?.data
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

  const fillDemoCredentials = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
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
      transition: { type: "spring" as const, stiffness: 100, damping: 12 },
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
            : "from-hotel-paper via-hotel-cream to-white"
        } bg-gradient-to-br`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ float: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${
              dark ? "bg-blue-500" : "bg-amber-300"
            }`}
          />
          <motion.div
            animate={{ float: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className={`absolute bottom-0 left-10 w-96 h-96 rounded-full blur-3xl opacity-10 ${
              dark ? "bg-slate-400" : "bg-amber-200"
            }`}
          />
        </div>

        {/* Logo Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 mb-12"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="/logo.jpeg"
                alt="SIGETH"
                className="w-16 h-16 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20"
              />
            </motion.div>
            <div>
              <h1
                className={`text-2xl font-display font-semibold mb-1 ${dark ? "text-white" : "text-hotel-text-primary"}`}
              >
                SIGETH
              </h1>
              <p
                className={`text-xs tracking-widest uppercase ${dark ? "text-slate-400" : "text-hotel-text-secondary"}`}
              >
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
                  : "bg-gradient-to-r from-hotel-gold to-hotel-gold-dark bg-clip-text text-transparent"
              }`}
            >
              Welcome to Excellence
            </h2>
            <p
              className={`text-lg leading-relaxed ${
                dark ? "text-slate-300" : "text-hotel-text-secondary"
              }`}
            >
              Streamline your hotel operations with our comprehensive management
              system. Designed for hoteliers who demand elegance, efficiency,
              and excellence.
            </p>
          </motion.div>

          {/* Features List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {[
              "Seamless Operations",
              "Guest Satisfaction",
              "Real-time Analytics",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    dark ? "bg-blue-400" : "bg-hotel-gold"
                  }`}
                />
                <span
                  className={
                    dark ? "text-slate-300" : "text-hotel-text-primary"
                  }
                >
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`text-sm ${dark ? "text-slate-500" : "text-hotel-text-secondary"}`}
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
            : "from-white via-hotel-paper to-white"
        } bg-gradient-to-br backdrop-blur-md relative overflow-hidden`}
      >
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 z-10">
          <img src="/logo.jpeg" alt="SIGETH" className="w-10 h-10 rounded-lg" />
          <span
            className={`font-semibold ${dark ? "text-white" : "text-hotel-text-primary"}`}
          >
            SIGETH
          </span>
        </div>

        {/* Top Controls Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`flex justify-end items-center gap-3 p-6 ${
            dark ? "border-slate-700/50" : "border-hotel-border"
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
                : "bg-hotel-cream text-hotel-gold hover:bg-hotel-paper"
            } backdrop-blur border ${dark ? "border-slate-700/50" : "border-hotel-border"}`}
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
                : "bg-white text-hotel-text-primary border-hotel-border hover:bg-hotel-paper"
            }`}
          >
            {lang === "en" ? (
              <>
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="EN"
                  className="w-4 h-2.5 rounded"
                />
                <span>EN</span>
              </>
            ) : (
              <>
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="FR"
                  className="w-4 h-2.5 rounded"
                />
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
                      : "bg-hotel-cream text-hotel-gold border-hotel-border"
                  }`}
                >
                  ✨ Welcome Back
                </span>
              </motion.div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  dark
                    ? "text-white"
                    : "bg-gradient-to-r from-hotel-gold to-hotel-gold-dark bg-clip-text text-transparent"
                }`}
              >
                Login
              </h1>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-hotel-text-secondary"}`}
              >
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
                    dark ? "text-slate-300" : "text-hotel-text-primary"
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
                          : "bg-white text-hotel-text-primary placeholder:text-hotel-text-secondary"
                      }
                      ${
                        isFocused === "username"
                          ? dark
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : "border-hotel-gold ring-2 ring-hotel-gold/30"
                          : dark
                            ? "border-slate-700 hover:border-slate-600"
                            : "border-hotel-border hover:border-hotel-gold"
                      }
                      backdrop-blur focus:outline-none`}
                  />
                </motion.div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    dark ? "text-slate-300" : "text-hotel-text-primary"
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
                          : "bg-white text-hotel-text-primary placeholder:text-hotel-text-secondary"
                      }
                      ${
                        isFocused === "password"
                          ? dark
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : "border-hotel-gold ring-2 ring-hotel-gold/30"
                          : dark
                            ? "border-slate-700 hover:border-slate-600"
                            : "border-hotel-border hover:border-hotel-gold"
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
                    : "bg-gradient-to-r from-hotel-gold to-hotel-gold-dark text-white border-hotel-gold hover:from-hotel-gold-dark hover:to-hotel-gold disabled:opacity-50"
                }`}
              >
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <LogIn size={18} />
                </motion.div>
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Demo Credentials Info */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-lg text-xs text-center ${
                dark ? "bg-slate-800/50" : "bg-hotel-cream"
              } backdrop-blur border ${dark ? "border-slate-700/50" : "border-hotel-border"}`}
            >
              <p
                className={
                  dark
                    ? "text-slate-400 mb-3"
                    : "text-hotel-text-secondary mb-3"
                }
              >
                Demo Account Available
              </p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-hotel-gold dark:text-amber-400 hover:underline font-semibold"
              >
                Click here to auto-fill demo credentials
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`text-center py-4 text-xs ${
            dark ? "text-slate-500" : "text-hotel-text-secondary"
          } border-t ${dark ? "border-slate-700/50" : "border-hotel-border"}`}
        >
          © 2026 SIGETH. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
}
