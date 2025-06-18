import { writable, derived, get } from 'svelte/store';
import { browser, dev } from '$app/environment';

// Default base URL logic with fallback mechanisms
function getDefaultBaseUrl(): string {
	if (!browser) return '';

	try {
		if (dev) {
			// Development mode: try common development ports
			const hostname = location.hostname;
			const devPorts = ['8080', '3000', '5000', '8000'];

			// If current port is a dev port, suggest 8080 as backend
			if (devPorts.includes(location.port)) {
				return `http://${hostname}:8080`;
			}

			// Default to localhost:8080 for development
			return `http://localhost:8080`;
		} else {
			// Production mode: use current origin
			return location.origin;
		}
	} catch (error) {
		console.warn('Error determining default base URL:', error);
		// Fallback to localhost in case of any errors
		return 'http://localhost:8080';
	}
}

// Get fallback URLs to try when connection fails
export function getFallbackUrls(): string[] {
	if (!browser) return [];

	const fallbacks = [];
	const hostname = location.hostname;

	// Add current origin
	fallbacks.push(location.origin);

	// Add common development URLs
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		const ports = ['8080', '3000', '5000', '8000'];
		ports.forEach(port => {
			fallbacks.push(`http://localhost:${port}`);
			if (hostname === '127.0.0.1') {
				fallbacks.push(`http://127.0.0.1:${port}`);
			}
		});
	}

	// Remove duplicates
	return [...new Set(fallbacks)];
}

// Base URL store with localStorage persistence and error handling
function createBaseUrlStore() {
	const defaultUrl = getDefaultBaseUrl();

	// Initialize with localStorage value or default, with validation
	let initialValue = defaultUrl;
	if (browser) {
		try {
			const storedUrl = localStorage.getItem('baseUrl');
			if (storedUrl) {
				const validation = validateBaseUrl(storedUrl);
				if (validation.valid) {
					initialValue = storedUrl;
				} else {
					console.warn('Invalid stored base URL, using default:', validation.error);
					// Clear invalid stored URL
					localStorage.removeItem('baseUrl');
				}
			}
		} catch (error) {
			console.warn('Error reading base URL from localStorage:', error);
		}
	}

	const { subscribe, set, update } = writable<string>(initialValue);

	return {
		subscribe,
		set: (value: string) => {
			// Validate before setting
			const validation = validateBaseUrl(value);
			if (!validation.valid) {
				throw new Error(`Invalid base URL: ${validation.error}`);
			}

			if (browser) {
				try {
					localStorage.setItem('baseUrl', value);
				} catch (error) {
					console.warn('Error saving base URL to localStorage:', error);
				}
			}
			set(value);
		},
		// Set base URL from user settings without triggering localStorage save
		setFromSettings: (value: string) => {
			const validation = validateBaseUrl(value);
			if (!validation.valid) {
				console.warn('Invalid base URL from settings, ignoring:', validation.error);
				return;
			}

			// Update both store and localStorage
			if (browser) {
				try {
					localStorage.setItem('baseUrl', value);
				} catch (error) {
					console.warn('Error saving base URL to localStorage:', error);
				}
			}
			set(value);
		},
		update,
		reset: () => {
			const defaultUrl = getDefaultBaseUrl();
			if (browser) {
				try {
					localStorage.setItem('baseUrl', defaultUrl);
				} catch (error) {
					console.warn('Error saving default base URL to localStorage:', error);
				}
			}
			set(defaultUrl);
		},
		// Get current value synchronously
		get: () => get({ subscribe }),
		// Try to auto-detect working base URL from fallbacks
		autoDetect: async () => {
			const fallbacks = getFallbackUrls();

			for (const url of fallbacks) {
				try {
					const result = await testBaseUrlConnection(url);
					if (result.success) {
						if (browser) {
							localStorage.setItem('baseUrl', url);
						}
						set(url);
						return url;
					}
				} catch (error) {
					console.warn(`Failed to connect to ${url}:`, error);
				}
			}

			// If no fallback works, reset to default
			const defaultUrl = getDefaultBaseUrl();
			if (browser) {
				localStorage.setItem('baseUrl', defaultUrl);
			}
			set(defaultUrl);
			return defaultUrl;
		}
	};
}

export const baseUrl = createBaseUrlStore();

// Derived stores for different API endpoints
export const webuiApiBaseUrl = derived(
	baseUrl,
	($baseUrl) => `${$baseUrl}/api/v1`
);

export const ollamaApiBaseUrl = derived(
	baseUrl,
	($baseUrl) => `${$baseUrl}/ollama`
);

export const openaiApiBaseUrl = derived(
	baseUrl,
	($baseUrl) => `${$baseUrl}/openai`
);

export const audioApiBaseUrl = derived(
	baseUrl,
	($baseUrl) => `${$baseUrl}/api/v1/audio`
);

export const imagesApiBaseUrl = derived(
	baseUrl,
	($baseUrl) => `${$baseUrl}/api/v1/images`
);

export const retrievalApiBaseUrl = derived(
	baseUrl,
	($baseUrl) => `${$baseUrl}/api/v1/retrieval`
);

// Utility functions
export function validateBaseUrl(url: string): { valid: boolean; error?: string } {
	if (!url) {
		return { valid: false, error: 'Base URL cannot be empty' };
	}

	try {
		const urlObj = new URL(url);
		
		// Check if protocol is http or https
		if (!['http:', 'https:'].includes(urlObj.protocol)) {
			return { valid: false, error: 'Base URL must use http or https protocol' };
		}

		// Check if hostname is valid
		if (!urlObj.hostname) {
			return { valid: false, error: 'Base URL must have a valid hostname' };
		}

		return { valid: true };
	} catch (error) {
		return { valid: false, error: 'Invalid URL format' };
	}
}

export async function testBaseUrlConnection(url: string): Promise<{ success: boolean; error?: string }> {
	try {
		const validation = validateBaseUrl(url);
		if (!validation.valid) {
			return { success: false, error: validation.error };
		}

		// Test connection by trying to fetch the API health endpoint
		const response = await fetch(`${url}/api/v1/health`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			// Add timeout
			signal: AbortSignal.timeout(5000)
		});

		if (response.ok) {
			return { success: true };
		} else {
			return { success: false, error: `Server responded with status ${response.status}` };
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				return { success: false, error: 'Connection timeout' };
			}
			return { success: false, error: error.message };
		}
		return { success: false, error: 'Unknown error occurred' };
	}
}

// Initialize base URL from user settings if available
export function initializeBaseUrlFromSettings(userSettings: any) {
	if (userSettings?.ui?.baseUrl) {
		baseUrl.setFromSettings(userSettings.ui.baseUrl);
	}
}

// Sync base URL to user settings
export function syncBaseUrlToSettings(updateUserSettingsCallback: (settings: any) => Promise<void>) {
	return baseUrl.subscribe(async (newUrl) => {
		if (browser && newUrl) {
			try {
				// Update user settings with new base URL
				await updateUserSettingsCallback({
					ui: {
						baseUrl: newUrl
					}
				});
			} catch (error) {
				console.warn('Error syncing base URL to user settings:', error);
			}
		}
	});
}

// Callback type for base URL change handlers
export type BaseUrlChangeHandler = (newUrl: string, oldUrl: string) => void;

// Store for base URL change handlers
const baseUrlChangeHandlers: BaseUrlChangeHandler[] = [];

// Subscribe to base URL changes
export function onBaseUrlChange(handler: BaseUrlChangeHandler) {
	baseUrlChangeHandlers.push(handler);

	// Return unsubscribe function
	return () => {
		const index = baseUrlChangeHandlers.indexOf(handler);
		if (index > -1) {
			baseUrlChangeHandlers.splice(index, 1);
		}
	};
}

// Notify all handlers when base URL changes
let previousUrl = '';
baseUrl.subscribe((newUrl) => {
	if (previousUrl !== newUrl && previousUrl !== '') {
		baseUrlChangeHandlers.forEach(handler => {
			try {
				handler(newUrl, previousUrl);
			} catch (error) {
				console.error('Error in base URL change handler:', error);
			}
		});
	}
	previousUrl = newUrl;
});
