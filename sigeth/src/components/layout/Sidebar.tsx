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
    `flex items-center gap-2 px-3 py-1.5 text-xs transition-colors duration-200 truncate border-l-3 pl-2 ${
      isActive
        ? "bg-white/10 text-white font-medium border-l-3 border-l-[#B8860B]"
        : "text-gray-300 hover:text-white hover:bg-white/5 border-l-3 border-l-transparent"
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#2C3E50] text-white flex flex-col transition-all duration-300 z-40 border-r border-gray-700 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Hotel branding */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <img
          src="/logo.jpeg"
          alt="SIGETH"
          className="w-9 h-9 rounded object-cover shrink-0"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-serif font-bold text-sm text-white leading-tight">
              {t("hotelName")}
            </h1>
            <p className="text-xs text-gray-400">{t("moduleName")}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleSections.map((section) => {
          const isOpen = !!openSections[section.id];
          return (
            <div key={section.id}>
              {/* Section header - just text, no icon */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-200 hover:text-white transition-colors duration-200"
              >
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 truncate">
                      {t(section.labelKey)}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </>
                )}
              </button>

              {/* Expanded content */}
              {isOpen && !collapsed && (
                <div className="pl-0 space-y-0.5 my-1">
                  {/* Forms subsection */}
                  <button
                    onClick={() => toggleSub(`${section.id}-forms`)}
                    className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <span className="flex-1 text-left">{t("forms")}</span>
                    {openSubSections[`${section.id}-forms`] ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
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
                    className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <span className="flex-1 text-left">{t("reports")}</span>
                    {openSubSections[`${section.id}-reports`] ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
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
        className="flex items-center justify-center gap-2 px-4 py-3 text-gray-400 hover:text-white transition-colors duration-200 border-t border-gray-700"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span className="text-xs font-medium">{t("collapse")}</span>}
      </button>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-4 border-t border-gray-700 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <LogOut size={18} className="shrink-0" />
        {!collapsed && (
          <span className="text-xs font-medium">{t("logout")}</span>
        )}
      </button>
    </aside>
  );
}
