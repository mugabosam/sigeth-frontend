import { Bell, Menu, X, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "../../hooks/useLang";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../hooks/useNotification";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const { notifications, markAsRead, clearAll } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleClearAll = () => {
    clearAll();
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
  };

  // Get user initials for avatar
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className={`h-14 bg-white flex items-center justify-between px-5 sticky top-0 z-30 transition-shadow duration-200 ${scrolled ? "shadow-sm" : ""}`}>
      {/* Left: menu + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded hover:bg-hotel-cream transition-colors lg:hidden"
          title="Menu"
        >
          <Menu size={18} className="text-hotel-text-secondary" />
        </button>
        <h2 className="text-lg font-display font-semibold text-hotel-text-primary">{title}</h2>
      </div>

      {/* Right: lang toggle, notifications, avatar */}
      <div className="flex items-center gap-3">
        {/* Language toggle with country flags */}
        <div className="relative group">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="p-1.5 rounded hover:bg-hotel-cream transition-colors flex items-center gap-1.5"
            title="Change language"
          >
            {lang === "en" ? (
              <>
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  className="w-5 h-3 rounded"
                />
                <span className="text-xs font-medium text-hotel-text-primary">EN</span>
              </>
            ) : (
              <>
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="Français"
                  className="w-5 h-3 rounded"
                />
                <span className="text-xs font-medium text-hotel-text-primary">FR</span>
              </>
            )}
          </button>
          {/* Language selector dropdown */}
          <div className="absolute right-0 mt-2 w-32 bg-white border border-hotel-border rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
            <button
              onClick={() => setLang("en")}
              className="w-full text-left px-3 py-2 hover:bg-hotel-cream flex items-center gap-2 border-b text-xs"
            >
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt="English"
                className="w-4 h-3 rounded"
              />
              <span>English</span>
            </button>
            <button
              onClick={() => setLang("fr")}
              className="w-full text-left px-3 py-2 hover:bg-hotel-cream flex items-center gap-2 text-xs"
            >
              <img
                src="https://flagcdn.com/w40/fr.png"
                alt="Français"
                className="w-4 h-3 rounded"
              />
              <span>Français</span>
            </button>
          </div>
        </div>

        {/* Notifications dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded hover:bg-hotel-cream transition-colors relative"
            title="Notifications"
          >
            <Bell size={18} className="text-hotel-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-hotel-danger text-white rounded-full flex items-center justify-center text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-72 bg-white border border-hotel-border rounded shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-hotel-paper">
                <h3 className="font-medium text-hotel-text-primary text-sm">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  title="Close notifications"
                  className="text-hotel-text-secondary hover:text-hotel-text-primary"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-hotel-text-secondary text-xs">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`px-4 py-3 border-b cursor-pointer transition-colors text-xs ${
                        notif.read
                          ? "hover:bg-hotel-cream"
                          : "bg-hotel-cream hover:bg-hotel-paper"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-hotel-gold uppercase">
                              {notif.module}
                            </span>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 bg-hotel-info rounded-full" />
                            )}
                          </div>
                          <p className="text-xs text-hotel-text-primary mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-hotel-text-secondary mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t bg-hotel-paper text-center">
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-hotel-gold hover:text-hotel-gold-dark font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-hotel-gold flex items-center justify-center text-white font-semibold hover:bg-hotel-gold-dark transition-colors"
            title="User profile"
          >
            {userInitial}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-11 w-60 bg-white border border-hotel-border rounded shadow-lg z-50">
              {/* Profile header */}
              <div className="px-4 py-4 border-b bg-hotel-paper">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-hotel-gold flex items-center justify-center text-white font-bold">
                    {userInitial}
                  </div>
                  <div>
                    <p className="font-medium text-hotel-text-primary text-sm">{user?.name}</p>
                    <p className="text-xs text-hotel-text-secondary">@{user?.username}</p>
                  </div>
                </div>
              </div>

              {/* Profile details */}
              <div className="px-4 py-3 space-y-3 border-b text-xs">
                <div>
                  <p className="font-semibold text-hotel-text-secondary uppercase">
                    Level
                  </p>
                  <p className="text-hotel-text-primary">{user?.level}</p>
                </div>
                <div>
                  <p className="font-semibold text-hotel-text-secondary uppercase">
                    Module
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 bg-hotel-cream text-hotel-gold rounded text-xs font-semibold">
                      {user?.submodule}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-2 py-2 space-y-1">
                <button
                  title="Open settings"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-hotel-text-primary hover:bg-hotel-cream transition-colors text-xs"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-hotel-danger hover:bg-red-50 transition-colors text-xs"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
