/**
 * Validation Utilities
 *
 * Comprehensive validation for forms:
 * - Email validation
 * - Password validation
 * - Authentication form validation
 * - Generic validation utilities
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

// Data structures for form validation
export type FormErrors<T extends Record<string, any>> = {
	[K in keyof T]?: string;
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
 * Validate a verification code (e.g., email verification, password reset)
 *
 * @param code Verification code
 * @param digits Number of digits expected
 * @returns Validation result
 */
export function validateVerificationCode(code: string, digits: number = 6): ValidationResult {
	if (!code) {
		return { valid: false, error: 'Verification code is required' };
	}

	if (code.length !== digits) {
		return { valid: false, error: `Code must be ${digits} digits` };
	}

	if (!/^\d+$/.test(code)) {
		return { valid: false, error: 'Code must contain only numbers' };
	}

	return { valid: true };
}

/**
 * Validate a username
 *
 * @param username Username to validate
 * @param options Validation options
 * @returns Validation result
 */
export function validateUsername(
	username: string,
	options: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		allowSpecialChars?: boolean;
	} = {}
): ValidationResult {
	const { required = true, minLength = 3, maxLength = 30, allowSpecialChars = false } = options;

	// First check if it's required
	if (required && !username) {
		return { valid: false, error: 'Username is required' };
	}

	// Skip further validation if empty and not required
	if (!required && !username) {
		return { valid: true };
	}

	// Check length
	if (username.length < minLength) {
		return { valid: false, error: `Username must be at least ${minLength} characters` };
	}

	if (username.length > maxLength) {
		return { valid: false, error: `Username cannot exceed ${maxLength} characters` };
	}

	// Check characters
	const pattern = allowSpecialChars
		? /^[a-zA-Z0-9_\-\.]+$/ // Allow letters, numbers, underscore, dash, dot
		: /^[a-zA-Z0-9_]+$/; // Only allow letters, numbers, underscore

	if (!pattern.test(username)) {
		return {
			valid: false,
			error: allowSpecialChars
				? 'Username can only contain letters, numbers, underscores, dashes, and dots'
				: 'Username can only contain letters, numbers, and underscores'
		};
	}

	return { valid: true };
}

/**
 * Validate login credentials
 *
 * @param email Email address
 * @param password Password
 * @returns Object with email and password validation results
 */
export function validateLoginCredentials(
	email: string,
	password: string
): {
	email: ValidationResult;
	password: ValidationResult;
	valid: boolean;
} {
	const emailResult = validateEmail(email);
	const passwordResult = validateInput(password, { required: true });

	return {
		email: emailResult,
		password: passwordResult,
		valid: emailResult.valid && passwordResult.valid
	};
}

/**
 * Validate registration data
 *
 * @param data Registration data
 * @returns Object with field validation results and overall validity
 */
export function validateRegistrationData(data: {
	email: string;
	username: string;
	password: string;
	password_confirm: string;
}): FormErrors<typeof data> & { valid: boolean } {
	const errors: FormErrors<typeof data> = {};

	// Validate email
	const emailResult = validateEmail(data.email);
	if (!emailResult.valid) {
		errors.email = emailResult.error;
	}

	// Validate username
	const usernameResult = validateUsername(data.username);
	if (!usernameResult.valid) {
		errors.username = usernameResult.error;
	}

	// Validate password
	const passwordResult = validatePassword(data.password);
	if (!passwordResult.valid) {
		errors.password = passwordResult.error;
	}

	// Validate password confirmation
	if (data.password !== data.password_confirm) {
		errors.password_confirm = 'Passwords do not match';
	}

	return {
		...errors,
		valid: Object.keys(errors).length === 0
	};
}

/**
 * Validate expense form data
 *
 * @param data Expense form data
 * @returns Object with validation errors
 */
export function validateExpenseForm(data: {
	title: string;
	amount: number | string;
	date: string;
	category_id?: string;
}): Record<string, string> {
	const errors: Record<string, string> = {};

	// Title validation
	if (!data.title.trim()) {
		errors.title = 'Title is required';
	} else if (data.title.length > 100) {
		errors.title = 'Title cannot exceed 100 characters';
	}

	// Amount validation
	const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;

	if (isNaN(amount) || amount <= 0) {
		errors.amount = 'Please enter a valid amount greater than zero';
	}

	// Date validation
	if (!data.date) {
		errors.date = 'Date is required';
	} else {
		try {
			const dateObj = new Date(data.date);
			if (isNaN(dateObj.getTime())) {
				errors.date = 'Please enter a valid date';
			}
		} catch (e) {
			errors.date = 'Please enter a valid date';
		}
	}

	// Optional category validation
	if (data.category_id !== undefined && data.category_id === '') {
		errors.category_id = 'Please select a category';
	}

	return errors;
}

/**
 * Extract validation errors from API response
 *
 * @param apiError Error object from API
 * @returns Formatted error object
 */
export function extractValidationErrors(apiError: any): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!apiError || typeof apiError !== 'object') {
		return errors;
	}

	// Handle Django REST Framework validation errors
	if (apiError.data && typeof apiError.data === 'object') {
		Object.entries(apiError.data).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				errors[key] = value.join(', ');
			} else if (typeof value === 'string') {
				errors[key] = value;
			}
		});
	}

	return errors;
}
