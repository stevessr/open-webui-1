import { writable } from 'svelte/store';
import { baseUrl } from '$lib/stores';
import { get } from 'svelte/store';

// Store for managing connection error modal state
export const connectionError = writable<{
	show: boolean;
	error: string;
	currentUrl: string;
	retryCallback?: () => void;
}>({
	show: false,
	error: '',
	currentUrl: '',
	retryCallback: undefined
});

// Common network error patterns that suggest connection issues
const CONNECTION_ERROR_PATTERNS = [
	'fetch',
	'network',
	'connection',
	'timeout',
	'refused',
	'unreachable',
	'ECONNREFUSED',
	'ENOTFOUND',
	'ETIMEDOUT',
	'ERR_NETWORK',
	'ERR_INTERNET_DISCONNECTED',
	'ERR_CONNECTION_REFUSED',
	'Failed to fetch'
];

// Check if an error is likely a connection issue
export function isConnectionError(error: any): boolean {
	if (!error) return false;
	
	const errorString = error.toString().toLowerCase();
	
	// Check for common connection error patterns
	return CONNECTION_ERROR_PATTERNS.some(pattern => 
		errorString.includes(pattern.toLowerCase())
	);
}

// Show connection error modal with retry capability
export function showConnectionError(error: string, retryCallback?: () => void) {
	const currentBaseUrl = get(baseUrl);

	connectionError.set({
		show: true,
		error: error,
		currentUrl: currentBaseUrl,
		retryCallback: retryCallback || (() => {
			// Default retry: try to auto-detect working base URL
			(baseUrl as any).autoDetect?.();
		})
	});
}

// Hide connection error modal
export function hideConnectionError() {
	connectionError.update(state => ({
		...state,
		show: false
	}));
}

// Enhanced fetch wrapper that handles connection errors
export async function fetchWithConnectionHandling(
	url: string, 
	options: RequestInit = {},
	retryCallback?: () => void
): Promise<Response> {
	try {
		const response = await fetch(url, {
			...options,
			// Add timeout to detect hanging connections
			signal: options.signal || AbortSignal.timeout(10000)
		});
		
		// If we get here, connection is working
		return response;
	} catch (error) {
		// Check if this is a connection error
		if (isConnectionError(error)) {
			showConnectionError(
				error instanceof Error ? error.message : 'Connection failed',
				retryCallback
			);
		}
		throw error;
	}
}

// Wrapper for API calls that automatically handles connection errors
export function createApiCall<T>(
	apiFunction: (...args: any[]) => Promise<T>
) {
	return async (...args: any[]): Promise<T> => {
		try {
			return await apiFunction(...args);
		} catch (error) {
			if (isConnectionError(error)) {
				showConnectionError(
					error instanceof Error ? error.message : 'API connection failed',
					() => apiFunction(...args)
				);
			}
			throw error;
		}
	};
}

// Test connection to current base URL
export async function testCurrentConnection(): Promise<boolean> {
	try {
		const currentBaseUrl = get(baseUrl);
		if (!currentBaseUrl) return false;
		
		const response = await fetch(`${currentBaseUrl}/api/v1/health`, {
			method: 'GET',
			signal: AbortSignal.timeout(5000)
		});
		
		return response.ok;
	} catch (error) {
		return false;
	}
}

// Auto-detect and suggest base URL based on current location
export function suggestBaseUrl(): string {
	if (typeof window === 'undefined') return '';
	
	const { protocol, hostname, port } = window.location;
	
	// Common development ports
	const devPorts = ['8080', '3000', '5000', '8000'];
	
	// If we're on a development port, suggest the backend port
	if (devPorts.includes(port)) {
		return `${protocol}//${hostname}:8080`;
	}
	
	// For production, suggest current origin
	return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

// Initialize connection monitoring
export function initConnectionMonitoring() {
	// Monitor online/offline status
	if (typeof window !== 'undefined') {
		window.addEventListener('online', () => {
			console.log('Network connection restored');
			hideConnectionError();
		});
		
		window.addEventListener('offline', () => {
			console.log('Network connection lost');
			showConnectionError('Network connection lost. Please check your internet connection.');
		});
	}
}

// Retry mechanism with exponential backoff
export class RetryHandler {
	private maxRetries: number;
	private baseDelay: number;
	
	constructor(maxRetries = 3, baseDelay = 1000) {
		this.maxRetries = maxRetries;
		this.baseDelay = baseDelay;
	}
	
	async execute<T>(
		operation: () => Promise<T>,
		onError?: (error: any, attempt: number) => void
	): Promise<T> {
		let lastError: any;
		
		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error;
				
				if (onError) {
					onError(error, attempt);
				}
				
				// Don't retry on the last attempt
				if (attempt === this.maxRetries) {
					break;
				}
				
				// Exponential backoff
				const delay = this.baseDelay * Math.pow(2, attempt - 1);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
		
		throw lastError;
	}
}
