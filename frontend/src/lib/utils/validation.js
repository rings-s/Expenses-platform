/**
 * Validate an email address
 */
export function isValidEmail(email) {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return regex.test(email);
}

/**
 * Validate a strong password
 */
export function isStrongPassword(password) {
	// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
	return regex.test(password);
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password, confirmPassword) {
	return password === confirmPassword;
}

/**
 * Validate a decimal number
 */
export function isValidDecimal(value) {
	const regex = /^\d+(\.\d{1,2})?$/;
	return regex.test(value);
}

/**
 * Validate a required field
 */
export function isRequired(value) {
	if (value === null || value === undefined) return false;

	if (typeof value === 'string') {
		return value.trim().length > 0;
	}

	return true;
}

/**
 * Validate a form object with validation rules
 *
 * Example:
 * const validationRules = {
 *   email: [(v) => isValidEmail(v) || 'Invalid email address'],
 *   password: [
 *     (v) => isRequired(v) || 'Password is required',
 *     (v) => isStrongPassword(v) || 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
 *   ]
 * };
 *
 * const errors = validateForm(formData, validationRules);
 */
export function validateForm(data, rules) {
	const errors = {};

	Object.keys(rules).forEach((field) => {
		const fieldRules = rules[field];

		for (const rule of fieldRules) {
			const result = rule(data[field]);

			if (result !== true) {
				errors[field] = result;
				break;
			}
		}
	});

	return errors;
}
