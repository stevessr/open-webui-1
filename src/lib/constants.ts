import { browser, dev } from '$app/environment';
import { get } from 'svelte/store';
import { baseUrl } from './stores/baseUrl.js';
// import { version } from '../../package.json';

// Global variables defined by Vite
declare global {
	const APP_VERSION: string;
	const APP_BUILD_HASH: string;
}

export const APP_NAME = 'Open WebUI';

// Legacy constants for backward compatibility (deprecated)
export const WEBUI_HOSTNAME = browser ? (dev ? `${location.hostname}:8080` : ``) : '';
export const WEBUI_BASE_URL = browser ? (dev ? `http://${WEBUI_HOSTNAME}` : ``) : ``;

// Dynamic URL functions that use the baseUrl store
export function getWebuiBaseUrl(): string {
	return get(baseUrl) || WEBUI_BASE_URL;
}

export function getWebuiApiBaseUrl(): string {
	return `${getWebuiBaseUrl()}/api/v1`;
}

export function getOllamaApiBaseUrl(): string {
	return `${getWebuiBaseUrl()}/ollama`;
}

export function getOpenaiApiBaseUrl(): string {
	return `${getWebuiBaseUrl()}/openai`;
}

export function getAudioApiBaseUrl(): string {
	return `${getWebuiBaseUrl()}/api/v1/audio`;
}

export function getImagesApiBaseUrl(): string {
	return `${getWebuiBaseUrl()}/api/v1/images`;
}

export function getRetrievalApiBaseUrl(): string {
	return `${getWebuiBaseUrl()}/api/v1/retrieval`;
}

// Static file URL helper - handles development vs production correctly
export function getStaticUrl(path: string): string {
	// Remove leading slash if present
	const cleanPath = path.startsWith('/') ? path.slice(1) : path;

	if (browser && dev) {
		// In development mode, static files are served by Vite from the root
		// Remove 'static/' prefix if present since Vite serves static files at root
		const devPath = cleanPath.startsWith('static/') ? cleanPath.slice(7) : cleanPath;
		return `/${devPath}`;
	} else {
		// In production mode, static files are served by the backend
		const baseUrl = getWebuiBaseUrl();
		return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
	}
}

// Legacy constants for backward compatibility (deprecated - use functions above)
export const WEBUI_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1`;
export const OLLAMA_API_BASE_URL = `${WEBUI_BASE_URL}/ollama`;
export const OPENAI_API_BASE_URL = `${WEBUI_BASE_URL}/openai`;
export const AUDIO_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/audio`;
export const IMAGES_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/images`;
export const RETRIEVAL_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/retrieval`;

export const WEBUI_VERSION = APP_VERSION;
export const WEBUI_BUILD_HASH = APP_BUILD_HASH;
export const REQUIRED_OLLAMA_VERSION = '0.1.16';

export const SUPPORTED_FILE_TYPE = [
	'application/epub+zip',
	'application/pdf',
	'text/plain',
	'text/csv',
	'text/xml',
	'text/html',
	'text/x-python',
	'text/css',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/octet-stream',
	'application/x-javascript',
	'text/markdown',
	'audio/mpeg',
	'audio/wav',
	'audio/ogg',
	'audio/x-m4a'
];

export const SUPPORTED_FILE_EXTENSIONS = [
	'md',
	'rst',
	'go',
	'py',
	'java',
	'sh',
	'bat',
	'ps1',
	'cmd',
	'js',
	'ts',
	'css',
	'cpp',
	'hpp',
	'h',
	'c',
	'cs',
	'htm',
	'html',
	'sql',
	'log',
	'ini',
	'pl',
	'pm',
	'r',
	'dart',
	'dockerfile',
	'env',
	'php',
	'hs',
	'hsc',
	'lua',
	'nginxconf',
	'conf',
	'm',
	'mm',
	'plsql',
	'perl',
	'rb',
	'rs',
	'db2',
	'scala',
	'bash',
	'swift',
	'vue',
	'svelte',
	'doc',
	'docx',
	'pdf',
	'csv',
	'txt',
	'xls',
	'xlsx',
	'pptx',
	'ppt',
	'msg'
];

export const PASTED_TEXT_CHARACTER_LIMIT = 1000;

// Source: https://kit.svelte.dev/docs/modules#$env-static-public
// This feature, akin to $env/static/private, exclusively incorporates environment variables
// that are prefixed with config.kit.env.publicPrefix (usually set to PUBLIC_).
// Consequently, these variables can be securely exposed to client-side code.
