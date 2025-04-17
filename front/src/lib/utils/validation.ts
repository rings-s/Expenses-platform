/**
 * Validation Utilities
 *
 * Comprehensive validation functions for form inputs:
 * - Email validation
 * - Password validation
 * - Number validation
 * - Date validation
 * - General input validation
 */

// Types for validation
export type ValidationResult = {
	valid: boolean;
	error?: string;
};

export type ValidationFunction<T> = (value: T) => ValidationResult;

export type ValidationOptions = {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: RegExp;
	customValidator?: (value: any) => ValidationResult;
};

/**
 * General input validator for string inputs
 *
 * @param value The value to validate
 * @param options Validation options
 * @returns Validation result
 */
export function validateInput(value: string, options: ValidationOptions = {}): ValidationResult {
	// Default options
	const { required = false, minLength, maxLength, pattern, customValidator } = options;

	// Check if value is required but empty
	if (required && (!value || value.trim() === '')) {
		return { valid: false, error: 'This field is required' };
	}

	// Skip further validation if value is empty and not required
	if (!required && (!value || value.trim() === '')) {
		return { valid: true };
	}

	// Check min length
	if (minLength !== undefined && value.length < minLength) {
		return {
			valid: false,
			error: `Must be at least ${minLength} character${minLength === 1 ? '' : 's'}`
		};
	}

	// Check max length
	if (maxLength !== undefined && value.length > maxLength) {
		return {
			valid: false,
			error: `Cannot exceed ${maxLength} character${maxLength === 1 ? '' : 's'}`
		};
	}

	// Check regex pattern
	if (pattern && !pattern.test(value)) {
		return { valid: false, error: 'Invalid format' };
	}

	// Run custom validator if provided
	if (customValidator) {
		return customValidator(value);
	}

	// All validations passed
	return { valid: true };
}

/**
 * Validate an email address
 *
 * @param email Email to validate
 * @param required Whether the email is required
 * @returns Validation result
 */
export function validateEmail(email: string, required: boolean = true): ValidationResult {
	// Comprehensive email regex pattern
	const emailPattern =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	return validateInput(email, {
		required,
		pattern: emailPattern,
		customValidator: (value) => {
			// Additional email validation logic
			if (value.length > 254) {
				return { valid: false, error: 'Email is too long' };
			}

			// Check for common typos in domain names
			const commonTypos = [
				{ incorrect: 'gmial', correct: 'gmail' },
				{ incorrect: 'gamil', correct: 'gmail' },
				{ incorrect: 'gmal', correct: 'gmail' },
				{ incorrect: 'hotmial', correct: 'hotmail' },
				{ incorrect: 'yaho', correct: 'yahoo' },
				{ incorrect: 'ymail', correct: 'yahoo' }
			];

			const domain = value.split('@')[1]?.toLowerCase();
			for (const typo of commonTypos) {
				if (domain?.includes(typo.incorrect)) {
					return {
						valid: false,
						error: `Did you mean ${value.split('@')[0]}@${domain.replace(typo.incorrect, typo.correct)}?`
					};
				}
			}

			return { valid: true };
		}
	});
}

/**
 * Password strength levels
 */
export enum PasswordStrength {
	WEAK = 'weak',
	MODERATE = 'moderate',
	STRONG = 'strong',
	VERY_STRONG = 'very_strong'
}

/**
 * Validate a password and determine its strength
 *
 * @param password Password to validate
 * @param options Validation options
 * @returns Validation result with password strength
 */
export function validatePassword(
	password: string,
	options: {
		required?: boolean;
		minLength?: number;
		requireLowercase?: boolean;
		requireUppercase?: boolean;
		requireNumber?: boolean;
		requireSpecial?: boolean;
	} = {}
): ValidationResult & { strength?: PasswordStrength } {
	// Default options
	const {
		required = true,
		minLength = 8,
		requireLowercase = true,
		requireUppercase = true,
		requireNumber = true,
		requireSpecial = true
	} = options;

	// Basic validation
	const baseResult = validateInput(password, {
		required,
		minLength
	});

	if (!baseResult.valid) {
		return baseResult;
	}

	// Skip further validation if not required and empty
	if (!required && !password) {
		return { valid: true, strength: PasswordStrength.WEAK };
	}

	// Check complexity requirements
	const hasLowercase = /[a-z]/.test(password);
	const hasUppercase = /[A-Z]/.test(password);
	const hasNumber = /\d/.test(password);
	const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

	const requirements = [];

	if (requireLowercase && !hasLowercase) {
		requirements.push('lowercase letter');
	}

	if (requireUppercase && !hasUppercase) {
		requirements.push('uppercase letter');
	}

	if (requireNumber && !hasNumber) {
		requirements.push('number');
	}

	if (requireSpecial && !hasSpecial) {
		requirements.push('special character');
	}

	if (requirements.length > 0) {
		return {
			valid: false,
			error: `Password must include at least one ${requirements.join(', ')}`,
			strength: PasswordStrength.WEAK
		};
	}

	// Calculate password strength
	let strength = PasswordStrength.WEAK;
	let strengthScore = 0;

	// Length-based score (0-4)
	if (password.length >= 12) strengthScore += 4;
	else if (password.length >= 10) strengthScore += 3;
	else if (password.length >= 8) strengthScore += 2;
	else if (password.length >= 6) strengthScore += 1;

	// Character type score (0-4)
	let typesCount = 0;
	if (hasLowercase) typesCount++;
	if (hasUppercase) typesCount++;
	if (hasNumber) typesCount++;
	if (hasSpecial) typesCount++;
	strengthScore += typesCount;

	// Additional checks (0-2)
	if (password.length >= 12 && typesCount >= 3) strengthScore += 1;
	if (password.length >= 14 && typesCount >= 4) strengthScore += 1;

	// Determine strength category
	if (strengthScore >= 9) strength = PasswordStrength.VERY_STRONG;
	else if (strengthScore >= 7) strength = PasswordStrength.STRONG;
	else if (strengthScore >= 5) strength = PasswordStrength.MODERATE;

	return { valid: true, strength };
}

/**
 * Check if two passwords match
 *
 * @param password Main password
 * @param confirmPassword Confirmation password
 * @returns Validation result
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
	if (password !== confirmPassword) {
		return { valid: false, error: 'Passwords do not match' };
	}

	return { valid: true };
}

/**
 * Validate a number within constraints
 *
 * @param value Number to validate
 * @param options Validation options
 * @returns Validation result
 */
export function validateNumber(
	value: number | string,
	options: {
		required?: boolean;
		min?: number;
		max?: number;
		integer?: boolean;
		positive?: boolean;
	} = {}
): ValidationResult {
	// Default options
	const { required = false, min, max, integer = false, positive = false } = options;

	// Check if value is present if required
	if (required && (value === null || value === undefined || value === '')) {
		return { valid: false, error: 'This field is required' };
	}

	// Skip further validation if value is empty and not required
	if (!required && (value === null || value === undefined || value === '')) {
		return { valid: true };
	}

	// Convert string to number if needed
	const numValue = typeof value === 'string' ? parseFloat(value) : value;

	// Check if it's a valid number
	if (isNaN(numValue)) {
		return { valid: false, error: 'Please enter a valid number' };
	}

	// Check if should be integer
	if (integer && !Number.isInteger(numValue)) {
		return { valid: false, error: 'Please enter a whole number' };
	}

	// Check if should be positive
	if (positive && numValue <= 0) {
		return { valid: false, error: 'Please enter a positive number' };
	}

	// Check min constraint
	if (min !== undefined && numValue < min) {
		return { valid: false, error: `Value must be at least ${min}` };
	}

	// Check max constraint
	if (max !== undefined && numValue > max) {
		return { valid: false, error: `Value cannot exceed ${max}` };
	}

	return { valid: true };
}

/**
 * Validate a date
 *
 * @param date Date to validate (string, Date, or timestamp)
 * @param options Validation options
 * @returns Validation result
 */
export function validateDate(
	date: string | Date | number,
	options: {
		required?: boolean;
		minDate?: Date | string | number;
		maxDate?: Date | string | number;
		format?: string;
	} = {}
): ValidationResult {
	// Default options
	const { required = false, minDate, maxDate } = options;

	// Check if value is present if required
	if (required && !date) {
		return { valid: false, error: 'This field is required' };
	}

	// Skip further validation if value is empty and not required
	if (!required && !date) {
		return { valid: true };
	}

	// Convert to Date object
	let dateObj: Date;

	try {
		dateObj =
			typeof date === 'string' ? new Date(date) : date instanceof Date ? date : new Date(date);

		// Check if it's a valid date
		if (isNaN(dateObj.getTime())) {
			return { valid: false, error: 'Please enter a valid date' };
		}
	} catch (error) {
		return { valid: false, error: 'Please enter a valid date' };
	}

	// Check min date constraint
	if (minDate) {
		const minDateObj =
			typeof minDate === 'string'
				? new Date(minDate)
				: minDate instanceof Date
					? minDate
					: new Date(minDate);

		if (dateObj < minDateObj) {
			return {
				valid: false,
				error: `Date must be on or after ${minDateObj.toLocaleDateString()}`
			};
		}
	}

	// Check max date constraint
	if (maxDate) {
		const maxDateObj =
			typeof maxDate === 'string'
				? new Date(maxDate)
				: maxDate instanceof Date
					? maxDate
					: new Date(maxDate);

		if (dateObj > maxDateObj) {
			return {
				valid: false,
				error: `Date must be on or before ${maxDateObj.toLocaleDateString()}`
			};
		}
	}

	return { valid: true };
}

/**
 * Validate a URL
 *
 * @param url URL to validate
 * @param required Whether the URL is required
 * @returns Validation result
 */
export function validateUrl(url: string, required: boolean = false): ValidationResult {
	// URL regex pattern
	const urlPattern =
		/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-_.~:/?#[\]@!$&'()*+,;=]*)?$/;

	return validateInput(url, {
		required,
		pattern: urlPattern,
		customValidator: (value) => {
			// Check for common protocol mistakes
			if (value.match(/^http:\/\//i)) {
				return {
					valid: true,
					error: 'Consider using https:// for better security'
				};
			}

			return { valid: true };
		}
	});
}

/**
 * Validate a phone number
 *
 * @param phone Phone number to validate
 * @param required Whether the phone number is required
 * @returns Validation result
 */
export function validatePhone(phone: string, required: boolean = false): ValidationResult {
	// International phone regex pattern
	const phonePattern = /^\+?[0-9\s\-()]{7,15}$/;

	return validateInput(phone, {
		required,
		pattern: phonePattern,
		customValidator: (value) => {
			// Additional validation for phone numbers
			if (value && value.replace(/\D/g, '').length < 7) {
				return { valid: false, error: 'Phone number is too short' };
			}

			return { valid: true };
		}
	});
}
