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
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors truncate ${
      isActive
        ? "bg-amber-500/15 text-amber-400 font-medium"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#1e1e2d] text-white flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Hotel branding */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <img
          src="/logo.jpeg"
          alt="SIGETH"
          className="w-10 h-10 rounded-lg object-cover shrink-0"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-[Playfair_Display] text-lg font-bold leading-tight">
              {t("hotelName")}
            </h1>
            <p className="text-xs text-gray-400">{t("moduleName")}</p>
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
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-gray-300 hover:bg-white/5 transition-colors"
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-semibold flex-1 truncate">
                      {t(section.labelKey)}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </>
                )}
              </button>

              {/* Expanded content */}
              {isOpen && !collapsed && (
                <div className="ml-4 pl-3 border-l border-white/10 space-y-1">
                  {/* Forms subsection */}
                  <button
                    onClick={() => toggleSub(`${section.id}-forms`)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <FileEdit size={12} />
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
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                  >
                    <BarChart3 size={12} />
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

        {/* Cashier section removed — will be included later */}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 px-5 py-3 mx-2 mb-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        {!collapsed && <span className="text-sm">Collapse</span>}
      </button>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-5 py-4 border-t border-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <LogOut size={20} className="shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium">{t("logout")}</span>
        )}
      </button>
    </aside>
  );
}
