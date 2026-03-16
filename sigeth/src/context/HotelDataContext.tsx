import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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
  banquetingApi,
  coreApi,
  frontOfficeApi,
  housekeepingApi,
} from "../services/sigethApi";
import { useAuth } from "./AuthContext";

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
  const { isAuthenticated, user } = useAuth();
  const [rooms, setRooms] = useState<RDF[]>([]);
  const [reservations, setReservations] = useState<RCS[]>([]);
  const [reservationArchive, setReservationArchive] = useState<RCSA[]>([]);
  const [groupReservations, setGroupReservations] = useState<GRC[]>([]);
  const [groupArchive, setGroupArchive] = useState<GRCA[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [tempo, setTempo] = useState<TEMPO[]>([]);
  const [catrooms, setCatrooms] = useState<CATROOM[]>([]);
  const [staff, setStaff] = useState<HSTAFF[]>([]);
  const [rstaff, setRstaff] = useState<RSTAFF[]>([]);
  const [catlaundry, setCatlaundry] = useState<CATLAUNDRY[]>([]);
  const [laundryServices, setLaundryServices] = useState<HSERVICE[]>([]);
  const [jlaundry, setJlaundry] = useState<JLAUNDRY[]>([]);
  const [requisitions, setRequisitions] = useState<REQUIS[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [banquetServices, setBanquetServices] = useState<BanquetService[]>([]);
  const [jbanquet, setJbanquet] = useState<JBANQUET[]>([]);
  const [sales, setSales] = useState<SalesEntry[]>([]);
  const [statuses, setStatuses] = useState<StatusRef[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const clearData = useCallback(() => {
    setRooms([]);
    setReservations([]);
    setReservationArchive([]);
    setGroupReservations([]);
    setGroupArchive([]);
    setInvoices([]);
    setTempo([]);
    setCatrooms([]);
    setStaff([]);
    setRstaff([]);
    setCatlaundry([]);
    setLaundryServices([]);
    setJlaundry([]);
    setRequisitions([]);
    setEvents([]);
    setBanquetServices([]);
    setJbanquet([]);
    setSales([]);
    setStatuses([]);
    setPaymentModes([]);
    setCurrencies([]);
  }, []);

  const reloadData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      clearData();
      return;
    }

    // ── Core reference data (all roles need these) ──
    const [statusData, paymentModeData, roomCategoryData, exchangeData, requisData] =
      await Promise.all([
        coreApi.statuses(),
        coreApi.modep(),
        coreApi.catrooms(),
        coreApi.exchange(),
        coreApi.requis(),
      ]);

    setStatuses(statusData);
    setPaymentModes(paymentModeData);
    setCatrooms(roomCategoryData);
    setCurrencies(exchangeData);
    setRequisitions(requisData);

    // ── ALL roles need rooms (RDF.dat) ──
    const roomsData = await frontOfficeApi.rooms();
    setRooms(roomsData);

    // ── Role-specific data ──
    if (user.level === "Manager_R") {
      const [
        reservationsData,
        archivesData,
        groupsData,
        groupArchivesData,
      ] = await Promise.all([
        frontOfficeApi.reservations(),
        frontOfficeApi.archives(),
        frontOfficeApi.groups(),
        frontOfficeApi.groupArchives(),
      ]);

      setReservations(reservationsData);
      setReservationArchive(archivesData);
      setGroupReservations(groupsData);
      setGroupArchive(groupArchivesData);

      // Manager_R also needs laundry + banquet journals
      // for Invoice Preview and Daily Consumptions
      try {
        const [laundryJournalData, laundryArchiveData] = await Promise.all([
          housekeepingApi.laundryJournal(),
          housekeepingApi.laundryArchive(),
        ]);
        setJlaundry(laundryJournalData.concat(laundryArchiveData));
      } catch {
        // Laundry data may not be accessible — fail silently
      }

      try {
        const [banquetJournalData, banquetArchiveData] = await Promise.all([
          banquetingApi.journal(),
          banquetingApi.archive(),
        ]);
        setJbanquet(banquetJournalData.concat(banquetArchiveData));
      } catch {
        // Banquet data may not be accessible — fail silently
      }

      return;
    }

    if (user.level === "Manager_H") {
      const [
        staffData,
        dispatchingData,
        laundryCategoryData,
        laundryServiceData,
        laundryJournalData,
        laundryArchiveData,
      ] = await Promise.all([
        housekeepingApi.staff(),
        housekeepingApi.dispatching(),
        housekeepingApi.laundryCategories(),
        housekeepingApi.laundryServices(),
        housekeepingApi.laundryJournal(),
        housekeepingApi.laundryArchive(),
      ]);

      setStaff(staffData);
      setRstaff(dispatchingData);
      setCatlaundry(laundryCategoryData);
      setLaundryServices(laundryServiceData);
      setJlaundry(laundryJournalData.concat(laundryArchiveData));
      return;
    }

    if (user.level === "Manager_B") {
      const [
        groupsData,
        eventData,
        banquetServiceData,
        banquetJournalData,
        banquetArchiveData,
      ] = await Promise.all([
        frontOfficeApi.groups(),
        banquetingApi.events(),
        banquetingApi.services(),
        banquetingApi.journal(),
        banquetingApi.archive(),
      ]);

      setGroupReservations(groupsData);
      setEvents(eventData);
      setBanquetServices(banquetServiceData);
      setJbanquet(banquetJournalData.concat(banquetArchiveData));
    }
  }, [clearData, isAuthenticated, user]);

  useEffect(() => {
    void reloadData().catch((error) => {
      console.error("Failed to load SIGETH data", error);
      clearData();
    });
  }, [clearData, reloadData]);

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
        statuses,
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
        users: user
          ? [
              {
                username: user.username,
                password: "",
                level: user.level,
                name: user.name,
                submodule: user.submodule,
              },
            ]
          : [],
        paymentModes,
        currencies,
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
