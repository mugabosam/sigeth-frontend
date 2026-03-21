/**
 * Housekeeping Form Validation Utilities
 * Provides validation functions and error handling for housekeeping module forms
 */

import type { CATROOM, HSTAFF, CATLAUNDRY, REQUIS, HSERVICE, RDF } from '../types';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Helper: Validate name format (letters, spaces, hyphens, apostrophes only)
export function isValidName(name: string): boolean {
    if (!name || name.trim() === '') return false;
    const regex = /^[a-zA-Z\s\-']{2,}$/;
    return regex.test(name.trim());
}

// Room Categories Validation
export function validateRoomCategory(category: CATROOM): ValidationResult {
    const errors: ValidationError[] = [];

    if (!category.code || category.code === 0) {
        errors.push({ field: 'code', message: 'codeRequired' });
    }

    if (!category.name || category.name.trim() === '') {
        errors.push({ field: 'name', message: 'categoryNameRequired' });
    }

    if (category.name && category.name.length > 100) {
        errors.push({ field: 'name', message: 'invalidFormat' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Housekeeping Staff Validation
export function validateHousekeepingStaff(staff: HSTAFF): ValidationResult {
    const errors: ValidationError[] = [];

    if (!staff.number || staff.number === 0) {
        errors.push({ field: 'number', message: 'staffNumberRequired' });
    }

    if (!staff.first_name || staff.first_name.trim() === '') {
        errors.push({ field: 'first_name', message: 'firstNameRequired' });
    } else if (!isValidName(staff.first_name)) {
        errors.push({ field: 'first_name', message: 'nameLettersOnly' });
    }

    if (!staff.last_name || staff.last_name.trim() === '') {
        errors.push({ field: 'last_name', message: 'lastNameRequired' });
    } else if (!isValidName(staff.last_name)) {
        errors.push({ field: 'last_name', message: 'nameLettersOnly' });
    }

    if (!staff.poste || staff.poste.trim() === '') {
        errors.push({ field: 'poste', message: 'positionRequired' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Laundry Categories Validation
export function validateLaundryCategory(category: CATLAUNDRY): ValidationResult {
    const errors: ValidationError[] = [];

    if (!category.code || category.code.trim() === '') {
        errors.push({ field: 'code', message: 'codeRequired' });
    }

    if (!category.name || category.name.trim() === '') {
        errors.push({ field: 'name', message: 'categoryNameRequired' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Laundry Services Validation
export function validateLaundryService(service: HSERVICE): ValidationResult {
    const errors: ValidationError[] = [];

    if (!service.designation || service.designation.trim() === '') {
        errors.push({ field: 'designation', message: 'fieldRequired' });
    }

    if (!service.type || service.type.trim() === '') {
        errors.push({ field: 'type', message: 'fieldRequired' });
    }

    if (service.qty <= 0) {
        errors.push({ field: 'qty', message: 'quantityMustBePositive' });
    }

    if (service.puv < 0) {
        errors.push({ field: 'puv', message: 'priceMustBePositive' });
    }

    if (!service.category || service.category.trim() === '') {
        errors.push({ field: 'category', message: 'fieldRequired' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Request Note Validation
export function validateRequestNote(req: REQUIS): ValidationResult {
    const errors: ValidationError[] = [];

    if (!req.code_p || req.code_p.trim() === '') {
        errors.push({ field: 'code_p', message: 'fieldRequired' });
    }

    if (!req.date_d || req.date_d.trim() === '') {
        errors.push({ field: 'date_d', message: 'dateRequired' });
    }

    if (!req.libelle || req.libelle.trim() === '') {
        errors.push({ field: 'libelle', message: 'fieldRequired' });
    }

    if (req.qty <= 0) {
        errors.push({ field: 'qty', message: 'quantityMustBePositive' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Room Validation
export function validateRoom(room: RDF): ValidationResult {
    const errors: ValidationError[] = [];

    if (!room.room_num || room.room_num.trim() === '') {
        errors.push({ field: 'room_num', message: 'roomNumberRequired' });
    }

    // designation is optional (backend allows blank)

    if (room.price_1 < 0) {
        errors.push({ field: 'price_1', message: 'priceMustBePositive' });
    }

    if (room.price_2 < 0) {
        errors.push({ field: 'price_2', message: 'priceMustBePositive' });
    }

    if (room.puv < 0) {
        errors.push({ field: 'puv', message: 'priceMustBePositive' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Get error message (helper to translate error codes to UI messages)
export function getErrorMessage(errorKey: string): string {
    const errorMessages: Record<string, string> = {
        codeRequired: 'Code is required',
        nameRequired: 'Name is required',
        dateRequired: 'Date is required',
        categoryNameRequired: 'Category name is required',
        staffNumberRequired: 'Staff number is required',
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        positionRequired: 'Position is required',
        roomNumberRequired: 'Room number is required',
        quantityMustBePositive: 'Quantity must be greater than zero',
        priceMustBePositive: 'Price must be greater than or equal to zero',
        fieldRequired: 'This field is required',
        invalidFormat: 'Invalid format',
    };

    return errorMessages[errorKey] || 'Validation error';
}

// Check for duplicates (code uniqueness)
export function checkDuplicateCode<T extends { code: string | number }>(
    newItem: T,
    existingItems: T[],
    isNew: boolean
): boolean {
    if (!isNew) return false; // Allow editing same item

    return existingItems.some((item) => item.code === newItem.code);
}
