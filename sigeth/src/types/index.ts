// ═══════════════════════════════════════════════════════════
// SIGETH — Front Office Administration — Type Definitions
// Based on the official Dossier de Programmation
// ═══════════════════════════════════════════════════════════

export type Language = "en" | "fr";

// ── STATUS.dat — Room Status Reference ──
export type RoomStatusCode =
    | "VC" | "VD" | "OOO" | "DU" | "DND"
    | "CO" | "OD" | "OCC" | "LC/O" | "DL" | "ARR" | "CC";

export interface StatusRef {
    id?: string;
    code: RoomStatusCode;
    label: string;
    meaning: string;
}

// ── RDF.dat — Rooms Descriptive File ──
export interface RDF {
    id?: string;
    categorie: number;
    room_num: string;
    designation: string;
    price_1: number;
    price_2: number;
    guest_name: string;
    twin_name: string;
    twin_num: number;
    current_mon: string;
    status: RoomStatusCode;
    arrival_date: string;
    depart_date: string;
    qty: number;
    puv: number;
    deposit: number;
    date: string;
    groupe_name?: string;
}

// ── RCS.dat — Reservation-Confirmation Journal ──
export interface RCS {
    id?: string;
    code_p: string;
    groupe_name: string;
    room_num: string;
    guest_name: string;
    id_card: string;
    nationality: string;
    phone: string;
    email: string;
    arrival_date: string;
    depart_date: string;
    adulte: number;
    children: number;
    age: number;
    twin_num: number;
    twin_name: string;
    city: string;
    country: string;
    current_mon: string;
    puv: number;
    payt_mode: string;
    airport_time: string;
    discount: number;
    stay_cost: number;
    deposit: number;
    status: number;
}

// ── RCSA.dat — Reservation-Confirmation Archive ──
export interface RCSA extends Omit<RCS, "depart_date"> {
    id?: string;
    departure_date: string;
}

// ── GRC.dat — Group Reservation-Confirmation Journal ──
export interface GRC {
    id?: string;
    code_g: string;
    groupe_name: string;
    phone: string;
    nationality: string;
    email: string;
    tin: string;
    number_pers: number;
    arrival_date: string;
    depart_date: string;
    puv: number;
    current_mon: string;
    exchange: number;
    qty: number;
    payt_mode: string;
    discount: number;
    stay_cost: number;
    deposit: number;
    status: number;
}

// ── GRCA.dat — Group Reservation-Confirmation Archive ──
export type GRCA = GRC;

// ── INVOICES.dat — Invoice Numbering ──
export interface InvoiceRecord {
    date: string;
    numero: number;
    username: string;
}

// ── TEMPO.dat — Temporary Guest Consumption File ──
export interface TEMPO {
    id?: string;
    date: string;
    room_num: string;
    guest_name: string;
    designation: string;
    qty: number;
    unity: number;
    puv: number;
    credit: number;
    debit: number;
    phone: string;
    tin: string;
    invoice_num: string;
    mode_payt: string;
    current_mon: string;
}

// ── CATROOM.dat — Room Category Reference ──
export interface CATROOM {
    id?: string;
    code: number;
    name: string;
}

// ── HSTAFF.dat — Housekeeping Staff ──
export interface HSTAFF {
    id?: string;
    number: number;
    first_name: string;
    last_name: string;
    poste: string;
}

// ── RSTAFF.dat — Staff Dispatching ──
export interface RSTAFF {
    id?: string;
    date: string;
    room_num: string;
    guest_name: string;
    arrival_date: string;
    depart_date: string;
    status: RoomStatusCode;
    staff_number: number;
    staff_name: string;
    category?: string;
}

// ── CATLAUNDRY.dat — Laundry Category Reference ──
export interface CATLAUNDRY {
    id?: string;
    code: string;
    name: string;
}

// ── HSERVICE.dat — Laundry Service Items ──
export interface HSERVICE {
    id?: string;
    designation: string;
    type: string;
    qty: number;
    puv: number;
    category: string;
    room_num: string;
    guest_name: string;
}

// ── JLAUNDRY.dat — Laundry Journal ──
export interface JLAUNDRY {
    id?: string;
    date: string;
    room_num: string;
    designation: string;
    unity: number;
    qty: number;
    price: number;
    total: number;
}

// ── REQUIS.dat — Requisition / Request Notes ──
export interface REQUIS {
    id?: string;
    code_p: string;
    date_d: string;
    poste: string;
    libelle: string;
    qty: number;
    credit_1: number;
    credit_2: number;
    date_r: string;
    statut: string;
}

// ── EVENTS.dat — Event Types (Banqueting) ──
export interface EventRecord {
    id?: string;
    lot: number;
    nature: string;
}

// ── BANQUET.dat — Banqueting Services ──
export interface BanquetService {
    id?: string;
    date: string;
    lot: number;
    nature: string;
    item: string;
    unity: number;
    qty: number;
    puv: number;
}

// ── JBANQUET.dat — Banqueting Journal ──
export interface JBANQUET {
    id?: string;
    date: string;
    room_num: string;
    groupe_name: string;
    lot: number;
    nature: string;
    item: string;
    unity: number;
    qty: number;
    price: number;
    total: number;
}

// ── SALES.dat / JCASHIER.dat — Sales & Cashier ──
export interface SalesEntry {
    id?: string;
    date: string;
    order_num: string;
    code_art: string;
    item: string;
    room_num: string;
    guest_name: string;
    groupe_name?: string;
    unity: number;
    qty_s: number;
    price_s: number;
    montant: number;
    paid: number;
    credit: number;
    username: string;
    invoice_num: string;
    mode_payt: string;
    current_mon: string;
}

// ── USERS.dat — System Users ──
export interface UserRecord {
    username: string;
    password: string;
    level: string;
    name: string;
    submodule: string;
}

// ── MONNAIES.dat — Currencies Reference ──
export interface Currency {
    id?: string;
    code: string;
    label: string;
    exchange_rate: number;
}

// ── MODEP.dat — Payment Modes ──
export interface PaymentMode {
    id?: string;
    code: string;
    label: string;
    exchange_rate?: number;
    current_mon?: string;
}
