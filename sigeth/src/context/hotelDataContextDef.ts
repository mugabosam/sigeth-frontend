import { createContext } from "react";
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

export interface HotelDataContextType {
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

export const HotelDataContext = createContext<HotelDataContextType | undefined>(
    undefined,
);
