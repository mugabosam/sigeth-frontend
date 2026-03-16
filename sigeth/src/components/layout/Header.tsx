import { Bell, Menu, X, LogOut, Settings } from "lucide-react";
import { useState } from "react";
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: menu + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          title="Menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      {/* Right: lang toggle, notifications, avatar */}
      <div className="flex items-center gap-3">
        {/* Language toggle with country flags */}
        <div className="relative group">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            title="Change language"
          >
            {lang === "en" ? (
              <>
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  className="w-6 h-4 rounded"
                />
                <span className="text-sm font-semibold">EN</span>
              </>
            ) : (
              <>
                <img
                  src="https://flagcdn.com/w40/fr.png"
                  alt="Français"
                  className="w-6 h-4 rounded"
                />
                <span className="text-sm font-semibold">FR</span>
              </>
            )}
          </button>
          {/* Language selector dropdown */}
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
            <button
              onClick={() => setLang("en")}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b"
            >
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt="English"
                className="w-4 h-3 rounded"
              />
              <span className="text-sm">English</span>
            </button>
            <button
              onClick={() => setLang("fr")}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
            >
              <img
                src="https://flagcdn.com/w40/fr.png"
                alt="Français"
                className="w-4 h-3 rounded"
              />
              <span className="text-sm">Français</span>
            </button>
          </div>
        </div>

        {/* Notifications dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  title="Close notifications"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`px-4 py-3 border-b cursor-pointer transition-colors ${
                        notif.read
                          ? "hover:bg-gray-50"
                          : "bg-blue-50 hover:bg-blue-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-amber-600 uppercase">
                              {notif.module}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-800 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t bg-gray-50 text-center">
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
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
            className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold hover:shadow-md transition-shadow"
            title="User profile"
          >
            {userInitial}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              {/* Profile header */}
              <div className="px-4 py-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                    {userInitial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                </div>
              </div>

              {/* Profile details */}
              <div className="px-4 py-3 space-y-3 border-b">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Level
                  </p>
                  <p className="text-sm text-gray-800">{user?.level}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Module
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                      {user?.submodule}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-2 py-2 space-y-1">
                <button
                  title="Open settings"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut size={16} />
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
