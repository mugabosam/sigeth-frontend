import api from "../utils/api";
import type {
  BanquetService,
  CATLAUNDRY,
  CATROOM,
  Currency,
  EventRecord,
  GRC,
  GRCA,
  HSERVICE,
  HSTAFF,
  JBANQUET,
  JLAUNDRY,
  PaymentMode,
  RCS,
  RCSA,
  RDF,
  REQUIS,
  RSTAFF,
  RoomStatusCode,
  StatusRef,
  TEMPO,
} from "../types";

type ApiRecord = Record<string, unknown>;

export interface AuthProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  level: string;
  poste_label: string;
  module_access: string;
  is_active: boolean;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface InvoicePreviewResponse {
  room_num?: string;
  guest_name?: string;
  groupe_name?: string;
  code_g?: string;
  number_pers?: number;
  arrival_date?: string;
  depart_date?: string;
  items: TEMPO[];
  total_charges: number;
  total_paid: number;
  balance_due: number;
  group_deposit?: number;
  invoice_number?: string;
  date?: string;
  username?: string;
  tax?: Record<string, unknown>;
}

const numberValue = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const stringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
};

const roomStatusValue = (value: unknown, fallback: RoomStatusCode = "VC") => {
  const status = stringValue(value, fallback) as RoomStatusCode;
  return status || fallback;
};

const normalizeRoom = (raw: ApiRecord): RDF => ({
  id: stringValue(raw.id),
  categorie: numberValue(raw.categorie_code ?? raw.categorie),
  room_num: stringValue(raw.room_num),
  designation: stringValue(raw.designation),
  price_1: numberValue(raw.price_1),
  price_2: numberValue(raw.price_2),
  guest_name: stringValue(raw.guest_name),
  twin_name: stringValue(raw.twin_name),
  twin_num: numberValue(raw.twin_num),
  current_mon: stringValue(raw.current_mon, "RWF"),
  status: roomStatusValue(raw.status_code ?? raw.status),
  arrival_date: stringValue(raw.arrival_date),
  depart_date: stringValue(raw.depart_date),
  qty: numberValue(raw.nights ?? raw.qty),
  puv: numberValue(raw.puv),
  deposit: numberValue(raw.deposit),
  date: stringValue(raw.date),
  groupe_name: stringValue(raw.groupe_name),
});

const normalizeReservation = (raw: ApiRecord): RCS => ({
  id: stringValue(raw.id),
  code_p: stringValue(raw.code_p),
  groupe_name: stringValue(raw.groupe_name),
  room_num: stringValue(raw.room_num),
  guest_name: stringValue(raw.guest_name),
  id_card: stringValue(raw.id_card),
  nationality: stringValue(raw.nationality),
  phone: stringValue(raw.phone),
  email: stringValue(raw.email),
  arrival_date: stringValue(raw.arrival_date),
  depart_date: stringValue(raw.depart_date),
  adulte: numberValue(raw.adulte),
  children: numberValue(raw.children),
  age: numberValue(raw.age),
  twin_num: numberValue(raw.twin_num),
  twin_name: stringValue(raw.twin_name),
  city: stringValue(raw.city),
  country: stringValue(raw.country),
  current_mon: stringValue(raw.current_mon, "RWF"),
  puv: numberValue(raw.puv),
  payt_mode: stringValue(raw.payt_mode),
  airport_time: stringValue(raw.airport_time),
  discount: numberValue(raw.discount),
  stay_cost: numberValue(raw.stay_cost),
  deposit: numberValue(raw.deposit),
  status: numberValue(raw.reservation_status ?? raw.status),
});

const normalizeReservationArchive = (raw: ApiRecord): RCSA => ({
  ...normalizeReservation(raw),
  departure_date: stringValue(raw.departure_date),
});

const normalizeGroupReservation = (raw: ApiRecord): GRC => ({
  id: stringValue(raw.id),
  code_g: stringValue(raw.code_g),
  groupe_name: stringValue(raw.groupe_name),
  phone: stringValue(raw.phone),
  nationality: stringValue(raw.nationality),
  email: stringValue(raw.email),
  tin: stringValue(raw.tin),
  number_pers: numberValue(raw.number_pers),
  arrival_date: stringValue(raw.arrival_date),
  depart_date: stringValue(raw.depart_date),
  puv: numberValue(raw.puv),
  current_mon: stringValue(raw.current_mon, "RWF"),
  exchange: numberValue(raw.exchange),
  qty: numberValue(raw.qty),
  payt_mode: stringValue(raw.payt_mode),
  discount: numberValue(raw.discount),
  stay_cost: numberValue(raw.stay_cost),
  deposit: numberValue(raw.deposit),
  status: numberValue(raw.group_status ?? raw.status),
});

const normalizeStatus = (raw: ApiRecord): StatusRef => ({
  id: stringValue(raw.id),
  code: roomStatusValue(raw.code),
  label: stringValue(raw.designation ?? raw.label),
  meaning: stringValue(raw.designation ?? raw.meaning),
});

const normalizeCategory = (raw: ApiRecord): CATROOM => ({
  id: stringValue(raw.id),
  code: numberValue(raw.code_cat ?? raw.code),
  name: stringValue(raw.designation ?? raw.name),
});

const normalizePaymentMode = (raw: ApiRecord): PaymentMode => ({
  id: stringValue(raw.id),
  code: stringValue(raw.modep ?? raw.id),
  label: stringValue(raw.designa ?? raw.label ?? raw.modep),
  exchange_rate: numberValue(raw.rate_ex),
  current_mon: stringValue(raw.current_mon, "RWF"),
});

const normalizeCurrency = (raw: ApiRecord): Currency => ({
  id: stringValue(raw.id),
  code: stringValue(raw.code_p ?? raw.current ?? raw.pays),
  label: stringValue(raw.pays ?? raw.current ?? raw.code_p),
  exchange_rate: numberValue(raw.usd ?? raw.rate_ex ?? raw.exchange_rate),
});

const normalizeStaff = (raw: ApiRecord): HSTAFF => ({
  id: stringValue(raw.id),
  number: numberValue(raw.number),
  first_name: stringValue(raw.first_name),
  last_name: stringValue(raw.last_name),
  poste: stringValue(raw.poste),
});

const normalizeDispatching = (raw: ApiRecord): RSTAFF => ({
  id: stringValue(raw.id),
  date: stringValue(raw.date),
  room_num: stringValue(raw.room_num),
  guest_name: stringValue(raw.guest_name),
  arrival_date: stringValue(raw.arrival_date),
  depart_date: stringValue(raw.depart_date),
  status: roomStatusValue(raw.status, "VC"),
  staff_number: numberValue(raw.staff_number),
  staff_name: stringValue(raw.staff_name),
  category: stringValue(raw.category),
});

const normalizeLaundryCategory = (raw: ApiRecord): CATLAUNDRY => ({
  id: stringValue(raw.id),
  code: stringValue(raw.code),
  name: stringValue(raw.libelle ?? raw.name),
});

const normalizeLaundryService = (raw: ApiRecord): HSERVICE => ({
  id: stringValue(raw.id),
  designation: stringValue(raw.designation),
  type: stringValue(raw.type),
  qty: numberValue(raw.qty),
  puv: numberValue(raw.puv),
  category: stringValue(raw.category),
  room_num: stringValue(raw.room_num),
  guest_name: stringValue(raw.guest_name),
});

const normalizeLaundryJournal = (raw: ApiRecord): JLAUNDRY => ({
  id: stringValue(raw.id),
  date: stringValue(raw.date),
  room_num: stringValue(raw.room_num),
  designation: stringValue(raw.designation),
  unity: numberValue(raw.unity),
  qty: numberValue(raw.qty),
  price: numberValue(raw.puv ?? raw.price),
  total: numberValue(raw.total),
});

const normalizeRequisition = (raw: ApiRecord): REQUIS => ({
  id: stringValue(raw.id),
  code_p: stringValue(raw.code_p),
  date_d: stringValue(raw.date_d),
  poste: stringValue(raw.poste),
  libelle: stringValue(raw.libelle),
  qty: numberValue(raw.qte ?? raw.qty),
  credit_1: numberValue(raw.credit_1),
  credit_2: numberValue(raw.credit_2),
  date_r: stringValue(raw.date_r),
  statut: stringValue(raw.statut),
});

const normalizeEvent = (raw: ApiRecord): EventRecord => ({
  id: stringValue(raw.id),
  lot: stringValue(raw.lot),
  nature: stringValue(raw.nature),
});

const normalizeBanquetService = (raw: ApiRecord): BanquetService => ({
  id: stringValue(raw.id),
  date: stringValue(raw.date),
  lot: stringValue(raw.lot),
  nature: stringValue(raw.nature),
  item: stringValue(raw.item),
  unity: stringValue(raw.unity),
  qty: numberValue(raw.qty),
  puv: numberValue(raw.puv),
});

const normalizeBanquetJournal = (raw: ApiRecord): JBANQUET => ({
  id: stringValue(raw.id),
  date: stringValue(raw.date),
  room_num: stringValue(raw.room_num),
  groupe_name: stringValue(raw.groupe_name),
  lot: stringValue(raw.code_art ?? raw.lot),
  nature: stringValue(raw.nature),
  item: stringValue(raw.designation ?? raw.item),
  unity: stringValue(raw.unity),
  qty: numberValue(raw.qty),
  price: numberValue(raw.puv ?? raw.price),
  total: numberValue(raw.amount ?? raw.total),
});

const normalizeTempo = (raw: ApiRecord): TEMPO => ({
  id: stringValue(raw.id),
  date: stringValue(raw.date),
  room_num: stringValue(raw.room_num),
  guest_name: stringValue(raw.guest_name),
  designation: stringValue(raw.designation),
  qty: numberValue(raw.qty),
  unity: numberValue(raw.unity),
  puv: numberValue(raw.puv),
  credit: numberValue(raw.credit),
  debit: numberValue(raw.debit),
  phone: stringValue(raw.phone),
  tin: stringValue(raw.tin),
  invoice_num: stringValue(raw.invoice_num),
  mode_payt: stringValue(raw.mode_payt),
  current_mon: stringValue(raw.current_mon, "RWF"),
});

const normalizeInvoicePreview = (raw: ApiRecord): InvoicePreviewResponse => ({
  room_num: stringValue(raw.room_num),
  guest_name: stringValue(raw.guest_name),
  groupe_name: stringValue(raw.groupe_name),
  code_g: stringValue(raw.code_g),
  number_pers: numberValue(raw.number_pers),
  arrival_date: stringValue(raw.arrival_date),
  depart_date: stringValue(raw.depart_date),
  items: Array.isArray(raw.items)
    ? raw.items.map((item) => normalizeTempo(item as ApiRecord))
    : [],
  total_charges: numberValue(raw.total_charges),
  total_paid: numberValue(raw.total_paid),
  balance_due: numberValue(raw.balance_due),
  group_deposit: numberValue(raw.group_deposit),
  invoice_number: stringValue(raw.invoice_number),
  date: stringValue(raw.date),
  username: stringValue(raw.username),
  tax: (raw.tax as Record<string, unknown> | undefined) ?? {},
});

// ══════════════════════════════════════════════════════
// WRITE payload transformers (frontend → backend)
// ══════════════════════════════════════════════════════

/** Transform a frontend RDF to backend room payload */
const toRoomPayload = (room: Partial<RDF>): ApiRecord => {
  const payload: ApiRecord = { ...room };
  if ("categorie" in payload) {
    payload.categorie_code = payload.categorie;
    delete payload.categorie;
  }
  if ("status" in payload) {
    payload.status_code = payload.status;
    delete payload.status;
  }
  if ("qty" in payload) {
    payload.nights = payload.qty;
    delete payload.qty;
  }
  delete payload.id;
  return payload;
};

/** Transform a frontend RCS to backend reservation payload */
const toReservationPayload = (res: Partial<RCS>): ApiRecord => {
  const payload: ApiRecord = { ...res };
  if ("status" in payload) {
    payload.reservation_status = payload.status;
    delete payload.status;
  }
  delete payload.id;
  // qty is computed for display only; not a backend field
  if ("qty" in payload) {
    delete payload.qty;
  }
  // payt_mode is a FK (UUID) — empty string is invalid; send null instead
  if (!payload.payt_mode) payload.payt_mode = null;
  // airport_time is a TimeField — empty string is invalid; send null instead
  if (!payload.airport_time) payload.airport_time = null;
  return payload;
};

/** Transform a frontend GRC to backend group payload */
const toGroupPayload = (group: Partial<GRC>): ApiRecord => {
  const payload: ApiRecord = { ...group };
  if ("status" in payload) {
    payload.group_status = payload.status;
    delete payload.status;
  }
  delete payload.id;
  // qty is computed for display only; not a backend field
  if ("qty" in payload) {
    delete payload.qty;
  }
  // payt_mode is a FK (UUID) — empty string is invalid; send null instead
  if (!payload.payt_mode) payload.payt_mode = null;
  // code_g is required (max 3 chars, unique) — auto-generate if empty
  if (!payload.code_g) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    payload.code_g = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }
  return payload;
};

export const authApi = {
  async login(username: string, password: string) {
    const { data } = await api.post<AuthTokens>("/auth/login/", {
      username,
      password,
    });
    return data;
  },
  async logout(refresh: string) {
    await api.post("/auth/logout/", { refresh });
  },
  async me() {
    const { data } = await api.get<AuthProfile>("/auth/me/");
    return data;
  },
};

export const coreApi = {
  async statuses() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/statuses/");
    return data.map(normalizeStatus);
  },
  async modep() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/modep/");
    return data.map(normalizePaymentMode);
  },
  async catrooms() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/catrooms/");
    return data.map(normalizeCategory);
  },
  async createCatroom(payload: { code_cat: number; designation: string }) {
    const { data } = await api.post<ApiRecord>("/v1/core/catrooms/", payload);
    return normalizeCategory(data);
  },
  async updateCatroom(
    id: string,
    payload: { code_cat?: number; designation?: string },
  ) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/core/catrooms/${id}/`,
      payload,
    );
    return normalizeCategory(data);
  },
  async deleteCatroom(id: string) {
    await api.delete(`/v1/core/catrooms/${id}/`);
  },
  async exchange() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/exchange/");
    // Find the Rwanda row (country code +250) and expand into per-currency entries
    const rwanda = data.find((r) => String(r.code_p) === "+250");
    if (!rwanda) return data.map(normalizeCurrency);

    const currencyFields: Array<{ code: string; label: string; field: string }> = [
      { code: "USD", label: "US Dollar", field: "usd" },
      { code: "GBP", label: "British Pound", field: "gbp" },
      { code: "EUR", label: "Euro", field: "eur" },
      { code: "JPY", label: "Japanese Yen", field: "jpy" },
      { code: "CHF", label: "Swiss Franc", field: "chf" },
    ];

    return currencyFields.map((cf) => ({
      id: stringValue(rwanda.id),
      code: cf.code,
      label: cf.label,
      exchange_rate: numberValue(rwanda[cf.field]),
    }));
  },
  async taxes() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/taxes/");
    return data;
  },
  async sites() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/sites/");
    return data;
  },
  async requis() {
    const { data } = await api.get<ApiRecord[]>("/v1/core/requis/");
    return data.map(normalizeRequisition);
  },
  async createRequis(payload: {
    code_p: string;
    date_d: string;
    poste: string;
    libelle: string;
    qte: number;
    credit_1?: number;
    credit_2?: number;
    date_r?: string;
    statut?: string;
  }) {
    const { data } = await api.post<ApiRecord>("/v1/core/requis/", payload);
    return normalizeRequisition(data);
  },
  async updateRequis(
    id: string,
    payload: {
      code_p?: string;
      date_d?: string;
      poste?: string;
      libelle?: string;
      qte?: number;
      credit_1?: number;
      credit_2?: number;
      date_r?: string;
      statut?: string;
    },
  ) {
    const { data } = await api.patch<ApiRecord>(`/v1/core/requis/${id}/`, payload);
    return normalizeRequisition(data);
  },
  async deleteRequis(id: string) {
    await api.delete(`/v1/core/requis/${id}/`);
  },
};

export const frontOfficeApi = {
  async rooms(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/front-office/rooms/", {
      params,
    });
    return data.map(normalizeRoom);
  },
  async room(id: string) {
    const { data } = await api.get<ApiRecord>(`/v1/front-office/rooms/${id}/`);
    return normalizeRoom(data);
  },
  async createRoom(payload: Partial<RDF>) {
    const { data } = await api.post<ApiRecord>("/v1/front-office/rooms/", toRoomPayload(payload));
    return normalizeRoom(data);
  },
  async updateRoom(id: string, payload: Partial<RDF>) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/front-office/rooms/${id}/`,
      toRoomPayload(payload),
    );
    return normalizeRoom(data);
  },
  async deleteRoom(id: string) {
    await api.delete(`/v1/front-office/rooms/${id}/`);
  },
  async findRoom(payload: { room_num?: string; guest_name?: string }) {
    const { data } = await api.post<ApiRecord[]>(
      "/v1/front-office/rooms/find/",
      payload,
    );
    return data.map(normalizeRoom);
  },
  async moveGuest(payload: { old_room_num: string; new_room_num: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/rooms/move/",
      payload,
    );
    return {
      detail: stringValue(data.detail),
      old_room: normalizeRoom((data.old_room ?? {}) as ApiRecord),
      new_room: normalizeRoom((data.new_room ?? {}) as ApiRecord),
    };
  },
  async twin(id: string, payload: { twin_name: string; twin_num: number }) {
    const { data } = await api.post<ApiRecord>(
      `/v1/front-office/rooms/${id}/twin/`,
      payload,
    );
    return normalizeRoom(data);
  },
  async reservations(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>(
      "/v1/front-office/reservations/",
      { params },
    );
    return data.map(normalizeReservation);
  },
  async reservation(id: string) {
    const { data } = await api.get<ApiRecord>(
      `/v1/front-office/reservations/${id}/`,
    );
    return normalizeReservation(data);
  },
  async createReservation(payload: Partial<RCS>) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/",
      toReservationPayload(payload),
    );
    return normalizeReservation(data);
  },
  async updateReservation(id: string, payload: Partial<RCS>) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/front-office/reservations/${id}/`,
      toReservationPayload(payload),
    );
    return normalizeReservation(data);
  },
  async deleteReservation(id: string) {
    await api.delete(`/v1/front-office/reservations/${id}/`);
  },
  async checkin(payload: { room_num: string; guest_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/checkin/",
      payload,
    );
    return {
      detail: stringValue(data.detail),
      reservation: normalizeReservation((data.reservation ?? {}) as ApiRecord),
      room: normalizeRoom((data.room ?? {}) as ApiRecord),
    };
  },
  async walkin(payload: Partial<RCS>) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/walkin/",
      toReservationPayload(payload),
    );
    return {
      detail: stringValue(data.detail),
      reservation: normalizeReservation((data.reservation ?? {}) as ApiRecord),
      room: normalizeRoom((data.room ?? {}) as ApiRecord),
    };
  },
  async groupCheckin(payload: Partial<RCS> & { groupe_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/group-checkin/",
      payload,
    );
    return {
      detail: stringValue(data.detail),
      reservation: normalizeReservation((data.reservation ?? {}) as ApiRecord),
      room: normalizeRoom((data.room ?? {}) as ApiRecord),
    };
  },
  async checkout(payload: { room_num: string; guest_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/checkout/",
      payload,
    );
    return {
      detail: stringValue(data.detail),
      archive: normalizeReservationArchive((data.archive ?? {}) as ApiRecord),
    };
  },
  async groupCheckout(payload: { groupe_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/group-checkout/",
      payload,
    );
    return {
      detail: stringValue(data.detail),
      archive: normalizeGroupReservation((data.archive ?? {}) as ApiRecord),
    };
  },
  async previewInvoice(payload: { room_num: string; guest_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/preview-invoice/",
      payload,
    );
    return normalizeInvoicePreview(data);
  },
  async generateInvoice(payload: {
    room_num: string;
    guest_name: string;
    mode_payt?: string;
    phone?: string;
    country_code?: string;
    tin?: string;
  }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/generate-invoice/",
      payload,
    );
    return normalizeInvoicePreview(data);
  },
  async previewGroupInvoice(payload: { groupe_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/preview-group-invoice/",
      payload,
    );
    return normalizeInvoicePreview(data);
  },
  async generateGroupInvoice(payload: {
    groupe_name: string;
    mode_payt?: string;
    phone?: string;
    country_code?: string;
    tin?: string;
  }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/front-office/reservations/generate-group-invoice/",
      payload,
    );
    return normalizeInvoicePreview(data);
  },
  async archives() {
    const { data } = await api.get<ApiRecord[]>("/v1/front-office/archives/");
    return data.map(normalizeReservationArchive);
  },
  async groups(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/front-office/groups/", {
      params,
    });
    return data.map(normalizeGroupReservation);
  },
  async createGroup(payload: Partial<GRC>) {
    const { data } = await api.post<ApiRecord>("/v1/front-office/groups/", toGroupPayload(payload));
    return normalizeGroupReservation(data);
  },
  async updateGroup(id: string, payload: Partial<GRC>) {
    const { data } = await api.patch<ApiRecord>(`/v1/front-office/groups/${id}/`, toGroupPayload(payload));
    return normalizeGroupReservation(data);
  },
  async deleteGroup(id: string) {
    await api.delete(`/v1/front-office/groups/${id}/`);
  },
  async groupArchives() {
    const { data } = await api.get<ApiRecord[]>(
      "/v1/front-office/group-archives/",
    );
    return data.map((item) => normalizeGroupReservation(item) as GRCA);
  },
};

export const housekeepingApi = {
  async staff() {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/staff/");
    return data.map(normalizeStaff);
  },
  async createStaff(payload: Partial<HSTAFF>) {
    const { data } = await api.post<ApiRecord>("/v1/housekeeping/staff/", payload);
    return normalizeStaff(data);
  },
  async updateStaff(id: string, payload: Partial<HSTAFF>) {
    const { data } = await api.patch<ApiRecord>(`/v1/housekeeping/staff/${id}/`, payload);
    return normalizeStaff(data);
  },
  async deleteStaff(id: string) {
    await api.delete(`/v1/housekeeping/staff/${id}/`);
  },
  async dispatching() {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/dispatching/");
    return data.map(normalizeDispatching);
  },
  async assignStaff(payload: { staff_number: number; room_num: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/housekeeping/dispatching/assign/",
      payload,
    );
    return normalizeDispatching(data);
  },
  async closeDay() {
    const { data } = await api.post<ApiRecord>("/v1/housekeeping/dispatching/close-day/");
    return stringValue(data.detail);
  },
  async journal(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/journal/", {
      params,
    });
    return data.map(normalizeDispatching);
  },
  async roomStatus(category: number | string) {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/room-status/", {
      params: { category },
    });
    return data.map(normalizeRoom);
  },
  async updateRoomStatus(payload: { room_num: string; status_code: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/housekeeping/room-status/update/",
      payload,
    );
    return normalizeRoom(data);
  },
  async bulkUpdateRoomStatus(payload: { room_nums: string[]; status_code: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/housekeeping/room-status/bulk-update/",
      payload,
    );
    return stringValue(data.detail);
  },
  async dailyRoomReport() {
    const { data } = await api.get<ApiRecord>("/v1/housekeeping/room-status/daily-report/");
    return data;
  },
  async laundryCategories() {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/laundry-categories/");
    return data.map(normalizeLaundryCategory);
  },
  async createLaundryCategory(payload: { code: string; libelle: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/housekeeping/laundry-categories/",
      payload,
    );
    return normalizeLaundryCategory(data);
  },
  async updateLaundryCategory(id: string, payload: { code: string; libelle: string }) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/housekeeping/laundry-categories/${id}/`,
      payload,
    );
    return normalizeLaundryCategory(data);
  },
  async deleteLaundryCategory(id: string) {
    await api.delete(`/v1/housekeeping/laundry-categories/${id}/`);
  },
  async laundryServices(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/laundry-services/", {
      params,
    });
    return data.map(normalizeLaundryService);
  },
  async createLaundryService(payload: Partial<HSERVICE>) {
    const { data } = await api.post<ApiRecord>(
      "/v1/housekeeping/laundry-services/",
      payload,
    );
    return normalizeLaundryService(data);
  },
  async updateLaundryService(id: string, payload: Partial<HSERVICE>) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/housekeeping/laundry-services/${id}/`,
      payload,
    );
    return normalizeLaundryService(data);
  },
  async deleteLaundryService(id: string) {
    await api.delete(`/v1/housekeeping/laundry-services/${id}/`);
  },
  async loadLaundryBuffer(payload: { category: string }) {
    const { data } = await api.post<ApiRecord[]>(
      "/v1/housekeeping/laundry-orders/load-buffer/",
      payload,
    );
    return data.map(normalizeLaundryJournal);
  },
  async laundryBuffer() {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/laundry-orders/buffer/");
    return data.map(normalizeLaundryJournal);
  },
  async updateLaundryBuffer(id: string, payload: { qty?: number; room_num?: string; date?: string }) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/housekeeping/laundry-orders/${id}/update-buffer/`,
      payload,
    );
    return normalizeLaundryJournal(data);
  },
  async confirmLaundry(payload: { room_num: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/housekeeping/laundry-orders/confirm/",
      payload,
    );
    return stringValue(data.detail);
  },
  async laundryJournal(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/laundry-journal/", {
      params,
    });
    return data.map(normalizeLaundryJournal);
  },
  async laundryArchive() {
    const { data } = await api.get<ApiRecord[]>("/v1/housekeeping/laundry-archive/");
    return data.map(normalizeLaundryJournal);
  },
};

export const banquetingApi = {
  async events() {
    const { data } = await api.get<ApiRecord[]>("/v1/banqueting/events/");
    return data.map(normalizeEvent);
  },
  async createEvent(payload: Partial<EventRecord>) {
    const { data } = await api.post<ApiRecord>("/v1/banqueting/events/", payload);
    return normalizeEvent(data);
  },
  async updateEvent(id: string, payload: Partial<EventRecord>) {
    const { data } = await api.patch<ApiRecord>(`/v1/banqueting/events/${id}/`, payload);
    return normalizeEvent(data);
  },
  async deleteEvent(id: string) {
    await api.delete(`/v1/banqueting/events/${id}/`);
  },
  async services(params?: Record<string, string | number>) {
    const { data } = await api.get<ApiRecord[]>("/v1/banqueting/services/", {
      params,
    });
    return data.map(normalizeBanquetService);
  },
  async createService(payload: Partial<BanquetService>) {
    const { data } = await api.post<ApiRecord>("/v1/banqueting/services/", payload);
    return normalizeBanquetService(data);
  },
  async updateService(id: string, payload: Partial<BanquetService>) {
    const { data } = await api.patch<ApiRecord>(`/v1/banqueting/services/${id}/`, payload);
    return normalizeBanquetService(data);
  },
  async deleteService(id: string) {
    await api.delete(`/v1/banqueting/services/${id}/`);
  },
  async verifyGroup(payload: { groupe_name: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/banqueting/orders/verify-group/",
      payload,
    );
    return data;
  },
  async loadBuffer(payload: { lot: string; groupe_name: string }) {
    const { data } = await api.post<ApiRecord[]>(
      "/v1/banqueting/orders/load-buffer/",
      payload,
    );
    return data.map(normalizeBanquetJournal);
  },
  async orderBuffer() {
    const { data } = await api.get<ApiRecord[]>("/v1/banqueting/orders/buffer/");
    return data.map(normalizeBanquetJournal);
  },
  async updateOrderBuffer(id: string, payload: { qty?: number; date?: string }) {
    const { data } = await api.patch<ApiRecord>(
      `/v1/banqueting/orders/${id}/update-buffer/`,
      payload,
    );
    return normalizeBanquetJournal(data);
  },
  async confirmOrder(payload: { groupe_name: string; payt_mode?: string }) {
    const { data } = await api.post<ApiRecord>(
      "/v1/banqueting/orders/confirm/",
      payload,
    );
    return stringValue(data.detail);
  },
  async journal(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/banqueting/journal/", {
      params,
    });
    return data.map(normalizeBanquetJournal);
  },
  async archive(params?: Record<string, string>) {
    const { data } = await api.get<ApiRecord[]>("/v1/banqueting/archive/", {
      params,
    });
    return data.map(normalizeBanquetJournal);
  },
};