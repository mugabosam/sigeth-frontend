import type { ValidationError } from './roomsAttendantValidation';

/**
 * Formats validation errors into user-friendly messages
 * Hides technical codes and provides clear guidance
 */
export function formatValidationErrors(
    errors: ValidationError[],
    t: (key: any) => string
): { title: string; message: string } {
    if (errors.length === 0) {
        return {
            title: 'No errors',
            message: '',
        };
    }

    // Create user-friendly messages (just the translated error descriptions)
    const messages = errors.map((error) => t(error.message as any));

    // Generate appropriate title and message
    if (errors.length === 1) {
        return {
            title: 'Please fix this issue:',
            message: messages[0],
        };
    }

    if (errors.length <= 3) {
        return {
            title: `Please fix these ${errors.length} issues:`,
            message: messages.join(' | '),
        };
    }

    return {
        title: `Please fix these ${errors.length} issues before proceeding:`,
        message: messages.join(' | '),
    };
}

/**
 * Creates a formatted notification message from validation errors
 */
export function createErrorNotification(
    errors: ValidationError[],
    t: (key: any) => string
): string {
    const { title, message } = formatValidationErrors(errors, t);

    if (!message) return title;
    return `${title} ${message}`;
}
