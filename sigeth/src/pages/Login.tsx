import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLang } from "../hooks/useLang";
import { useAuth } from "../context/AuthContext";

// Default routes for each role
const ROLE_ROUTES: Record<string, string> = {
  "rooms-attendant": "/rooms-attendant/group-reservation",
  housekeeping: "/housekeeping/room-categories",
  banqueting: "/banqueting/events-lots",
};

export default function Login() {
  const { t, lang, toggleLang } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F3EF' }}>
      {/* Left side - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-hotel-navy flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-4 mb-16">
            <img
              src="/logo.jpeg"
              alt="SIGETH"
              className="w-14 h-14 rounded object-cover"
            />
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                SIGETH
              </h1>
              <p className="text-xs text-gray-300 tracking-widest uppercase">
                Hotel Management
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-4 leading-tight">
                Professional Hotel Management
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Streamline your operations with a comprehensive management system
                designed for modern hoteliers.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Seamless reservations and check-ins",
                "Housekeeping and staff management",
                "Banqueting and event tracking",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-hotel-gold" />
                  <span className="text-sm text-gray-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          © 2026 SIGETH. All rights reserved.
        </p>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-between">
        {/* Top controls */}
        <div className="flex justify-between items-center p-4 border-b border-hotel-border">
          <div className="lg:hidden flex items-center gap-2">
            <img src="/logo.jpeg" alt="SIGETH" className="w-8 h-8 rounded" />
            <span className="text-sm font-semibold text-hotel-text-primary">
              SIGETH
            </span>
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-hotel-border rounded text-hotel-text-primary hover:bg-hotel-cream transition-colors"
          >
            {lang === "en" ? (
              <>
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="EN"
                  className="w-4 h-3 rounded"
                />
                <span>EN</span>
              </>
            ) : (
              <>
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="FR"
                  className="w-4 h-3 rounded"
                />
                <span>FR</span>
              </>
            )}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-hotel-text-primary mb-2">
                Login
              </h1>
              <p className="text-sm text-hotel-text-secondary">
                Access your hotel management dashboard
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-3 mb-6 rounded border border-red-200 bg-red-50">
                <AlertCircle size={16} className="text-hotel-danger shrink-0" />
                <span className="text-sm text-hotel-danger">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 border border-hotel-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 pr-10 border border-hotel-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-hotel-text-secondary hover:text-hotel-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded font-medium bg-hotel-gold text-white hover:bg-hotel-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6 text-sm"
              >
                <LogIn size={16} />
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-hotel-text-secondary border-t border-hotel-border">
          © 2026 SIGETH. All rights reserved.
        </div>
      </div>
    </div>
  );
}
