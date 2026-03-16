import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import ModuleSelection from "./pages/ModuleSelection";
import SubmoduleSelection from "./pages/SubmoduleSelection";

// ── 1.1 Rooms Attendant – Forms ──
import GroupReservation from "./pages/rooms-attendant/GroupReservation";
import IndividualReservation from "./pages/rooms-attendant/IndividualReservation";
import GroupMemberReservation from "./pages/rooms-attendant/GroupMemberReservation";
import CheckInReservation from "./pages/rooms-attendant/CheckInReservation";
import CheckInWalkIn from "./pages/rooms-attendant/CheckInWalkIn";
import CheckInGroup from "./pages/rooms-attendant/CheckInGroup";
import CheckOut from "./pages/rooms-attendant/CheckOut";
import TwinRecording from "./pages/rooms-attendant/TwinRecording";
import FindRoom from "./pages/rooms-attendant/FindRoom";
import MoveGuest from "./pages/rooms-attendant/MoveGuest";
import InvoicePreview from "./pages/rooms-attendant/InvoicePreview";

// ── 1.1 Rooms Attendant – Reports ──
import ArrivalOn from "./pages/rooms-attendant/ArrivalOn";
import ArrivalOff from "./pages/rooms-attendant/ArrivalOff";
import RoomsByStatus from "./pages/rooms-attendant/RoomsByStatus";
import DailyConsumptions from "./pages/rooms-attendant/DailyConsumptions";
import InvoiceByGuest from "./pages/rooms-attendant/InvoiceByGuest";
import InvoiceByGroup from "./pages/rooms-attendant/InvoiceByGroup";

// ── 1.2 Housekeeping – Forms ──
import RoomCategories from "./pages/housekeeping/RoomCategories";
import RoomsRepertory from "./pages/housekeeping/RoomsRepertory";
import HousekeepingStaff from "./pages/housekeeping/HousekeepingStaff";
import DailyDispatching from "./pages/housekeeping/DailyDispatching";
import RoomStatus from "./pages/housekeeping/RoomStatus";
import LaundryCategories from "./pages/housekeeping/LaundryCategories";
import LaundryServices from "./pages/housekeeping/LaundryServices";
import LaundryOrder from "./pages/housekeeping/LaundryOrder";
import RoomBoard from "./pages/housekeeping/RoomBoard";
import RequestNote from "./pages/housekeeping/RequestNote";

// ── 1.2 Housekeeping – Reports ──
import ListRooms from "./pages/housekeeping/ListRooms";
import ListStaff from "./pages/housekeeping/ListStaff";
import DailyRoomReport from "./pages/housekeeping/DailyRoomReport";
import LaundryJournal from "./pages/housekeeping/LaundryJournal";
import RequestFollowUp from "./pages/housekeeping/RequestFollowUp";

// ── 1.3 Banqueting – Forms ──
import EventsLots from "./pages/banqueting/EventsLots";
import ServicesPrices from "./pages/banqueting/ServicesPrices";
import BanquetOrders from "./pages/banqueting/BanquetOrders";

// ── 1.3 Banqueting – Reports ──
import ServicesList from "./pages/banqueting/ServicesList";
import ServiceFollowUp from "./pages/banqueting/ServiceFollowUp";
import BanquetRequestFollowUp from "./pages/banqueting/BanquetRequestFollowUp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<ModuleSelection />} />
        <Route path="/front-office" element={<SubmoduleSelection />} />
        <Route path="/login/:submodule" element={<Login />} />

        {/* ── Protected routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* ── 1.1 Rooms Attendant – Forms ── */}
            <Route
              path="/rooms-attendant/group-reservation"
              element={<GroupReservation />}
            />
            <Route
              path="/rooms-attendant/individual-reservation"
              element={<IndividualReservation mode="1112" />}
            />
            <Route
              path="/rooms-attendant/group-member-reservation"
              element={<GroupMemberReservation mode="1113" />}
            />
            <Route
              path="/rooms-attendant/checkin-reservation"
              element={<CheckInReservation />}
            />
            <Route
              path="/rooms-attendant/twin-recording"
              element={<TwinRecording />}
            />
            <Route
              path="/rooms-attendant/checkin-no-reservation"
              element={<CheckInWalkIn />}
            />
            <Route
              path="/rooms-attendant/checkin-group"
              element={<CheckInGroup />}
            />
            <Route
              path="/rooms-attendant/checkout"
              element={<CheckOut />}
            />
            <Route path="/rooms-attendant/find-room" element={<FindRoom />} />
            <Route path="/rooms-attendant/move-guest" element={<MoveGuest />} />
            <Route
              path="/rooms-attendant/invoice-preview"
              element={<InvoicePreview />}
            />

            {/* ── 1.1 Rooms Attendant – Reports ── */}
            <Route path="/rooms-attendant/arrival-on" element={<ArrivalOn />} />
            <Route
              path="/rooms-attendant/arrival-off"
              element={<ArrivalOff />}
            />
            <Route
              path="/rooms-attendant/vacant-rooms"
              element={<RoomsByStatus statusFilter="VC" />}
            />
            <Route
              path="/rooms-attendant/occupied-rooms"
              element={<RoomsByStatus statusFilter="OCC" />}
            />
            <Route
              path="/rooms-attendant/checked-out-rooms"
              element={<RoomsByStatus statusFilter="CO" />}
            />
            <Route
              path="/rooms-attendant/daily-consumptions"
              element={<DailyConsumptions />}
            />
            <Route
              path="/rooms-attendant/invoice-by-guest"
              element={<InvoiceByGuest />}
            />
            <Route
              path="/rooms-attendant/invoice-by-group"
              element={<InvoiceByGroup />}
            />

            {/* ── 1.2 Housekeeping – Forms ── */}
            <Route path="/housekeeping/room-board" element={<RoomBoard />} />
            <Route
              path="/housekeeping/room-categories"
              element={<RoomCategories />}
            />
            <Route
              path="/housekeeping/rooms-repertory"
              element={<RoomsRepertory />}
            />
            <Route path="/housekeeping/staff" element={<HousekeepingStaff />} />
            <Route
              path="/housekeeping/daily-dispatching"
              element={<DailyDispatching />}
            />
            <Route path="/housekeeping/room-status" element={<RoomStatus />} />
            <Route
              path="/housekeeping/laundry-categories"
              element={<LaundryCategories />}
            />
            <Route
              path="/housekeeping/laundry-services"
              element={<LaundryServices />}
            />
            <Route
              path="/housekeeping/laundry-order"
              element={<LaundryOrder />}
            />
            <Route
              path="/housekeeping/request-note"
              element={<RequestNote />}
            />

            {/* ── 1.2 Housekeeping – Reports ── */}
            <Route path="/housekeeping/list-rooms" element={<ListRooms />} />
            <Route path="/housekeeping/list-staff" element={<ListStaff />} />
            <Route
              path="/housekeeping/daily-room-report"
              element={<DailyRoomReport />}
            />
            <Route
              path="/housekeeping/laundry-journal"
              element={<LaundryJournal />}
            />
            <Route
              path="/housekeeping/request-follow-up"
              element={<RequestFollowUp />}
            />

            {/* ── 1.3 Banqueting – Forms ── */}
            <Route path="/banqueting/events-lots" element={<EventsLots />} />
            <Route
              path="/banqueting/services-prices"
              element={<ServicesPrices />}
            />
            <Route path="/banqueting/orders" element={<BanquetOrders />} />
            <Route
              path="/banqueting/request-note"
              element={<RequestNote posteDefault="Banqueting" />}
            />

            {/* ── 1.3 Banqueting – Reports ── */}
            <Route
              path="/banqueting/services-list"
              element={<ServicesList />}
            />
            <Route
              path="/banqueting/service-follow-up"
              element={<ServiceFollowUp />}
            />
            <Route
              path="/banqueting/request-follow-up"
              element={<BanquetRequestFollowUp />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
