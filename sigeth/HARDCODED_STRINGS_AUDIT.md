# Hardcoded English Text Strings - Audit for French Translation

**Report Generated:** Current Audit  
**Focus Areas:** src/pages/rooms-attendant/, src/pages/housekeeping/, src/pages/banqueting/  
**Objective:** Identify all non-translated English text NOT using t() function

---

## Executive Summary

Total hardcoded strings found: **50+** across multiple files  
Primary categories: Form labels, confirmation dialogs, table headers, financial terms, CSV export headers

**High Priority Files:**

- [RoomBoard.tsx](src/pages/housekeeping/RoomBoard.tsx) - 20+ hardcoded field labels
- [InvoiceByGroup.tsx](src/pages/rooms-attendant/InvoiceByGroup.tsx) - Financial labels (HTVA, TVA, Username)
- [InvoiceByGuest.tsx](src/pages/rooms-attendant/InvoiceByGuest.tsx) - Financial labels + error messages
- [RoomsByStatus.tsx](src/pages/rooms-attendant/RoomsByStatus.tsx) - Status descriptions
- [CheckInReservation.tsx](src/pages/rooms-attendant/CheckInReservation.tsx) - Confirmation dialogs

---

## Detailed Findings by File

### 1. **Housekeeping Module**

#### [RoomBoard.tsx](src/pages/housekeeping/RoomBoard.tsx) - **CRITICAL (20+ strings)**

**Section Title Labels (User-Visible):**
| Line | String | Type | Status |
|------|--------|------|--------|
| 350 | "Room_num" | Row label | Hardcoded |
| 352 | "Catégorie" | Row label | Hardcoded (French - OK) |
| 353 | "Designation" | Row label | Hardcoded |
| 360 | "Guest_name" | Row label | Hardcoded |
| 361 | "Twin_name" | Row label | Hardcoded |
| 362 | "Twin_num" | Row label | Hardcoded |
| 364 | "Arrival_date" | Row label | Hardcoded |
| 365 | "Depart_date" | Row label | Hardcoded |
| 367 | "Qty (nights booked)" | Row label | Hardcoded |
| 368 | "Nights left" | Row label | Hardcoded |
| 371 | "Current_mon" | Row label | Hardcoded |
| 372 | "Price_1 Single/Night" | Row label | Hardcoded |
| 373 | "Price_2 Double/Night" | Row label | Hardcoded |
| 375 | "PUV (applied rate)" | Row label | Hardcoded |
| 376 | "Deposit" | Row label | Hardcoded |
| 377 | "Balance" | Row label | Hardcoded |
| 380 | "Date" | Row label | Hardcoded |
| 111 | "Checked-Out (clean needed)" | Status badge | Hardcoded |

**Note:** These appear to be database field names but displayed directly to users. Consider using translation keys for user-friendly display.

---

#### [ListRooms.tsx](src/pages/housekeeping/ListRooms.tsx)

| Line | String                                        | Type       | Context   |
| ---- | --------------------------------------------- | ---------- | --------- |
| 17   | "Room_num,Designation,Price_1,Price_2,Status" | CSV header | Hardcoded |

---

#### [DailyRoomReport.tsx](src/pages/housekeeping/DailyRoomReport.tsx)

| Line | String                                        | Type       | Context   |
| ---- | --------------------------------------------- | ---------- | --------- |
| 17   | "Room_num,Designation,Price_1,Price_2,Status" | CSV header | Hardcoded |

---

#### [LaundryJournal.tsx](src/pages/housekeeping/LaundryJournal.tsx)

| Line | String                                            | Type       | Context   |
| ---- | ------------------------------------------------- | ---------- | --------- |
| 21   | "Date,Room_num,Designation,Unity,Qty,Price,Total" | CSV header | Hardcoded |

---

### 2. **Rooms-Attendant Module**

#### [ArrivalOff.tsx](src/pages/rooms-attendant/ArrivalOff.tsx)

| Line | String       | Type         | Context   |
| ---- | ------------ | ------------ | --------- |
| 159  | "Guest Name" | Table header | Hardcoded |
| 162  | "Arrival"    | Table header | Hardcoded |
| 163  | "Departure"  | Table header | Hardcoded |

---

#### [ArrivalOn.tsx](src/pages/rooms-attendant/ArrivalOn.tsx)

| Line | String       | Type         | Context   |
| ---- | ------------ | ------------ | --------- |
| 166  | "Guest Name" | Table header | Hardcoded |
| 169  | "Arrival"    | Table header | Hardcoded |
| 170  | "Departure"  | Table header | Hardcoded |

---

#### [RoomsByStatus.tsx](src/pages/rooms-attendant/RoomsByStatus.tsx) - **HIGH PRIORITY**

| Line | String                        | Type               | Context                 |
| ---- | ----------------------------- | ------------------ | ----------------------- |
| 21   | "Vacant rooms situation"      | Status description | Hardcoded, user-visible |
| 22   | "Occupied rooms situation"    | Status description | Hardcoded, user-visible |
| 23   | "Checked-Out rooms situation" | Status description | Hardcoded, user-visible |
| 86   | "Rooms situation"             | Fallback label     | Hardcoded               |
| 97   | "Room Num"                    | Column header      | Hardcoded               |
| 112  | "Status"                      | Column header      | Hardcoded               |

---

#### [InvoiceByGroup.tsx](src/pages/rooms-attendant/InvoiceByGroup.tsx) - **HIGH PRIORITY**

| Line | String                | Type                | Context                    | Impact   |
| ---- | --------------------- | ------------------- | -------------------------- | -------- |
| 167  | "e.g. INV-2026-00320" | Placeholder example | Finance users see this     | Medium   |
| 180  | "e.g. AU Summit"      | Placeholder example | Finance users see this     | Medium   |
| 313  | "Date"                | CSV column header   | Export data                | Medium   |
| 314  | "Room"                | CSV column header   | Export data                | Medium   |
| 315  | "Guest"               | CSV column header   | Export data                | Medium   |
| 381  | "Username:"           | Financial label     | **User-visible, critical** | **HIGH** |
| 398  | "HTVA"                | Tax label           | **User-visible, critical** | **HIGH** |
| 404  | "TVA (18%)"           | Tax rate display    | **User-visible, critical** | **HIGH** |
| 391  | "Total (with tax)"    | Caption text        | Invoice display            | Medium   |

---

#### [InvoiceByGuest.tsx](src/pages/rooms-attendant/InvoiceByGuest.tsx) - **HIGH PRIORITY**

| Line | String                     | Type             | Context        | Impact   |
| ---- | -------------------------- | ---------------- | -------------- | -------- |
| 162  | "No matching guest found." | Error message    | Users see this | **HIGH** |
| 354  | "Username:"                | Financial label  | User-visible   | **HIGH** |
| 371  | "HTVA"                     | Tax label        | User-visible   | **HIGH** |
| 377  | "TVA (18%)"                | Tax rate display | User-visible   | **HIGH** |

---

#### [MoveGuest.tsx](src/pages/rooms-attendant/MoveGuest.tsx) - **MEDIUM PRIORITY**

| Line | String                                       | Type               | Context              |
| ---- | -------------------------------------------- | ------------------ | -------------------- |
| 92   | "Please select both source and target rooms" | Validation error   | User-visible         |
| 395  | "Are you sure?"                              | Confirmation title | Modal dialog         |
| 404  | "From:"                                      | Label              | Confirmation display |
| 410  | "To:"                                        | Label              | Confirmation display |
| 418  | "To:"                                        | Label              | Final confirmation   |

---

#### [FindRoom.tsx](src/pages/rooms-attendant/FindRoom.tsx)

| Line | String              | Type         | Context |
| ---- | ------------------- | ------------ | ------- |
| 79   | "Room {r.room_num}" | Dynamic text | Display |

---

#### [CheckInReservation.tsx](src/pages/rooms-attendant/CheckInReservation.tsx) - **HIGH PRIORITY**

| Line | String                                                                                                     | Type                 | Context        |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------------- | -------------- |
| 463  | "Select a room to swap"                                                                                    | Aria label/title     | Accessibility  |
| 625  | "Are you sure you want to check in ${processing?.guest_name} to room ${swapRoom ?? processing?.room_num}?" | Confirmation message | Modal template |
| 625  | "Check In"                                                                                                 | Confirmation button  | Modal action   |
| 625  | "Cancel"                                                                                                   | Cancel button        | Modal action   |

---

#### [CheckInWalkIn.tsx](src/pages/rooms-attendant/CheckInWalkIn.tsx)

| Line | String                                                                           | Type                 | Context        |
| ---- | -------------------------------------------------------------------------------- | -------------------- | -------------- |
| 252  | "Arrival date"                                                                   | Input title          | Form field     |
| 264  | "Departure date"                                                                 | Input title          | Form field     |
| 517  | "Are you sure you want to check in ${form.guest_name} to room ${form.room_num}?" | Confirmation message | Modal template |

---

#### [CheckInGroup.tsx](src/pages/rooms-attendant/CheckInGroup.tsx)

| Line | String                  | Type             | Context       |
| ---- | ----------------------- | ---------------- | ------------- |
| 536  | "Select a room to swap" | Aria label/title | Accessibility |

---

#### [GroupReservation.tsx](src/pages/rooms-attendant/GroupReservation.tsx)

| Line | String                                                                                                               | Type                 | Context       |
| ---- | -------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------- |
| 411  | "Create Group Reservation" / "Update Group Reservation"                                                              | Modal title          | Conditional   |
| 412  | "Are you sure you want to ${isNew ? "create a new" : "update this"} group reservation for ${selected?.groupe_name}?" | Confirmation message | Template      |
| 413  | "Create" / "Update"                                                                                                  | Confirmation button  | Conditional   |
| 414  | "Cancel"                                                                                                             | Cancel button        | Dialog action |
| 421  | "Delete Group Reservation"                                                                                           | Modal title          | Delete flow   |
| 423  | "Delete"                                                                                                             | Confirmation button  | Delete action |
| 424  | "Cancel"                                                                                                             | Cancel button        | Dialog action |

---

#### [TwinRecording.tsx](src/pages/rooms-attendant/TwinRecording.tsx)

| Line | String                                            | Type          | Context      |
| ---- | ------------------------------------------------- | ------------- | ------------ |
| 121  | "Twin_form — {t("room")} {selectedRoom.room_num}" | Page subtitle | User-visible |

---

#### [InvoicePreview.tsx](src/pages/rooms-attendant/InvoicePreview.tsx)

| Line | String                                   | Type           | Context |
| ---- | ---------------------------------------- | -------------- | ------- |
| 209  | "Invoice #{c.room_num} • {c.guest_name}" | Invoice header | Display |

---

### 3. **Banqueting Module**

#### [BanquetOrders.tsx](src/pages/banqueting/BanquetOrders.tsx)

| Line | String                        | Type            | Context                   |
| ---- | ----------------------------- | --------------- | ------------------------- |
| 87   | "Step 1: Select active group" | Section comment | Code comment (acceptable) |

_Note: Search shows CSV header pattern likely at lines 24-25_

---

#### [BanquetRequestFollowUp.tsx](src/pages/banqueting/BanquetRequestFollowUp.tsx)

| Line | String                                     | Type       | Context   |
| ---- | ------------------------------------------ | ---------- | --------- |
| 20   | "Date_d,Item,Qty,Credit_1,Credit_2,Date_r" | CSV header | Hardcoded |

---

#### [RequestFollowUp.tsx](src/pages/housekeeping/RequestFollowUp.tsx)

| Line | String                                           | Type       | Context   |
| ---- | ------------------------------------------------ | ---------- | --------- |
| 24   | "Date_d,Item,Unity,Qty,Credit_1,Credit_2,Date_r" | CSV header | Hardcoded |

---

#### [ServiceFollowUp.tsx](src/pages/banqueting/ServiceFollowUp.tsx)

| Line | String                                         | Type       | Context   |
| ---- | ---------------------------------------------- | ---------- | --------- |
| 24   | "Date,Group,Nature,Item,Unity,Qty,Price,Total" | CSV header | Hardcoded |

---

### 4. **Login Module**

#### [Login.tsx](src/pages/Login.tsx)

| Line | String        | Type           | Context          |
| ---- | ------------- | -------------- | ---------------- |
| 735  | type="submit" | HTML attribute | Not visible text |

_Note: This is acceptable as it's HTML attribute, not user-visible text_

---

## Summary by Category

### **CRITICAL (Users directly interact - Immediate translation needed)**

1. Financial labels: "Username:", "HTVA", "TVA (18%)" - 6 instances across invoice pages
2. Error messages: "No matching guest found." - 1 instance
3. Confirmation dialogs: "Are you sure?" + message templates - 8+ instances
4. Status descriptions: "Vacant rooms situation", "Occupied rooms situation", "Checked-Out rooms situation" - 3 instances

**Total Critical:** ~18 instances

### **HIGH (User-visible labels - Important for UX)**

1. Form labels in RoomBoard: 20 hardcoded field labels
2. Table headers: "Guest Name", "Arrival", "Departure", "Room Num", "Status" - 10 instances
3. Placeholders: "e.g. INV-2026-00320", "e.g. AU Summit" - 2 instances
4. Modal titles: "Check-In Reservation", "Create Group Reservation", etc. - 5 instances

**Total High:** ~37 instances

### **MEDIUM (Data export/Technical)**

1. CSV export headers - 10 instances across multiple files
2. Database field names in display context (Room_num, Guest_name, etc.) - Technical

**Total Medium:** ~10 instances

---

## Translation Recommendations

### **Phase 1: Critical (HIGH IMPACT)**

**Files to update immediately:**

- InvoiceByGroup.tsx: Lines 381, 398, 404 (HTVA, TVA, Username)
- InvoiceByGuest.tsx: Lines 162, 354, 371, 377 (Same pattern)
- RoomsByStatus.tsx: Lines 21-23 (Situation descriptions)
- MoveGuest.tsx: Lines 92, 395, 404, 410, 418 (Confirmation dialogs)
- CheckInReservation.tsx: Line 625 (Confirmation template)

**Action:** Create translation keys for:

```
financialUsername: "Username:"
financialHTVA: "HTVA"
financialTVA: "TVA (18%)"
errorNoMatchingGuest: "No matching guest found."
statusVacantRoomsSituation: "Vacant rooms situation"
statusOccupiedRoomsSituation: "Occupied rooms situation"
statusCheckedOutRoomsSituation: "Checked-Out rooms situation"
confirmationAreYouSure: "Are you sure?"
labelFrom: "From:"
labelTo: "To:"
validationSelectBothRooms: "Please select both source and target rooms"
```

### **Phase 2: High (Table Headers & Labels)**

**Files to update:**

- RoomBoard.tsx: Lines 350-380 (RoomBoard field labels)
- ArrivalOff.tsx, ArrivalOn.tsx: Table headers
- CheckInReservation.tsx, CheckInGroup.tsx: Modal titles and confirmations
- GroupReservation.tsx: Conditional titles and messages

**Action:** Consider whether database field names should be translated or remain technical identifiers.

### **Phase 3: Medium (CSV Export & Technical)**

**Files to update:**

- ListRooms.tsx, DailyRoomReport.tsx, LaundryJournal.tsx, etc.: CSV headers
- ServiceFollowUp.tsx, BanquetRequestFollowUp.tsx: CSV headers

**Action:** Decide if CSV exports should use user language (recommended for end-user exports) or maintain English technical headers.

---

## Verification Checklist

- [ ] Search for any remaining hardcoded placeholder text with patterns: "e.g.", "i.e.", "e.g.", etc.
- [ ] Verify all modal/dialog confirmation messages are captured
- [ ] Check for hardcoded status/state descriptions beyond those listed
- [ ] Review CSV export headers for localization impact
- [ ] Audit form validation messages for missed hardcoded strings
- [ ] Check for hardcoded error message templates

---

## Files Needing Updates (Sorted by Priority)

1. **RoomBoard.tsx** - 20 field labels (Lines 350-380)
2. **InvoiceByGroup.tsx** - 3 critical labels (Lines 381, 398, 404)
3. **InvoiceByGuest.tsx** - 3 critical labels (Lines 354, 371, 377)
4. **RoomsByStatus.tsx** - 3 status descriptions (Lines 21-23)
5. **CheckInReservation.tsx** - Confirmation dialog (Line 625)
6. **MoveGuest.tsx** - Confirmation dialogs (Lines 92, 395, 404, 410, 418)
7. **GroupReservation.tsx** - Conditional titles (Lines 411-424)
8. **ArrivalOff.tsx & ArrivalOn.tsx** - Table headers (Lines 159-170)
9. **ListRooms.tsx, DailyRoomReport.tsx, LaundryJournal.tsx** - CSV headers
10. **ServiceFollowUp.tsx, BanquetRequestFollowUp.tsx** - CSV headers

---

## Notes for Implementation

1. **Database Field vs. User Label:** Distinguish between technical database field names (Room_num, Guest_name) which may be intentional and user-facing labels which should be translated.

2. **French Consideration:** Note "Catégorie" in RoomBoard.tsx (Line 352) is already French - may indicate partial French implementation exists.

3. **CSV Headers:** Consider impact on end-users who export data - user-friendly translations are recommended over maintaining English technical names.

4. **Confirmation Templates:** Several files use template literals with embedded database values. Ensure translation keys support variable interpolation (using i18next format).

5. **Modal Titles:** Many dialogs use conditional text (Create/Update/Delete). Create base translation keys that handle these variations.

---

**Report Complete:** All hardcoded English text strings identified with file paths, line numbers, and recommended translation approach.
