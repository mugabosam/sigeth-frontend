import type {
    RDF, RCS, RCSA, GRC, GRCA, StatusRef, InvoiceRecord, TEMPO,
    CATROOM, HSTAFF, RSTAFF, CATLAUNDRY, HSERVICE, JLAUNDRY,
    REQUIS, EventRecord, BanquetService, JBANQUET, SalesEntry,
    UserRecord, PaymentMode,
} from "../types";

// ── STATUS.dat ──
export const mockStatuses: StatusRef[] = [
    { code: "VC", label: "Vacant", meaning: "Room is vacant and available" },
    { code: "VD", label: "Vacant Dirty", meaning: "Vacant but not yet cleaned" },
    { code: "OOO", label: "Out of Order", meaning: "Room is temporarily unavailable" },
    { code: "DU", label: "Day Use", meaning: "Room rented for daytime only" },
    { code: "DND", label: "Do Not Disturb", meaning: "Guest does not wish to be disturbed" },
    { code: "CO", label: "Check Out", meaning: "Guest has checked out" },
    { code: "OD", label: "Occupied Duty", meaning: "Room occupied, duty assignment" },
    { code: "OCC", label: "Occupied Clean", meaning: "Room is occupied and clean" },
    { code: "LC/O", label: "Late Check Out", meaning: "Guest staying beyond standard checkout" },
    { code: "DL", label: "Double Lock", meaning: "Room is double-locked" },
    { code: "ARR", label: "Arrival", meaning: "Guest arrival expected" },
];

// ── CATROOM.dat ──
export const mockCatrooms: CATROOM[] = [
    { code: 1, name: "Executive Room" },
    { code: 2, name: "Suite" },
    { code: 3, name: "Superior" },
    { code: 4, name: "Ambassador" },
    { code: 5, name: "Presidential" },
];

// ── RDF.dat ──
export const mockRooms: RDF[] = [
    // Floor 1 — Executive Room (Cat 1)
    { categorie: 1, room_num: "101", designation: "Executive Room 101", price_1: 85, price_2: 120, guest_name: "Jean-Pierre Dupont", twin_name: "", twin_num: 1, current_mon: "USD", status: "OCC", arrival_date: "2026-03-10", depart_date: "2026-03-14", qty: 4, puv: 85, deposit: 170, date: "2026-03-11" },
    { categorie: 1, room_num: "102", designation: "Executive Room 102", price_1: 85, price_2: 120, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "VC", arrival_date: "", depart_date: "", qty: 0, puv: 85, deposit: 0, date: "2026-03-11" },
    { categorie: 1, room_num: "103", designation: "Executive Room 103", price_1: 85, price_2: 120, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "VD", arrival_date: "", depart_date: "", qty: 0, puv: 85, deposit: 0, date: "2026-03-11" },
    { categorie: 1, room_num: "104", designation: "Executive Room 104", price_1: 85, price_2: 120, guest_name: "Marie-Claire Fontaine", twin_name: "", twin_num: 1, current_mon: "USD", status: "ARR", arrival_date: "2026-03-12", depart_date: "2026-03-15", qty: 3, puv: 85, deposit: 255, date: "2026-03-11" },
    { categorie: 1, room_num: "105", designation: "Executive Room 105", price_1: 85, price_2: 120, guest_name: "Ahmed Ben Salah", twin_name: "", twin_num: 1, current_mon: "USD", status: "OCC", arrival_date: "2026-03-09", depart_date: "2026-03-13", qty: 4, puv: 85, deposit: 0, date: "2026-03-11" },
    { categorie: 1, room_num: "106", designation: "Executive Room 106", price_1: 85, price_2: 120, guest_name: "Ricardo Mendes", twin_name: "", twin_num: 1, current_mon: "USD", status: "DND", arrival_date: "2026-03-08", depart_date: "2026-03-12", qty: 4, puv: 85, deposit: 170, date: "2026-03-11" },
    { categorie: 1, room_num: "107", designation: "Executive Room 107", price_1: 85, price_2: 120, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "OOO", arrival_date: "", depart_date: "", qty: 0, puv: 85, deposit: 0, date: "2026-03-11" },
    { categorie: 1, room_num: "108", designation: "Executive Room 108", price_1: 85, price_2: 120, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "VD", arrival_date: "", depart_date: "", qty: 0, puv: 85, deposit: 0, date: "2026-03-11" },
    // Floor 2 — Suite (Cat 2)
    { categorie: 2, room_num: "201", designation: "Suite 201", price_1: 180, price_2: 250, guest_name: "Robert Smith", twin_name: "Jane Smith", twin_num: 2, current_mon: "USD", status: "OCC", arrival_date: "2026-03-08", depart_date: "2026-03-15", qty: 7, puv: 180, deposit: 630, date: "2026-03-11" },
    { categorie: 2, room_num: "202", designation: "Suite 202", price_1: 180, price_2: 250, guest_name: "Hugo Fernandez", twin_name: "", twin_num: 1, current_mon: "USD", status: "ARR", arrival_date: "2026-03-12", depart_date: "2026-03-16", qty: 4, puv: 180, deposit: 360, date: "2026-03-11" },
    { categorie: 2, room_num: "203", designation: "Suite 203", price_1: 180, price_2: 250, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "VC", arrival_date: "", depart_date: "", qty: 0, puv: 180, deposit: 0, date: "2026-03-11" },
    { categorie: 2, room_num: "204", designation: "Suite 204", price_1: 180, price_2: 250, guest_name: "Isabelle Laurent", twin_name: "", twin_num: 1, current_mon: "USD", status: "DND", arrival_date: "2026-03-09", depart_date: "2026-03-13", qty: 4, puv: 180, deposit: 360, date: "2026-03-11" },
    { categorie: 2, room_num: "205", designation: "Suite 205", price_1: 180, price_2: 250, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "CO", arrival_date: "", depart_date: "", qty: 0, puv: 180, deposit: 0, date: "2026-03-11" },
    { categorie: 2, room_num: "206", designation: "Suite 206", price_1: 180, price_2: 250, guest_name: "Wei Zhang", twin_name: "Li Zhang", twin_num: 2, current_mon: "USD", status: "OCC", arrival_date: "2026-03-10", depart_date: "2026-03-17", qty: 7, puv: 250, deposit: 875, date: "2026-03-11" },
    // Floor 3 — Superior (Cat 3)
    { categorie: 3, room_num: "301", designation: "Superior 301", price_1: 120000, price_2: 150000, guest_name: "", twin_name: "", twin_num: 0, current_mon: "RWF", status: "VC", arrival_date: "", depart_date: "", qty: 0, puv: 120000, deposit: 0, date: "2026-03-11" },
    { categorie: 3, room_num: "302", designation: "Superior 302", price_1: 120000, price_2: 150000, guest_name: "Amina Diallo", twin_name: "", twin_num: 1, current_mon: "RWF", status: "OD", arrival_date: "2026-03-09", depart_date: "2026-03-13", qty: 4, puv: 120000, deposit: 240000, date: "2026-03-11" },
    { categorie: 3, room_num: "303", designation: "Superior 303", price_1: 120000, price_2: 150000, guest_name: "", twin_name: "", twin_num: 0, current_mon: "RWF", status: "VD", arrival_date: "", depart_date: "", qty: 0, puv: 120000, deposit: 0, date: "2026-03-11" },
    { categorie: 3, room_num: "304", designation: "Superior 304", price_1: 120000, price_2: 150000, guest_name: "Kenji Mori", twin_name: "Sakura Mori", twin_num: 2, current_mon: "RWF", status: "OCC", arrival_date: "2026-03-07", depart_date: "2026-03-14", qty: 7, puv: 150000, deposit: 525000, date: "2026-03-11" },
    { categorie: 3, room_num: "305", designation: "Superior 305", price_1: 120000, price_2: 150000, guest_name: "Paul Kagabo", twin_name: "", twin_num: 1, current_mon: "RWF", status: "DU", arrival_date: "2026-03-08", depart_date: "2026-03-11", qty: 3, puv: 120000, deposit: 180000, date: "2026-03-11" },
    { categorie: 3, room_num: "306", designation: "Superior 306", price_1: 120000, price_2: 150000, guest_name: "Nathalie Uwase", twin_name: "", twin_num: 1, current_mon: "RWF", status: "ARR", arrival_date: "2026-03-12", depart_date: "2026-03-14", qty: 2, puv: 120000, deposit: 120000, date: "2026-03-11" },
    // Floor 4 — Ambassador (Cat 4)
    { categorie: 4, room_num: "401", designation: "Ambassador 401", price_1: 350, price_2: 450, guest_name: "Yuki Tanaka", twin_name: "", twin_num: 1, current_mon: "USD", status: "OCC", arrival_date: "2026-03-07", depart_date: "2026-03-11", qty: 4, puv: 350, deposit: 700, date: "2026-03-11" },
    { categorie: 4, room_num: "402", designation: "Ambassador 402", price_1: 350, price_2: 450, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "OOO", arrival_date: "", depart_date: "", qty: 0, puv: 350, deposit: 0, date: "2026-03-11" },
    { categorie: 4, room_num: "403", designation: "Ambassador 403", price_1: 350, price_2: 450, guest_name: "Carlos Rivera", twin_name: "Elena Rivera", twin_num: 2, current_mon: "USD", status: "DND", arrival_date: "2026-03-09", depart_date: "2026-03-14", qty: 5, puv: 450, deposit: 1125, date: "2026-03-11" },
    { categorie: 4, room_num: "404", designation: "Ambassador 404", price_1: 350, price_2: 450, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "VC", arrival_date: "", depart_date: "", qty: 0, puv: 350, deposit: 0, date: "2026-03-11" },
    { categorie: 4, room_num: "405", designation: "Ambassador 405", price_1: 350, price_2: 450, guest_name: "François Girard", twin_name: "", twin_num: 1, current_mon: "USD", status: "DL", arrival_date: "2026-03-10", depart_date: "2026-03-13", qty: 3, puv: 350, deposit: 525, date: "2026-03-11" },
    // Floor 5 — Presidential (Cat 5)
    { categorie: 5, room_num: "501", designation: "Presidential 501", price_1: 500, price_2: 700, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "VC", arrival_date: "", depart_date: "", qty: 0, puv: 500, deposit: 0, date: "2026-03-11" },
    { categorie: 5, room_num: "502", designation: "Presidential 502", price_1: 500, price_2: 700, guest_name: "Aisha Karimova", twin_name: "Omar Karimov", twin_num: 2, current_mon: "USD", status: "OCC", arrival_date: "2026-03-06", depart_date: "2026-03-13", qty: 7, puv: 700, deposit: 2450, date: "2026-03-11" },
    { categorie: 5, room_num: "503", designation: "Presidential 503", price_1: 500, price_2: 700, guest_name: "", twin_name: "", twin_num: 0, current_mon: "USD", status: "LC/O", arrival_date: "", depart_date: "", qty: 0, puv: 500, deposit: 0, date: "2026-03-11" },
];

// ── RCS.dat ──
export const mockReservations: RCS[] = [
    { code_p: "", groupe_name: "", room_num: "101", guest_name: "Jean Dupont", id_card: "FR1234", nationality: "French", phone: "+250788123456", email: "jean.dupont@email.com", arrival_date: "2026-03-10", depart_date: "2026-03-14", adulte: 1, children: 0, age: 35, twin_num: 0, twin_name: "", city: "Lyon", country: "France", current_mon: "RWF", puv: 75000, payt_mode: "Cash", airport_time: "14:00", discount: 0, stay_cost: 300000, deposit: 75000, status: 1 },
    { code_p: "", groupe_name: "", room_num: "103", guest_name: "Alice Mukamana", id_card: "RW9876", nationality: "Rwandan", phone: "+250722456789", email: "alice.m@email.com", arrival_date: "2026-03-09", depart_date: "2026-03-12", adulte: 2, children: 0, age: 28, twin_num: 1, twin_name: "Paul Kagabo", city: "Kigali", country: "Rwanda", current_mon: "RWF", puv: 120000, payt_mode: "Visa-card", airport_time: "", discount: 10, stay_cost: 324000, deposit: 200000, status: 1 },
    { code_p: "", groupe_name: "", room_num: "202", guest_name: "Robert Smith", id_card: "US7890", nationality: "American", phone: "+15551234567", email: "r.smith@email.com", arrival_date: "2026-03-08", depart_date: "2026-03-15", adulte: 2, children: 1, age: 42, twin_num: 1, twin_name: "Jane Smith", city: "New York", country: "USA", current_mon: "USD", puv: 250, payt_mode: "Visa-card", airport_time: "10:30", discount: 0, stay_cost: 1750, deposit: 500, status: 1 },
    { code_p: "", groupe_name: "", room_num: "104", guest_name: "Marie Claire Uwase", id_card: "RW4561", nationality: "Rwandan", phone: "+250733789012", email: "mc.uwase@email.com", arrival_date: "2026-03-12", depart_date: "2026-03-14", adulte: 2, children: 0, age: 30, twin_num: 0, twin_name: "", city: "Kigali", country: "Rwanda", current_mon: "RWF", puv: 120000, payt_mode: "Mobile Money", airport_time: "", discount: 0, stay_cost: 240000, deposit: 0, status: 0 },
    { code_p: "", groupe_name: "", room_num: "401", guest_name: "Yuki Tanaka", id_card: "JP9012", nationality: "Japanese", phone: "+819012345678", email: "y.tanaka@email.com", arrival_date: "2026-03-07", depart_date: "2026-03-11", adulte: 1, children: 0, age: 38, twin_num: 0, twin_name: "", city: "Tokyo", country: "Japan", current_mon: "USD", puv: 350, payt_mode: "Visa-card", airport_time: "08:00", discount: 5, stay_cost: 1330, deposit: 700, status: 1 },
    { code_p: "G01", groupe_name: "African Tech Summit 2026", room_num: "501", guest_name: "David Nkurunziza", id_card: "RW5555", nationality: "Rwandan", phone: "+250788999888", email: "d.nkurunziza@techsummit.rw", arrival_date: "2026-03-15", depart_date: "2026-03-18", adulte: 1, children: 0, age: 40, twin_num: 0, twin_name: "", city: "Kigali", country: "Rwanda", current_mon: "RWF", puv: 500000, payt_mode: "Credit", airport_time: "", discount: 15, stay_cost: 1275000, deposit: 500000, status: 0 },
    // Additional arrivals for today (2026-03-11) and tomorrow
    { code_p: "", groupe_name: "", room_num: "202", guest_name: "Hugo Fernandez", id_card: "ES3456", nationality: "Spanish", phone: "+34612345678", email: "h.fernandez@email.com", arrival_date: "2026-03-12", depart_date: "2026-03-16", adulte: 1, children: 0, age: 34, twin_num: 0, twin_name: "", city: "Madrid", country: "Spain", current_mon: "USD", puv: 180, payt_mode: "Mobile Money", airport_time: "11:30", discount: 0, stay_cost: 720, deposit: 360, status: 0 },
    { code_p: "", groupe_name: "", room_num: "306", guest_name: "Nathalie Uwase", id_card: "RW7788", nationality: "Rwandan", phone: "+250722111333", email: "n.uwase@email.com", arrival_date: "2026-03-12", depart_date: "2026-03-14", adulte: 1, children: 0, age: 27, twin_num: 0, twin_name: "", city: "Butare", country: "Rwanda", current_mon: "RWF", puv: 120000, payt_mode: "Cash", airport_time: "", discount: 0, stay_cost: 240000, deposit: 120000, status: 0 },
    { code_p: "", groupe_name: "", room_num: "301", guest_name: "James Okonkwo", id_card: "NG2233", nationality: "Nigerian", phone: "+2348012345678", email: "j.okonkwo@email.com", arrival_date: "2026-03-11", depart_date: "2026-03-14", adulte: 2, children: 1, age: 45, twin_num: 0, twin_name: "", city: "Lagos", country: "Nigeria", current_mon: "USD", puv: 120, payt_mode: "Visa-card", airport_time: "09:00", discount: 5, stay_cost: 342, deposit: 120, status: 0 },
    { code_p: "", groupe_name: "", room_num: "404", guest_name: "Sophie Laurent", id_card: "FR6677", nationality: "French", phone: "+33612345678", email: "s.laurent@email.com", arrival_date: "2026-03-11", depart_date: "2026-03-13", adulte: 1, children: 0, age: 31, twin_num: 0, twin_name: "", city: "Paris", country: "France", current_mon: "USD", puv: 350, payt_mode: "Credit", airport_time: "14:00", discount: 0, stay_cost: 700, deposit: 350, status: 0 },
    // Additional G01 group members
    { code_p: "G01", groupe_name: "African Tech Summit 2026", room_num: "301", guest_name: "Grace Akinyi", id_card: "KE4455", nationality: "Kenyan", phone: "+254712345678", email: "g.akinyi@techsummit.rw", arrival_date: "2026-03-15", depart_date: "2026-03-18", adulte: 1, children: 0, age: 33, twin_num: 0, twin_name: "", city: "Nairobi", country: "Kenya", current_mon: "RWF", puv: 120000, payt_mode: "Credit", airport_time: "10:00", discount: 15, stay_cost: 306000, deposit: 150000, status: 0 },
    { code_p: "G01", groupe_name: "African Tech Summit 2026", room_num: "203", guest_name: "Samuel Mensah", id_card: "GH6677", nationality: "Ghanaian", phone: "+233244567890", email: "s.mensah@techsummit.rw", arrival_date: "2026-03-15", depart_date: "2026-03-18", adulte: 1, children: 0, age: 29, twin_num: 0, twin_name: "", city: "Accra", country: "Ghana", current_mon: "USD", puv: 180, payt_mode: "Credit", airport_time: "12:30", discount: 15, stay_cost: 459, deposit: 200, status: 0 },
    { code_p: "G01", groupe_name: "African Tech Summit 2026", room_num: "102", guest_name: "Fatou Diop", id_card: "SN8899", nationality: "Senegalese", phone: "+221771234567", email: "f.diop@techsummit.rw", arrival_date: "2026-03-15", depart_date: "2026-03-18", adulte: 1, children: 0, age: 36, twin_num: 0, twin_name: "", city: "Dakar", country: "Senegal", current_mon: "USD", puv: 85, payt_mode: "Credit", airport_time: "15:00", discount: 15, stay_cost: 216.75, deposit: 100, status: 0 },
    // G02 group members
    { code_p: "G02", groupe_name: "Wedding Party Mugisha", room_num: "404", guest_name: "Eric Mugisha", id_card: "RW9900", nationality: "Rwandan", phone: "+250788555666", email: "e.mugisha@email.com", arrival_date: "2026-03-20", depart_date: "2026-03-22", adulte: 2, children: 0, age: 32, twin_num: 0, twin_name: "", city: "Kigali", country: "Rwanda", current_mon: "RWF", puv: 350000, payt_mode: "Cash", airport_time: "", discount: 10, stay_cost: 630000, deposit: 0, status: 0 },
    { code_p: "G02", groupe_name: "Wedding Party Mugisha", room_num: "203", guest_name: "Claire Ingabire", id_card: "RW1122", nationality: "Rwandan", phone: "+250733222111", email: "c.ingabire@email.com", arrival_date: "2026-03-20", depart_date: "2026-03-22", adulte: 1, children: 0, age: 28, twin_num: 0, twin_name: "", city: "Kigali", country: "Rwanda", current_mon: "RWF", puv: 180000, payt_mode: "Cash", airport_time: "", discount: 10, stay_cost: 324000, deposit: 0, status: 0 },
];

// ── RCSA.dat (archive) ──
export const mockReservationArchive: RCSA[] = [
    { code_p: "", groupe_name: "", room_num: "301", guest_name: "Pierre Habimana", id_card: "RW1112", nationality: "Rwandan", phone: "+250788111222", email: "p.habimana@email.com", arrival_date: "2026-02-01", departure_date: "2026-02-05", adulte: 1, children: 0, age: 45, twin_num: 0, twin_name: "", city: "Kigali", country: "Rwanda", current_mon: "RWF", puv: 120000, payt_mode: "Cash", airport_time: "", discount: 0, stay_cost: 480000, deposit: 480000, status: 1 },
    { code_p: "", groupe_name: "", room_num: "201", guest_name: "Emma Wilson", id_card: "UK5678", nationality: "British", phone: "+447700900111", email: "e.wilson@email.com", arrival_date: "2026-02-10", departure_date: "2026-02-17", adulte: 2, children: 0, age: 33, twin_num: 0, twin_name: "", city: "London", country: "United Kingdom", current_mon: "USD", puv: 180, payt_mode: "Visa-card", airport_time: "16:00", discount: 0, stay_cost: 1260, deposit: 1260, status: 1 },
];

// ── GRC.dat ──
export const mockGroupReservations: GRC[] = [
    { code_g: "G01", groupe_name: "African Tech Summit 2026", phone: "+250788999888", nationality: "Rwandan", email: "info@techsummit.rw", tin: "100123456", number_pers: 12, arrival_date: "2026-03-15", depart_date: "2026-03-18", puv: 120000, current_mon: "RWF", exchange: 1, qty: 3, payt_mode: "Credit", discount: 15, stay_cost: 3060000, deposit: 1500000, status: 0 },
    { code_g: "G02", groupe_name: "Wedding Party Mugisha", phone: "+250733444555", nationality: "Rwandan", email: "g.mugisha@email.com", tin: "", number_pers: 8, arrival_date: "2026-03-20", depart_date: "2026-03-22", puv: 150000, current_mon: "RWF", exchange: 1, qty: 2, payt_mode: "Cash", discount: 10, stay_cost: 2160000, deposit: 0, status: 0 },
];

// ── GRCA.dat (archive) ──
export const mockGroupArchive: GRCA[] = [
    { code_g: "G00", groupe_name: "UN Delegation Feb 2026", phone: "+12129631234", nationality: "International", email: "s.johnson@un.org", tin: "200987654", number_pers: 6, arrival_date: "2026-02-05", depart_date: "2026-02-10", puv: 250000, current_mon: "USD", exchange: 1380, qty: 5, payt_mode: "Credit", discount: 0, stay_cost: 7500000, deposit: 7500000, status: 1 },
];

// ── INVOICES.dat ──
export const mockInvoices: InvoiceRecord[] = [
    { date: "2026-03-10", numero: 1001, username: "Rooms" },
    { date: "2026-03-10", numero: 1002, username: "Rooms" },
    { date: "2026-03-09", numero: 1000, username: "Rooms" },
];

// ── TEMPO.dat ──
export const mockTempo: TEMPO[] = [
    { date: "2026-03-10", room_num: "101", guest_name: "Jean Dupont", designation: "Room 101 - Executive Single (4 nights)", qty: 4, unity: 1, puv: 75000, credit: 300000, debit: 75000, phone: "+250788123456", tin: "", invoice_num: "", mode_payt: "Cash", current_mon: "RWF" },
    { date: "2026-03-10", room_num: "101", guest_name: "Jean Dupont", designation: "Laundry - Shirt Ironing", qty: 2, unity: 1, puv: 3000, credit: 6000, debit: 0, phone: "+250788123456", tin: "", invoice_num: "", mode_payt: "Cash", current_mon: "RWF" },
];

// ── HSTAFF.dat ──
export const mockStaff: HSTAFF[] = [
    { number: 1, first_name: "Marie", last_name: "Uwimana", poste: "Room Attendant" },
    { number: 2, first_name: "Jean", last_name: "Habimana", poste: "Room Attendant" },
    { number: 3, first_name: "Grace", last_name: "Mukamana", poste: "Laundry Attendant" },
    { number: 4, first_name: "Emmanuel", last_name: "Nsengimana", poste: "Supervisor" },
    { number: 5, first_name: "Claudine", last_name: "Ingabire", poste: "Room Attendant" },
];

// ── RSTAFF.dat ──
export const mockRstaff: RSTAFF[] = [
    { date: "2026-03-10", room_num: "101", guest_name: "Jean Dupont", arrival_date: "2026-03-10", depart_date: "2026-03-14", status: "OCC", staff_number: 1, staff_name: "Marie Uwimana" },
    { date: "2026-03-10", room_num: "102", guest_name: "", arrival_date: "", depart_date: "", status: "VC", staff_number: 2, staff_name: "Jean Habimana" },
    { date: "2026-03-10", room_num: "103", guest_name: "Alice Mukamana", arrival_date: "2026-03-09", depart_date: "2026-03-12", status: "OCC", staff_number: 1, staff_name: "Marie Uwimana" },
    { date: "2026-03-10", room_num: "301", guest_name: "", arrival_date: "", depart_date: "", status: "VD", staff_number: 5, staff_name: "Claudine Ingabire" },
];

// ── CATLAUNDRY.dat ──
export const mockCatlaundry: CATLAUNDRY[] = [
    { code: "01", name: "Laundry" },
    { code: "02", name: "Dry Cleaning" },
    { code: "03", name: "Ironing" },
];

// ── HSERVICE.dat ──
export const mockLaundryServices: HSERVICE[] = [
    { designation: "Shirt", type: "piece", qty: 1, puv: 3000, category: "01", room_num: "", guest_name: "" },
    { designation: "Trousers", type: "piece", qty: 1, puv: 4000, category: "01", room_num: "", guest_name: "" },
    { designation: "Dress", type: "piece", qty: 1, puv: 5000, category: "01", room_num: "", guest_name: "" },
    { designation: "Suit (2 pieces)", type: "set", qty: 1, puv: 8000, category: "02", room_num: "", guest_name: "" },
    { designation: "Coat", type: "piece", qty: 1, puv: 6000, category: "02", room_num: "", guest_name: "" },
    { designation: "Shirt Ironing", type: "piece", qty: 1, puv: 1500, category: "03", room_num: "", guest_name: "" },
    { designation: "Trousers Ironing", type: "piece", qty: 1, puv: 2000, category: "03", room_num: "", guest_name: "" },
];

// ── JLAUNDRY.dat ──
export const mockJlaundry: JLAUNDRY[] = [
    { date: "2026-03-10", room_num: "101", designation: "Shirt", unity: 1, qty: 3, price: 3000, total: 9000 },
    { date: "2026-03-10", room_num: "101", designation: "Shirt Ironing", unity: 1, qty: 2, price: 1500, total: 3000 },
    { date: "2026-03-09", room_num: "202", designation: "Suit (2 pieces)", unity: 1, qty: 1, price: 8000, total: 8000 },
];

// ── REQUIS.dat ──
export const mockRequisitions: REQUIS[] = [
    { code_p: "HK", date_d: "2026-03-08", poste: "Housekeeping", libelle: "Cleaning Supplies - Detergent", qty: 10, credit_1: 50000, credit_2: 45000, date_r: "2026-03-09", statut: "Approved" },
    { code_p: "HK", date_d: "2026-03-09", poste: "Housekeeping", libelle: "Bed Linen - King Size", qty: 20, credit_1: 200000, credit_2: 0, date_r: "", statut: "Pending" },
    { code_p: "BQ", date_d: "2026-03-07", poste: "Banqueting", libelle: "Table Napkins - White", qty: 100, credit_1: 150000, credit_2: 150000, date_r: "2026-03-08", statut: "Approved" },
];

// ── EVENTS.dat ──
export const mockEvents: EventRecord[] = [
    { lot: 1, nature: "Conference" },
    { lot: 2, nature: "Seminar" },
    { lot: 3, nature: "Wedding" },
    { lot: 4, nature: "Celebration" },
    { lot: 5, nature: "Evening Event" },
    { lot: 6, nature: "Concert" },
    { lot: 7, nature: "Dinner" },
    { lot: 8, nature: "Sports Activity" },
];

// ── BANQUET.dat ──
export const mockBanquetServices: BanquetService[] = [
    { date: "2026-03-01", lot: 1, nature: "Conference", item: "Projector Rental", unity: 1, qty: 1, puv: 50000 },
    { date: "2026-03-01", lot: 1, nature: "Conference", item: "Conference Room (half day)", unity: 1, qty: 1, puv: 200000 },
    { date: "2026-03-01", lot: 1, nature: "Conference", item: "Coffee Break (per person)", unity: 1, qty: 50, puv: 5000 },
    { date: "2026-03-01", lot: 3, nature: "Wedding", item: "Hall Decoration", unity: 1, qty: 1, puv: 500000 },
    { date: "2026-03-01", lot: 3, nature: "Wedding", item: "Catering (per person)", unity: 1, qty: 100, puv: 15000 },
    { date: "2026-03-01", lot: 7, nature: "Dinner", item: "Private Dining Room", unity: 1, qty: 1, puv: 100000 },
    { date: "2026-03-01", lot: 7, nature: "Dinner", item: "Menu (per person)", unity: 1, qty: 10, puv: 25000 },
];

// ── JBANQUET.dat ──
export const mockJbanquet: JBANQUET[] = [
    { date: "2026-03-09", room_num: "202", groupe_name: "", lot: 7, nature: "Dinner", item: "Private Dining Room", unity: 1, qty: 1, price: 100000, total: 100000 },
    { date: "2026-03-09", room_num: "202", groupe_name: "", lot: 7, nature: "Dinner", item: "Menu (per person)", unity: 1, qty: 4, price: 25000, total: 100000 },
];

// ── SALES.dat / JCASHIER.dat ──
export const mockSales: SalesEntry[] = [
    { date: "2026-03-10", order_num: "ORD-001", code_art: "ROOM", item: "Room 101 - Executive Single", room_num: "101", guest_name: "Jean Dupont", unity: 1, qty_s: 4, price_s: 75000, montant: 300000, paid: 75000, credit: 225000, username: "Rooms", invoice_num: "1001", mode_payt: "Cash", current_mon: "RWF" },
    { date: "2026-03-09", order_num: "ORD-002", code_art: "ROOM", item: "Room 103 - Executive Double", room_num: "103", guest_name: "Alice Mukamana", unity: 1, qty_s: 3, price_s: 120000, montant: 324000, paid: 200000, credit: 124000, username: "Rooms", invoice_num: "1000", mode_payt: "Visa-card", current_mon: "RWF" },
    { date: "2026-03-08", order_num: "ORD-003", code_art: "ROOM", item: "Room 202 - Suite Deluxe", room_num: "202", guest_name: "Robert Smith", unity: 1, qty_s: 7, price_s: 250, montant: 1750, paid: 500, credit: 1250, username: "Rooms", invoice_num: "1002", mode_payt: "Visa-card", current_mon: "USD" },
    { date: "2026-03-10", order_num: "ORD-004", code_art: "LDRY", item: "Laundry - Shirt x3", room_num: "101", guest_name: "Jean Dupont", unity: 1, qty_s: 3, price_s: 3000, montant: 9000, paid: 0, credit: 9000, username: "Rooms", invoice_num: "", mode_payt: "Cash", current_mon: "RWF" },
    { date: "2026-03-09", order_num: "ORD-005", code_art: "BNQT", item: "Dinner - Private Room", room_num: "202", guest_name: "Robert Smith", unity: 1, qty_s: 1, price_s: 100000, montant: 100000, paid: 100000, credit: 0, username: "Rooms", invoice_num: "", mode_payt: "Visa-card", current_mon: "RWF" },
];

// ── USERS.dat ──
export const mockUsers: UserRecord[] = [
    { username: "Rooms", password: "Guest", level: "Manager_R", name: "Rooms", submodule: "rooms" },
    { username: "House", password: "Keep", level: "Manager_H", name: "Housekeeping", submodule: "housekeeping" },
    { username: "Banquet", password: "Bguest", level: "Manager_B", name: "Banqueting", submodule: "banqueting" },
];

// ── MODEP.dat ──
export const mockPaymentModes: PaymentMode[] = [
    { code: "01", label: "Cash" },
    { code: "02", label: "Credit" },
    { code: "03", label: "Visa-card" },
    { code: "04", label: "Mobile Money" },
    { code: "05", label: "Cheque" },
];
