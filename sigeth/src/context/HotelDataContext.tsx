import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  RDF,
  RCS,
  RCSA,
  GRC,
  GRCA,
  StatusRef,
  InvoiceRecord,
  TEMPO,
  CATROOM,
  HSTAFF,
  RSTAFF,
  CATLAUNDRY,
  HSERVICE,
  JLAUNDRY,
  REQUIS,
  EventRecord,
  BanquetService,
  JBANQUET,
  SalesEntry,
  UserRecord,
  PaymentMode,
  Currency,
} from "../types";
import {
  mockRooms,
  mockReservations,
  mockReservationArchive,
  mockGroupReservations,
  mockGroupArchive,
  mockStatuses,
  mockInvoices,
  mockTempo,
  mockCatrooms,
  mockStaff,
  mockRstaff,
  mockCatlaundry,
  mockLaundryServices,
  mockJlaundry,
  mockRequisitions,
  mockEvents,
  mockBanquetServices,
  mockJbanquet,
  mockSales,
  mockUsers,
  mockPaymentModes,
  mockCurrencies,
} from "../utils/mockData";

interface HotelDataContextType {
  rooms: RDF[];
  setRooms: React.Dispatch<React.SetStateAction<RDF[]>>;
  reservations: RCS[];
  setReservations: React.Dispatch<React.SetStateAction<RCS[]>>;
  reservationArchive: RCSA[];
  setReservationArchive: React.Dispatch<React.SetStateAction<RCSA[]>>;
  groupReservations: GRC[];
  setGroupReservations: React.Dispatch<React.SetStateAction<GRC[]>>;
  groupArchive: GRCA[];
  setGroupArchive: React.Dispatch<React.SetStateAction<GRCA[]>>;
  statuses: StatusRef[];
  invoices: InvoiceRecord[];
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceRecord[]>>;
  tempo: TEMPO[];
  setTempo: React.Dispatch<React.SetStateAction<TEMPO[]>>;
  catrooms: CATROOM[];
  setCatrooms: React.Dispatch<React.SetStateAction<CATROOM[]>>;
  staff: HSTAFF[];
  setStaff: React.Dispatch<React.SetStateAction<HSTAFF[]>>;
  rstaff: RSTAFF[];
  setRstaff: React.Dispatch<React.SetStateAction<RSTAFF[]>>;
  catlaundry: CATLAUNDRY[];
  setCatlaundry: React.Dispatch<React.SetStateAction<CATLAUNDRY[]>>;
  laundryServices: HSERVICE[];
  setLaundryServices: React.Dispatch<React.SetStateAction<HSERVICE[]>>;
  jlaundry: JLAUNDRY[];
  setJlaundry: React.Dispatch<React.SetStateAction<JLAUNDRY[]>>;
  requisitions: REQUIS[];
  setRequisitions: React.Dispatch<React.SetStateAction<REQUIS[]>>;
  events: EventRecord[];
  setEvents: React.Dispatch<React.SetStateAction<EventRecord[]>>;
  banquetServices: BanquetService[];
  setBanquetServices: React.Dispatch<React.SetStateAction<BanquetService[]>>;
  jbanquet: JBANQUET[];
  setJbanquet: React.Dispatch<React.SetStateAction<JBANQUET[]>>;
  sales: SalesEntry[];
  setSales: React.Dispatch<React.SetStateAction<SalesEntry[]>>;
  users: UserRecord[];
  paymentModes: PaymentMode[];
  currencies: Currency[];
}

const HotelDataContext = createContext<HotelDataContextType | undefined>(
  undefined,
);

export function HotelDataProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<RDF[]>(() => [...mockRooms]);
  const [reservations, setReservations] = useState<RCS[]>(() => [
    ...mockReservations,
  ]);
  const [reservationArchive, setReservationArchive] = useState<RCSA[]>(() => [
    ...mockReservationArchive,
  ]);
  const [groupReservations, setGroupReservations] = useState<GRC[]>(() => [
    ...mockGroupReservations,
  ]);
  const [groupArchive, setGroupArchive] = useState<GRCA[]>(() => [
    ...mockGroupArchive,
  ]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => [
    ...mockInvoices,
  ]);
  const [tempo, setTempo] = useState<TEMPO[]>(() => [...mockTempo]);
  const [catrooms, setCatrooms] = useState<CATROOM[]>(() => [...mockCatrooms]);
  const [staff, setStaff] = useState<HSTAFF[]>(() => [...mockStaff]);
  const [rstaff, setRstaff] = useState<RSTAFF[]>(() => [...mockRstaff]);
  const [catlaundry, setCatlaundry] = useState<CATLAUNDRY[]>(() => [
    ...mockCatlaundry,
  ]);
  const [laundryServices, setLaundryServices] = useState<HSERVICE[]>(() => [
    ...mockLaundryServices,
  ]);
  const [jlaundry, setJlaundry] = useState<JLAUNDRY[]>(() => [...mockJlaundry]);
  const [requisitions, setRequisitions] = useState<REQUIS[]>(() => [
    ...mockRequisitions,
  ]);
  const [events, setEvents] = useState<EventRecord[]>(() => [...mockEvents]);
  const [banquetServices, setBanquetServices] = useState<BanquetService[]>(
    () => [...mockBanquetServices],
  );
  const [jbanquet, setJbanquet] = useState<JBANQUET[]>(() => [...mockJbanquet]);
  const [sales, setSales] = useState<SalesEntry[]>(() => [...mockSales]);

  return (
    <HotelDataContext.Provider
      value={{
        rooms,
        setRooms,
        reservations,
        setReservations,
        reservationArchive,
        setReservationArchive,
        groupReservations,
        setGroupReservations,
        groupArchive,
        setGroupArchive,
        statuses: mockStatuses,
        invoices,
        setInvoices,
        tempo,
        setTempo,
        catrooms,
        setCatrooms,
        staff,
        setStaff,
        rstaff,
        setRstaff,
        catlaundry,
        setCatlaundry,
        laundryServices,
        setLaundryServices,
        jlaundry,
        setJlaundry,
        requisitions,
        setRequisitions,
        events,
        setEvents,
        banquetServices,
        setBanquetServices,
        jbanquet,
        setJbanquet,
        sales,
        setSales,
        users: mockUsers,
        paymentModes: mockPaymentModes,
        currencies: mockCurrencies,
      }}
    >
      {children}
    </HotelDataContext.Provider>
  );
}

export function useHotelData() {
  const context = useContext(HotelDataContext);
  if (!context)
    throw new Error("useHotelData must be used within HotelDataProvider");
  return context;
}
