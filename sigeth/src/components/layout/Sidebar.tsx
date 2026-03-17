import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BedDouble,
  Brush,
  UtensilsCrossed,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileEdit,
  BarChart3,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useAuth } from "../../context/AuthContext";
import type { TranslationKey } from "../../i18n/translations";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  labelKey: TranslationKey;
}

interface NavSection {
  id: string;
  labelKey: TranslationKey;
  icon: typeof BedDouble;
  forms: NavItem[];
  reports: NavItem[];
}

const sections: NavSection[] = [
  {
    id: "rooms-attendant",
    labelKey: "roomsAttendant",
    icon: BedDouble,
    forms: [
      {
        path: "/rooms-attendant/group-reservation",
        labelKey: "groupReservation",
      },
      {
        path: "/rooms-attendant/individual-reservation",
        labelKey: "individualReservation",
      },
      {
        path: "/rooms-attendant/group-member-reservation",
        labelKey: "groupMemberReservation",
      },
      {
        path: "/rooms-attendant/checkin-reservation",
        labelKey: "checkInWithReservation",
      },
      { path: "/rooms-attendant/twin-recording", labelKey: "twinRecording" },
      {
        path: "/rooms-attendant/checkin-no-reservation",
        labelKey: "checkInWithoutReservation",
      },
      {
        path: "/rooms-attendant/checkin-group",
        labelKey: "checkInGroupReservation",
      },
      {
        path: "/rooms-attendant/checkout",
        labelKey: "checkedOutRooms",
      },
      { path: "/rooms-attendant/find-room", labelKey: "findRoom" },
      { path: "/rooms-attendant/move-guest", labelKey: "moveGuest" },
      { path: "/rooms-attendant/invoice-preview", labelKey: "invoicePreview" },
    ],
    reports: [
      { path: "/rooms-attendant/arrival-on", labelKey: "arrivalOn" },
      { path: "/rooms-attendant/arrival-off", labelKey: "arrivalOff" },
      { path: "/rooms-attendant/vacant-rooms", labelKey: "vacantRooms" },
      { path: "/rooms-attendant/occupied-rooms", labelKey: "occupiedRooms" },
      {
        path: "/rooms-attendant/checked-out-rooms",
        labelKey: "checkedOutRooms",
      },
      {
        path: "/rooms-attendant/daily-consumptions",
        labelKey: "dailyConsumptions",
      },
      { path: "/rooms-attendant/invoice-by-guest", labelKey: "invoiceByGuest" },
      { path: "/rooms-attendant/invoice-by-group", labelKey: "invoiceByGroup" },
    ],
  },
  {
    id: "housekeeping",
    labelKey: "housekeeping",
    icon: Brush,
    forms: [
      { path: "/housekeeping/room-board", labelKey: "roomBoard" },
      { path: "/housekeeping/room-categories", labelKey: "roomCategories" },
      { path: "/housekeeping/rooms-repertory", labelKey: "roomsRepertory" },
      { path: "/housekeeping/staff", labelKey: "housekeepingStaff" },
      { path: "/housekeeping/daily-dispatching", labelKey: "dailyDispatching" },
      { path: "/housekeeping/room-status", labelKey: "roomStatus" },
      {
        path: "/housekeeping/laundry-categories",
        labelKey: "laundryCategories",
      },
      { path: "/housekeeping/laundry-services", labelKey: "laundryServices" },
      { path: "/housekeeping/laundry-order", labelKey: "laundryOrder" },
      { path: "/housekeeping/request-note", labelKey: "requestNote" },
    ],
    reports: [
      { path: "/housekeeping/list-rooms", labelKey: "listRooms" },
      { path: "/housekeeping/list-staff", labelKey: "listStaff" },
      { path: "/housekeeping/daily-room-report", labelKey: "dailyRoomReport" },
      { path: "/housekeeping/laundry-journal", labelKey: "laundryJournal" },
      { path: "/housekeeping/request-follow-up", labelKey: "requestFollowUp" },
    ],
  },
  {
    id: "banqueting",
    labelKey: "banqueting",
    icon: UtensilsCrossed,
    forms: [
      { path: "/banqueting/events-lots", labelKey: "eventsLots" },
      { path: "/banqueting/services-prices", labelKey: "servicesPrices" },
      { path: "/banqueting/orders", labelKey: "banquetOrders" },
      { path: "/banqueting/request-note", labelKey: "banquetRequestNote" },
    ],
    reports: [
      { path: "/banqueting/services-list", labelKey: "servicesList" },
      { path: "/banqueting/service-follow-up", labelKey: "serviceFollowUp" },
      {
        path: "/banqueting/request-follow-up",
        labelKey: "banquetRequestFollowUp",
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "rooms-attendant": true,
  });
  const [openSubSections, setOpenSubSections] = useState<
    Record<string, boolean>
  >({});

  // Filter sections based on user role
  const LEVEL_SECTIONS: Record<string, string[]> = {
    Manager_R: ["rooms-attendant"],
    Manager_H: ["housekeeping"],
    Manager_B: ["banqueting"],
  };
  const allowedIds = user ? (LEVEL_SECTIONS[user.level] ?? []) : [];
  const visibleSections = sections.filter((s) => allowedIds.includes(s.id));

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSub = (key: string) =>
    setOpenSubSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 truncate ${
      isActive
        ? "bg-blue-600/30 text-blue-100 font-semibold border border-blue-400/50 shadow-lg shadow-blue-500/20"
        : "text-blue-200/70 hover:bg-blue-600/15 hover:text-blue-100 border border-transparent hover:border-blue-400/30"
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 z-40 border-r border-blue-500/20 shadow-2xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Hotel branding */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/15 via-blue-500/10 to-transparent backdrop-blur-sm">
        <img
          src="/logo.jpeg"
          alt="SIGETH"
          className="w-10 h-10 rounded-xl object-cover shrink-0 ring-2 ring-blue-400/40 shadow-lg hover:ring-blue-300/60 transition-all"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold leading-tight text-sm bg-gradient-to-r from-blue-100 via-blue-50 to-white bg-clip-text text-transparent">
              {t("hotelName")}
            </h1>
            <p className="text-xs text-blue-300/70">{t("moduleName")}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-1">
        {visibleSections.map((section) => {
          const isOpen = !!openSections[section.id];
          const Icon = section.icon;
          return (
            <div key={section.id}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-blue-100 hover:bg-blue-600/20 hover:text-blue-50 transition-all duration-200 border border-blue-500/20 hover:border-blue-400/50 rounded-lg mx-1 my-0.5 group"
              >
                <Icon size={18} className="shrink-0 text-blue-300 group-hover:text-blue-200 transition-colors" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-semibold flex-1 truncate">
                      {t(section.labelKey)}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-blue-300/60 group-hover:text-blue-200 transition-colors" />
                    ) : (
                      <ChevronDown size={14} className="text-blue-300/60 group-hover:text-blue-200 transition-colors" />
                    )}
                  </>
                )}
              </button>

              {/* Expanded content */}
              {isOpen && !collapsed && (
                <div className="ml-2 pl-3 border-l border-blue-500/30 space-y-1.5 my-2">
                  {/* Forms subsection */}
                  <button
                    onClick={() => toggleSub(`${section.id}-forms`)}
                    className="flex items-center gap-2 w-full px-2 py-2 text-xs font-semibold text-blue-300/80 uppercase tracking-wider hover:text-blue-100 transition-colors rounded hover:bg-blue-600/15 group"
                  >
                    <FileEdit size={12} className="text-blue-400/60 group-hover:text-blue-300" />
                    <span className="flex-1 text-left">{t("forms")}</span>
                    {openSubSections[`${section.id}-forms`] ? (
                      <ChevronUp size={12} className="text-blue-400/60 group-hover:text-blue-300" />
                    ) : (
                      <ChevronDown size={12} className="text-blue-400/60 group-hover:text-blue-300" />
                    )}
                  </button>
                  {openSubSections[`${section.id}-forms`] &&
                    section.forms.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={linkClass}
                      >
                        {t(item.labelKey)}
                      </NavLink>
                    ))}

                  {/* Reports subsection */}
                  <button
                    onClick={() => toggleSub(`${section.id}-reports`)}
                    className="flex items-center gap-2 w-full px-2 py-2 text-xs font-semibold text-blue-300/80 uppercase tracking-wider hover:text-blue-100 transition-colors rounded hover:bg-blue-600/15 group"
                  >
                    <BarChart3 size={12} className="text-blue-400/60 group-hover:text-blue-300" />
                    <span className="flex-1 text-left">{t("reports")}</span>
                    {openSubSections[`${section.id}-reports`] ? (
                      <ChevronUp size={12} className="text-blue-400/60 group-hover:text-blue-300" />
                    ) : (
                      <ChevronDown size={12} className="text-blue-400/60 group-hover:text-blue-300" />
                    )}
                  </button>
                  {openSubSections[`${section.id}-reports`] &&
                    section.reports.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={linkClass}
                      >
                        {t(item.labelKey)}
                      </NavLink>
                    ))}
                </div>
              )}
            </div>
          );
        })}

      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 px-5 py-3 mx-2 mb-2 rounded-lg text-blue-300/70 hover:bg-blue-600/20 hover:text-blue-100 transition-all duration-200 border border-blue-500/30 hover:border-blue-400/50 group"
      >
        {collapsed ? <ChevronRight size={20} className="text-blue-400/60 group-hover:text-blue-300" /> : <ChevronLeft size={20} className="text-blue-400/60 group-hover:text-blue-300" />}
        {!collapsed && <span className="text-sm font-medium">{t("collapse")}</span>}
      </button>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-5 py-4 border-t border-blue-500/20 text-blue-300/70 hover:bg-red-600/20 hover:text-red-200 transition-all duration-200 group"
      >
        <LogOut size={20} className="shrink-0 text-red-400/60 group-hover:text-red-300" />
        {!collapsed && (
          <span className="text-sm font-medium">{t("logout")}</span>
        )}
      </button>
    </aside>
  );
}
