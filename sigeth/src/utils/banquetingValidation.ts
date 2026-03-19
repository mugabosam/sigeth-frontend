/**
 * Banqueting Form Validation Utilities
 * Provides validation functions and error handling for banqueting module forms
 */

import type { EventRecord, BanquetService } from '../types';

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

// Event Record Validation
export function validateEventRecord(event: EventRecord): ValidationResult {
    const errors: ValidationError[] = [];

    if (!event.lot || event.lot.trim() === '') {
        errors.push({ field: 'lot', message: 'lotRequired' });
    }

    if (!event.nature || event.nature.trim() === '') {
        errors.push({ field: 'nature', message: 'eventNameRequired' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Banquet Service Validation
export function validateBanquetService(service: BanquetService): ValidationResult {
    const errors: ValidationError[] = [];

    if (!service.item || service.item.trim() === '') {
        errors.push({ field: 'item', message: 'itemRequired' });
    }

    if (service.qty <= 0) {
        errors.push({ field: 'qty', message: 'quantityMustBePositive' });
    }

    if (service.puv < 0) {
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
        lotRequired: 'Lot number is required',
        eventNameRequired: 'Event name is required',
        itemRequired: 'Item is required',
        dateRequired: 'Date is required',
        quantityMustBePositive: 'Quantity must be greater than zero',
        priceMustBePositive: 'Price must be greater than or equal to zero',
        fieldRequired: 'This field is required',
        invalidFormat: 'Invalid format',
    };

    return errorMessages[errorKey] || 'Validation error';
}
