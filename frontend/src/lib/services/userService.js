import api from './api';

export default {
	/**
	 * Get current user profile
	 */
	async getProfile() {
		return api.get('/accounts/profile/');
	},

	/**
	 * Update user profile
	 */
	async updateProfile(profileData) {
		return api.put('/accounts/profile/', profileData);
	},

	/**
	 * Get all users (admin only)
	 */
	async getAllUsers() {
		return api.get('/accounts/users/');
	},

	/**
	 * Get user details (admin only)
	 */
	async getUserDetails(userId) {
		return api.get(`/accounts/users/${userId}/`);
	},

	/**
	 * Update user (admin only)
	 */
	async updateUser(userId, userData) {
		return api.put(`/accounts/users/${userId}/`, userData);
	},

	/**
	 * Delete user (admin only)
	 */
	async deleteUser(userId) {
		return api.delete(`/accounts/users/${userId}/`);
	}
};
