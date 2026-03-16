/**
 * Rooms Attendant Form Validation Utilities
 *
 * FIX: Removed code_p requirement from validateIndividualReservation() and
 * validateCheckIn(). code_p is the group code — only needed for group members.
 * Individual reservations and check-ins don't have group codes.
 * Also removed code_g requirement from validateGroupReservation() since
 * the backend auto-generates it.
 */

import type { GRC, RCS } from '../types';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Helper: Email validation (strict)
function isValidEmail(email: string): boolean {
    if (!email || email.trim() === '') return false;
    // Must contain @, domain name, and extension
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
}

// Helper: Phone validation (strict with country code)
function isValidPhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return false;
    // Must start with + followed by country code and digits
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(phone.trim());
}

// Helper: ID/Passport validation (alphanumeric only, minimum 5 characters)
function isValidIdCard(id: string): boolean {
    if (!id || id.trim() === '') return false;
    // Alphanumeric only (letters A-Z, a-z, and numbers 0-9), minimum 5 characters
    const regex = /^[A-Za-z0-9]{5,}$/;
    return regex.test(id.trim());
}

// Helper: Guest name validation (letters and spaces only, no numbers or special chars)
function isValidGuestName(name: string): boolean {
    if (!name || name.trim() === '') return false;
    // Only letters (a-z, A-Z), spaces, and hyphens for names like "Jean-Pierre"
    const regex = /^[a-zA-Z\s\-']{2,}$/;
    return regex.test(name.trim());
}

// Helper: Date validation
function isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
}

// Helper: Check if date is valid future/past date
function isReasonableDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    // Allow dates within 100 years range
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 10 && year <= currentYear + 100;
}

// Group Reservation Validation
export function validateGroupReservation(group: GRC): ValidationResult {
    const errors: ValidationError[] = [];

    if (!group.groupe_name || group.groupe_name.trim() === '')
        errors.push({ field: 'groupe_name', message: 'groupNameRequired' });

    // code_g: NOT required — backend auto-generates it

    // Phone: Required and must have country code
    if (!group.phone || group.phone.trim() === '') {
        errors.push({ field: 'phone', message: 'phoneRequired' });
    } else if (!isValidPhone(group.phone)) {
        errors.push({ field: 'phone', message: 'invalidPhoneFormatCountryCode' });
    }

    // Email: Optional but if provided must be valid
    if (group.email && group.email.trim() !== '') {
        if (!isValidEmail(group.email)) {
            errors.push({ field: 'email', message: 'invalidEmailFormat' });
        }
    }

    // Number of persons: Required and must be positive
    if (!group.number_pers || group.number_pers <= 0) {
        errors.push({ field: 'number_pers', message: 'numberPersonsPositive' });
    }

    // Dates: Required and must be valid
    if (!group.arrival_date || group.arrival_date.trim() === '') {
        errors.push({ field: 'arrival_date', message: 'arrivalDateRequired' });
    } else if (!isValidDate(group.arrival_date)) {
        errors.push({ field: 'arrival_date', message: 'invalidArrivalDate' });
    } else if (!isReasonableDate(group.arrival_date)) {
        errors.push({ field: 'arrival_date', message: 'dateOutOfRange' });
    }

    if (!group.depart_date || group.depart_date.trim() === '') {
        errors.push({ field: 'depart_date', message: 'departDateRequired' });
    } else if (!isValidDate(group.depart_date)) {
        errors.push({ field: 'depart_date', message: 'invalidDepartDate' });
    } else if (!isReasonableDate(group.depart_date)) {
        errors.push({ field: 'depart_date', message: 'dateOutOfRange' });
    }

    // Check departure is after arrival
    if (group.arrival_date && group.depart_date && group.arrival_date.trim() && group.depart_date.trim()) {
        const arrival = new Date(group.arrival_date);
        const depart = new Date(group.depart_date);
        if (depart <= arrival) {
            errors.push({ field: 'depart_date', message: 'departMustBeAfterArrival' });
        }
    }

    // Price per unit: Required and must be non-negative number
    if (group.puv === undefined || group.puv === null || group.puv < 0) {
        errors.push({ field: 'puv', message: 'priceMustBeNonNegative' });
    }

    // Deposit: Required and must be non-negative number
    if (group.deposit === undefined || group.deposit === null || group.deposit < 0) {
        errors.push({ field: 'deposit', message: 'depositMustBeNonNegative' });
    }

    // Discount: Must be between 0 and 100
    if (group.discount === undefined || group.discount === null || group.discount < 0 || group.discount > 100) {
        errors.push({ field: 'discount', message: 'discountInvalid' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Individual Reservation Validation
// FIX: code_p REMOVED — individual guests have no group code
export function validateIndividualReservation(reservation: RCS): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields - Guest Name
    if (!reservation.guest_name || reservation.guest_name.trim() === '') {
        errors.push({ field: 'guest_name', message: 'guestNameRequired' });
    } else if (!isValidGuestName(reservation.guest_name)) {
        errors.push({ field: 'guest_name', message: 'guestNameLettersOnly' });
    }

    // ID Card: Optional but if provided must be valid
    if (reservation.id_card && reservation.id_card.trim() !== '') {
        if (!isValidIdCard(reservation.id_card)) {
            errors.push({ field: 'id_card', message: 'idCardAlphanumericMinLength' });
        }
    }

    // Required fields - Room Number
    if (!reservation.room_num || reservation.room_num.trim() === '') {
        errors.push({ field: 'room_num', message: 'roomNumberRequired' });
    }

    // Phone: Required and must have country code
    if (!reservation.phone || reservation.phone.trim() === '') {
        errors.push({ field: 'phone', message: 'phoneRequired' });
    } else if (!isValidPhone(reservation.phone)) {
        errors.push({ field: 'phone', message: 'invalidPhoneFormatCountryCode' });
    }

    // Email: Optional but if provided must be valid
    if (reservation.email && reservation.email.trim() !== '') {
        if (!isValidEmail(reservation.email)) {
            errors.push({ field: 'email', message: 'invalidEmailFormat' });
        }
    }

    // Adults: Required and must be at least 1
    if (!reservation.adulte || reservation.adulte <= 0) {
        errors.push({ field: 'adulte', message: 'adultsPositive' });
    }

    // Children: Optional but if provided must be non-negative
    if (reservation.children && reservation.children < 0) {
        errors.push({ field: 'children', message: 'childrenNonNegative' });
    }

    // Dates: Required and must be valid
    if (!reservation.arrival_date || reservation.arrival_date.trim() === '') {
        errors.push({ field: 'arrival_date', message: 'arrivalDateRequired' });
    } else if (!isValidDate(reservation.arrival_date)) {
        errors.push({ field: 'arrival_date', message: 'invalidArrivalDate' });
    } else if (!isReasonableDate(reservation.arrival_date)) {
        errors.push({ field: 'arrival_date', message: 'dateOutOfRange' });
    }

    if (!reservation.depart_date || reservation.depart_date.trim() === '') {
        errors.push({ field: 'depart_date', message: 'departDateRequired' });
    } else if (!isValidDate(reservation.depart_date)) {
        errors.push({ field: 'depart_date', message: 'invalidDepartDate' });
    } else if (!isReasonableDate(reservation.depart_date)) {
        errors.push({ field: 'depart_date', message: 'dateOutOfRange' });
    }

    // Check departure is after arrival
    if (reservation.arrival_date && reservation.depart_date &&
        reservation.arrival_date.trim() && reservation.depart_date.trim()) {
        const arrival = new Date(reservation.arrival_date);
        const depart = new Date(reservation.depart_date);
        if (depart <= arrival) {
            errors.push({ field: 'depart_date', message: 'departMustBeAfterArrival' });
        }
    }

    // Price per night: Required and must be non-negative number
    if (reservation.puv === undefined || reservation.puv === null || reservation.puv < 0) {
        errors.push({ field: 'puv', message: 'priceMustBeNonNegative' });
    }

    // Deposit: Required and must be non-negative number
    if (reservation.deposit === undefined || reservation.deposit === null || reservation.deposit < 0) {
        errors.push({ field: 'deposit', message: 'depositMustBeNonNegative' });
    }

    // Discount: Must be between 0 and 100
    if (reservation.discount === undefined || reservation.discount === null ||
        reservation.discount < 0 || reservation.discount > 100) {
        errors.push({ field: 'discount', message: 'discountInvalid' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Group Member Reservation Validation
export function validateGroupMemberReservation(member: RCS): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!member.code_p || member.code_p.trim() === '') {
        errors.push({ field: 'code_p', message: 'codeRequired' });
    }

    if (!member.guest_name || member.guest_name.trim() === '') {
        errors.push({ field: 'guest_name', message: 'guestNameRequired' });
    } else if (!isValidGuestName(member.guest_name)) {
        errors.push({ field: 'guest_name', message: 'guestNameLettersOnly' });
    }

    // ID Card: Optional but if provided must be valid
    if (member.id_card && member.id_card.trim() !== '') {
        if (!isValidIdCard(member.id_card)) {
            errors.push({ field: 'id_card', message: 'idCardAlphanumericMinLength' });
        }
    }

    if (!member.groupe_name || member.groupe_name.trim() === '') {
        errors.push({ field: 'groupe_name', message: 'groupNameRequired' });
    }

    if (!member.room_num || member.room_num.trim() === '') {
        errors.push({ field: 'room_num', message: 'roomNumberRequired' });
    }

    // Phone: Required and must have country code
    if (!member.phone || member.phone.trim() === '') {
        errors.push({ field: 'phone', message: 'phoneRequired' });
    } else if (!isValidPhone(member.phone)) {
        errors.push({ field: 'phone', message: 'invalidPhoneFormatCountryCode' });
    }

    // Email: Optional but if provided must be valid
    if (member.email && member.email.trim() !== '') {
        if (!isValidEmail(member.email)) {
            errors.push({ field: 'email', message: 'invalidEmailFormat' });
        }
    }

    // Adults: Required and must be non-negative
    if (member.adulte === undefined || member.adulte === null || member.adulte < 0) {
        errors.push({ field: 'adulte', message: 'adultsNonNegative' });
    }

    // Children: Optional but if provided must be non-negative
    if (member.children && member.children < 0) {
        errors.push({ field: 'children', message: 'childrenNonNegative' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Check-in Validation
// FIX: code_p REMOVED — check-in validates guest+room, not group code
export function validateCheckIn(reservation: RCS): ValidationResult {
    const errors: ValidationError[] = [];

    if (!reservation.guest_name || reservation.guest_name.trim() === '') {
        errors.push({ field: 'guest_name', message: 'guestNameRequired' });
    } else if (!isValidGuestName(reservation.guest_name)) {
        errors.push({ field: 'guest_name', message: 'guestNameLettersOnly' });
    }

    if (!reservation.room_num || reservation.room_num.trim() === '') {
        errors.push({ field: 'room_num', message: 'roomNumberRequired' });
    }

    // Phone: Required and must have country code
    if (!reservation.phone || reservation.phone.trim() === '') {
        errors.push({ field: 'phone', message: 'phoneRequired' });
    } else if (!isValidPhone(reservation.phone)) {
        errors.push({ field: 'phone', message: 'invalidPhoneFormatCountryCode' });
    }

    // Adults: Required and must be at least 1
    if (!reservation.adulte || reservation.adulte < 1) {
        errors.push({ field: 'adulte', message: 'adultsRequired' });
    }

    // Dates: Required and valid
    if (!reservation.arrival_date || reservation.arrival_date.trim() === '') {
        errors.push({ field: 'arrival_date', message: 'arrivalDateRequired' });
    } else if (!isValidDate(reservation.arrival_date)) {
        errors.push({ field: 'arrival_date', message: 'invalidArrivalDate' });
    }

    if (!reservation.depart_date || reservation.depart_date.trim() === '') {
        errors.push({ field: 'depart_date', message: 'departDateRequired' });
    } else if (!isValidDate(reservation.depart_date)) {
        errors.push({ field: 'depart_date', message: 'invalidDepartDate' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Walk-in Check-in Validation (no code required - new guest)
export function validateCheckInWalkIn(form: RCS): ValidationResult {
    const errors: ValidationError[] = [];

    // Guest name: Required
    if (!form.guest_name || form.guest_name.trim() === '') {
        errors.push({ field: 'guest_name', message: 'guestNameRequired' });
    } else if (!isValidGuestName(form.guest_name)) {
        errors.push({ field: 'guest_name', message: 'guestNameLettersOnly' });
    }

    // ID Card: Required for walk-ins
    if (!form.id_card || form.id_card.trim() === '') {
        errors.push({ field: 'id_card', message: 'idCardRequired' });
    } else if (!isValidIdCard(form.id_card)) {
        errors.push({ field: 'id_card', message: 'idCardAlphanumericMinLength' });
    }

    // Room: Required
    if (!form.room_num || form.room_num.trim() === '') {
        errors.push({ field: 'room_num', message: 'roomNumberRequired' });
    }

    // Phone: Required and must have country code
    if (!form.phone || form.phone.trim() === '') {
        errors.push({ field: 'phone', message: 'phoneRequired' });
    } else if (!isValidPhone(form.phone)) {
        errors.push({ field: 'phone', message: 'invalidPhoneFormatCountryCode' });
    }

    // Email: Optional but if provided must be valid
    if (form.email && form.email.trim() !== '') {
        if (!isValidEmail(form.email)) {
            errors.push({ field: 'email', message: 'invalidEmailFormat' });
        }
    }

    // Adults: Required and must be at least 1
    if (!form.adulte || form.adulte < 1) {
        errors.push({ field: 'adulte', message: 'adultsRequired' });
    }

    // Children: Optional but if provided must be non-negative
    if (form.children && form.children < 0) {
        errors.push({ field: 'children', message: 'childrenNonNegative' });
    }

    // Dates: Required and valid
    if (!form.arrival_date || form.arrival_date.trim() === '') {
        errors.push({ field: 'arrival_date', message: 'arrivalDateRequired' });
    } else if (!isValidDate(form.arrival_date)) {
        errors.push({ field: 'arrival_date', message: 'invalidArrivalDate' });
    }

    if (!form.depart_date || form.depart_date.trim() === '') {
        errors.push({ field: 'depart_date', message: 'departDateRequired' });
    } else if (!isValidDate(form.depart_date)) {
        errors.push({ field: 'depart_date', message: 'invalidDepartDate' });
    }

    // Check departure is after arrival
    if (form.arrival_date && form.depart_date && form.arrival_date.trim() && form.depart_date.trim()) {
        const arrival = new Date(form.arrival_date);
        const depart = new Date(form.depart_date);
        if (depart <= arrival) {
            errors.push({ field: 'depart_date', message: 'departMustBeAfterArrival' });
        }
    }

    // Price per night: Required and must be non-negative
    if (form.puv === undefined || form.puv === null || form.puv < 0) {
        errors.push({ field: 'puv', message: 'priceMustBeNonNegative' });
    }

    // Deposit: Required and must be non-negative
    if (form.deposit === undefined || form.deposit === null || form.deposit < 0) {
        errors.push({ field: 'deposit', message: 'depositMustBeNonNegative' });
    }

    // Discount: Must be between 0 and 100
    if (form.discount === undefined || form.discount === null ||
        form.discount < 0 || form.discount > 100) {
        errors.push({ field: 'discount', message: 'discountInvalid' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
