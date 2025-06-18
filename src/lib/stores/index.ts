import { APP_NAME } from '$lib/constants';
import { type Writable, writable } from 'svelte/store';
import type { ModelConfig } from '$lib/apis';
import type { Banner } from '$lib/types';
import type { Socket } from 'socket.io-client';

import emojiShortCodes from '$lib/emoji-shortcodes.json';

// Backend
export const WEBUI_NAME = writable(APP_NAME);
export const config: Writable<Config | undefined> = writable(undefined);
export const user: Writable<SessionUser | undefined> = writable(undefined);

// Electron App
export const isApp = writable(false);
export const appInfo = writable(null);
export const appData = writable(null);

// Frontend
export const MODEL_DOWNLOAD_POOL = writable({});

export const mobile = writable(false);

export const socket: Writable<null | Socket> = writable(null);
export const activeUserIds: Writable<null | string[]> = writable(null);
export const USAGE_POOL: Writable<null | string[]> = writable(null);

export const theme = writable('system');

// Export base URL stores
export {
	baseUrl,
	webuiApiBaseUrl,
	ollamaApiBaseUrl,
	openaiApiBaseUrl,
	audioApiBaseUrl,
	imagesApiBaseUrl,
	retrievalApiBaseUrl,
	validateBaseUrl,
	testBaseUrlConnection,
	initializeBaseUrlFromSettings,
	syncBaseUrlToSettings,
	onBaseUrlChange
} from './baseUrl.js';

export const shortCodesToEmojis = writable(
	Object.entries(emojiShortCodes).reduce(
		(acc: Record<string, string>, [key, value]) => {
			if (typeof value === 'string') {
				acc[value] = key;
			} else {
				for (const v of value) {
					acc[v] = key;
				}
			}

			return acc;
		},
		{} as Record<string, string>
	)
);

export const TTSWorker = writable(null);

export const chatId = writable('');
export const chatTitle = writable('');

export const channels = writable([]);
export const chats = writable(null);
export const pinnedChats = writable([]);
export const tags = writable([]);

export const models: Writable<Model[]> = writable([]);

export const prompts: Writable<null | Prompt[]> = writable(null);
export const knowledge: Writable<null | Document[]> = writable(null);
export const tools = writable(null);
export const functions = writable(null);

export const toolServers = writable([]);

export const banners: Writable<Banner[]> = writable([]);

export const settings: Writable<Settings> = writable({
	chatDirection: 'auto',
	sidebarOpacity: 100,
	menuOpacity: 100, // Add default value for menu opacity
	backgroundOpacity: 100,
	backgroundOverlayOpacity: 100,
	bubbleOpacity: 100,
	chatBackgroundGradientOpacity: 100,
	overlayOpacity: 40, // Changed default value to 40
	settingsModalOpacity: 100, // Add default value for settings modal opacity
	widescreenMode: false,

	// Video Background Settings
	backgroundType: 'none',
	backgroundValue: '',
	backgroundVideoUnmute: false,
	backgroundVideoAutoplay: true,
	backgroundVideoLoop: true,
	backgroundVideoControls: false
});

export const showSidebar = writable(false);
export const showSearch = writable(false);
export const showSettings = writable(false);
export const showArchivedChats = writable(false);
export const showChangelog = writable(false);

export const showControls = writable(false);
export const showOverview = writable(false);
export const showArtifacts = writable(false);
export const showCallOverlay = writable(false);

export const artifactCode = writable(null);

export const temporaryChatEnabled = writable(false);
export const scrollPaginationEnabled = writable(false);
export const currentChatPage = writable(1);

export const isLastActiveTab = writable(true);
export const playingNotificationSound = writable(false);

export type Model = OpenAIModel | OllamaModel;

type BaseModel = {
	id: string;
	name: string;
	info?: ModelConfig;
	owned_by: 'ollama' | 'openai' | 'arena';
};

export interface OpenAIModel extends BaseModel {
	owned_by: 'openai';
	external: boolean;
	source?: string;
}

export interface OllamaModel extends BaseModel {
	owned_by: 'ollama';
	details: OllamaModelDetails;
	size: number;
	description: string;
	model: string;
	modified_at: string;
	digest: string;
	ollama?: {
		name?: string;
		model?: string;
		modified_at: string;
		size?: number;
		digest?: string;
		details?: {
			parent_model?: string;
			format?: string;
			family?: string;
			families?: string[];
			parameter_size?: string;
			quantization_level?: string;
		};
		urls?: number[];
	};
}

type OllamaModelDetails = {
	parent_model: string;
	format: string;
	family: string;
	families: string[] | null;
	parameter_size: string;
	quantization_level: string;
};

type Settings = {
	models?: string[];
	conversationMode?: boolean;
	speechAutoSend?: boolean;
	responseAutoPlayback?: boolean;
	audio?: AudioSettings;
	showUsername?: boolean;
	notificationEnabled?: boolean;
	highContrastMode?: boolean;
	title?: TitleSettings;
	splitLargeDeltas?: boolean;
	chatDirection: 'LTR' | 'RTL' | 'auto';
	ctrlEnterToSend?: boolean;

	system?: string;
	requestFormat?: string | object; // Allow string or object for requestFormat
	keepAlive?: string | number; // Allow string or number for keepAlive
	seed?: number | null; // Allow null for seed
	temperature?: string | number | null; // Allow string, number or null
	repeat_penalty?: string | number | null; // Allow string, number or null
	top_k?: string | number | null; // Allow string, number or null
	top_p?: string | number | null; // Allow string, number or null
	num_ctx?: string | number | null; // Allow string, number or null
	num_batch?: string | number | null; // Allow string, number or null
	num_keep?: string | number | null; // Allow string, number or null
	options?: ModelOptions;

	// Add params property with detailed types
	params?: {
		stream_response?: boolean | null;
		function_calling?: boolean | null;
		seed?: number | null;
		stop?: string | string[] | null; // Allow string, array of strings or null
		temperature?: string | number | null;
		reasoning_effort?: string | number | null;
		logit_bias?: string | object | null; // Allow string, object or null
		frequency_penalty?: string | number | null;
		presence_penalty?: string | number | null;
		repeat_penalty?: string | number | null;
		repeat_last_n?: string | number | null;
		mirostat?: string | number | null;
		mirostat_eta?: string | number | null;
		mirostat_tau?: string | number | null;
		top_k?: string | number | null;
		top_p?: string | number | null;
		min_p?: string | number | null;
		tfs_z?: string | number | null;
		num_ctx?: string | number | null;
		num_batch?: string | number | null;
		num_keep?: string | number | null;
		max_tokens?: string | number | null;
		use_mmap?: boolean | null; // Add missing params
		use_mlock?: boolean | null; // Add missing params
		num_thread?: string | number | null; // Add missing params
		num_gpu?: string | number | null; // Add missing params
		template?: string | null; // Add missing params
	};

	// Opacity settings
	sidebarOpacity?: number;
	menuOpacity?: number; // Add this line for menu opacity
	backgroundOpacity?: number; // Add this line for chat container opacity
	backgroundOverlayOpacity?: number; // Add this line for background overlay opacity
	bubbleOpacity?: number;
	chatBackgroundGradientOpacity?: number; // Add this line for chat background gradient opacity
	overlayOpacity?: number; // Add this line for overlay opacity
	settingsModalOpacity?: number; // Add this line for settings modal opacity
	widescreenMode?: boolean;
	autoTags?: boolean;
	detectArtifacts?: boolean;
	responseAutoCopy?: boolean;
	showUpdateToast?: boolean;
	showChangelog?: boolean;
	showEmojiInCall?: boolean;
	voiceInterruption?: boolean;
	richTextInput?: boolean;
	promptAutocomplete?: boolean;
	largeTextAsFile?: boolean;
	copyFormatted?: boolean;
	collapseCodeBlocks?: boolean;
	expandDetails?: boolean;
	landingPageMode?: string;
	chatBubble?: boolean;
	splitLargeChunks?: boolean;
	scrollOnBranchChange?: boolean;
	userLocation?: boolean;
	notificationSound?: boolean;
	hapticFeedback?: boolean;
	imageCompression?: boolean;
	imageCompressionSize?: { width: string; height: string };
	backgroundImageUrl?: string;
	webSearch?: string;
	theme?: string;
	baseUrl?: string; // Custom base URL for API endpoints

	// Video Background Settings
	backgroundType?: 'none' | 'image' | 'video';
	backgroundValue?: string;
	backgroundVideoUnmute?: boolean;
	backgroundVideoAutoplay?: boolean;
	backgroundVideoLoop?: boolean;
	backgroundVideoControls?: boolean;
};

type ModelOptions = {
	stop?: boolean;
};

type AudioSettings = {
	STTEngine?: string;
	TTSEngine?: string;
	speaker?: string;
	model?: string;
	nonLocalVoices?: boolean;
};

type TitleSettings = {
	auto?: boolean;
	model?: string;
	modelExternal?: string;
	prompt?: string;
};

type Prompt = {
	command: string;
	user_id: string;
	title: string;
	content: string;
	timestamp: number;
};

type Document = {
	collection_name: string;
	filename: string;
	name: string;
	title: string;
};

type Config = {
	status: boolean;
	name: string;
	version: string;
	default_locale: string;
	default_models: string;
	default_prompt_suggestions: PromptSuggestion[];
	features: {
		auth: boolean;
		auth_trusted_header: boolean;
		enable_api_key: boolean;
		enable_signup: boolean;
		enable_signup_verify: boolean;
		enable_login_form: boolean;
		enable_web_search?: boolean;
		enable_google_drive_integration: boolean;
		enable_onedrive_integration: boolean;
		enable_image_generation: boolean;
		enable_admin_export: boolean;
		enable_admin_chat_access: boolean;
		enable_community_sharing: boolean;
		enable_autocomplete_generation: boolean;
		enable_direct_connections: boolean;
	};
	oauth: {
		providers: {
			[key: string]: string;
		};
	};
	ui?: {
		pending_user_overlay_title?: string;
		pending_user_overlay_description?: string;
	};
};

type PromptSuggestion = {
	content: string;
	title: [string, string];
};

type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: string;
	profile_image_url: string;
	credit: number;
	// Add permissions property
	permissions?: {
		chat?: {
			controls?: boolean;
			file_upload?: boolean;
			delete?: boolean;
			edit?: boolean;
			stt?: boolean;
			tts?: boolean;
			call?: boolean;
			multiple_models?: boolean;
			temporary?: boolean;
			temporary_enforced?: boolean;
		};
		// Add other permission categories if needed based on usage
		workspace?: {
			models?: boolean;
			knowledge?: boolean;
			prompts?: boolean;
			tools?: boolean;
		};
		sharing?: {
			public_models?: boolean;
			public_knowledge?: boolean;
			public_prompts?: boolean;
			public_tools?: boolean;
		};
		features?: {
			direct_tool_servers?: boolean;
			web_search?: boolean;
			image_generation?: boolean;
			code_interpreter?: boolean;
		};
	};
};
