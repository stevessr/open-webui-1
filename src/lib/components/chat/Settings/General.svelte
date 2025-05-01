<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher, onMount, getContext } from 'svelte';
	import type { Writable } from 'svelte/store'; // Import Writable
	import { getLanguages, changeLanguage } from '$lib/i18n';
	const dispatch = createEventDispatcher();

	import { models, settings, theme, user } from '$lib/stores';
	import type { TFunction, i18n as i18nType } from 'i18next'; // Import TFunction and i18nType

	const i18n: Writable<i18nType> = getContext('i18n'); // Get i18n store from context

	import AdvancedParams from './Advanced/AdvancedParams.svelte';
	import Textarea from '$lib/components/common/Textarea.svelte';

	export let saveSettings: Function;
	export let getModels: Function;

	// General
	let themes = [
		'dark',
		'light',
		'rosepine',
		'rosepine-dawn',
		'oled-dark',
		'pink',
		'green',
		'blue',
		'gem'
	];
	let selectedTheme = 'system';

	let languages: Awaited<ReturnType<typeof getLanguages>> = [];
	let lang = $i18n.language; // Use i18n.language directly
	let notificationEnabled = false;
	let system = '';

	let showAdvanced = false;

	const toggleNotification = async () => {
		const permission = await Notification.requestPermission();

		if (permission === 'granted') {
			notificationEnabled = !notificationEnabled;
			saveSettings({ notificationEnabled: notificationEnabled });
		} else {
			toast.error(
				$i18n.t(
					// Use i18n.t
					'Response notifications cannot be activated as the website permissions have been denied. Please visit your browser settings to grant the necessary access.'
				)
			);
		}
	};

	// Advanced
	let requestFormat: string | object | null = null;
	let requestFormatString: string = ''; // New variable for textarea binding
	let keepAlive: string | number | null = null;

	let params: {
		stream_response: boolean | null;
		function_calling: string | boolean | null; // Allow boolean based on $settings.params
		seed: number | null;
		stop: string | string[] | null;
		temperature: string | number | null;
		reasoning_effort: string | number | null | undefined; // Allow undefined
		logit_bias: string | object | null;
		frequency_penalty: string | number | null;
		presence_penalty: string | number | null;
		repeat_penalty: string | number | null;
		repeat_last_n: string | number | null;
		mirostat: string | number | null;
		mirostat_eta: string | number | null;
		mirostat_tau: string | number | null;
		top_k: string | number | null;
		top_p: string | number | null;
		min_p: string | number | null;
		tfs_z: string | number | null;
		num_ctx: string | number | null;
		num_batch: string | number | null;
		num_keep: string | number | null;
		max_tokens: string | number | null;
		num_gpu: string | number | null;
		use_mmap: boolean | null | undefined; // Allow undefined
		use_mlock: boolean | null | undefined; // Allow undefined
		num_thread: string | number | null;
		template: string | null;
	} = {
		// Advanced
		stream_response: null,
		function_calling: null, // Initialize with null
		seed: null,
		temperature: null,
		reasoning_effort: null,
		logit_bias: null,
		frequency_penalty: null,
		presence_penalty: null,
		repeat_penalty: null,
		repeat_last_n: null,
		mirostat: null,
		mirostat_eta: null,
		mirostat_tau: null,
		top_k: null,
		top_p: null,
		min_p: null,
		stop: null,
		tfs_z: null,
		num_ctx: null,
		num_batch: null,
		num_keep: null,
		max_tokens: null,
		num_gpu: null,
		use_mmap: null,
		use_mlock: null,
		num_thread: null,
		template: null
	};

	const validateJSON = (json: string): boolean => {
		try {
			const obj = JSON.parse(json);

			if (obj && typeof obj === 'object') {
				return true;
			}
		} catch (e) {}
		return false;
	};

	const toggleRequestFormat = async () => {
		if (requestFormat === null) {
			requestFormat = 'json';
			requestFormatString = 'json'; // Update string representation
		} else {
			requestFormat = null;
			requestFormatString = ''; // Update string representation
		}

		// No need to save here immediately, let the main save button handle it
		// saveSettings({ requestFormat: requestFormat !== null ? requestFormat : undefined });
	};

	const saveHandler = async () => {
		let finalRequestFormat: string | object | undefined = undefined;

		// Determine the final requestFormat based on requestFormatString
		if (requestFormatString === 'json') {
			finalRequestFormat = 'json';
		} else if (requestFormatString && requestFormatString.trim() !== '') {
			if (validateJSON(requestFormatString)) {
				try {
					finalRequestFormat = JSON.parse(requestFormatString);
				} catch (e) {
					console.error('Invalid JSON schema during save:', requestFormatString, e);
					toast.error($i18n.t('Invalid JSON schema'));
					return; // Stop saving if JSON is invalid
				}
			} else {
				console.error('Invalid JSON schema during save:', requestFormatString);
				toast.error($i18n.t('Invalid JSON schema'));
				return; // Stop saving if JSON is invalid
			}
		} else {
			// If requestFormatString is empty or null, set finalRequestFormat to undefined
			finalRequestFormat = undefined;
		}


		// Update the internal requestFormat state to match the final value being saved
		if (finalRequestFormat === 'json') {
			requestFormat = 'json';
		} else if (typeof finalRequestFormat === 'object') {
			requestFormat = finalRequestFormat; // Keep it as an object internally for potential future use
		} else {
			requestFormat = null; // Reset internal state if it's undefined/null
		}


		saveSettings({
			system: system !== '' ? system : undefined,
			params: {
				stream_response: params.stream_response !== null ? params.stream_response : undefined,
				function_calling: params.function_calling !== null ? params.function_calling : undefined,
				seed: (params.seed !== null ? params.seed : undefined) ?? undefined,
				stop:
					typeof params.stop === 'string'
						? params.stop.split(',').filter((e: string) => e.trim() !== '')
						: undefined,
				temperature: params.temperature !== null ? params.temperature : undefined, // Use null check
				reasoning_effort: params.reasoning_effort !== null ? params.reasoning_effort : undefined, // Use null check
				logit_bias: params.logit_bias !== null ? params.logit_bias : undefined, // Use null check
				frequency_penalty: params.frequency_penalty !== null ? params.frequency_penalty : undefined, // Use null check
				presence_penalty: params.presence_penalty !== null ? params.presence_penalty : undefined, // Use null check
				repeat_penalty: params.repeat_penalty !== null ? params.repeat_penalty : undefined, // Use null check
				repeat_last_n: params.repeat_last_n !== null ? params.repeat_last_n : undefined, // Use null check
				mirostat: params.mirostat !== null ? params.mirostat : undefined, // Use null check
				mirostat_eta: params.mirostat_eta !== null ? params.mirostat_eta : undefined, // Use null check
				mirostat_tau: params.mirostat_tau !== null ? params.mirostat_tau : undefined, // Use null check
				top_k: params.top_k !== null ? params.top_k : undefined, // Use null check
				top_p: params.top_p !== null ? params.top_p : undefined, // Use null check
				min_p: params.min_p !== null ? params.min_p : undefined, // Use null check
				tfs_z: params.tfs_z !== null ? params.tfs_z : undefined, // Use null check
				num_ctx: params.num_ctx !== null ? params.num_ctx : undefined, // Use null check
				num_batch: params.num_batch !== null ? params.num_batch : undefined, // Use null check
				num_keep: params.num_keep !== null ? params.num_keep : undefined, // Use null check
				max_tokens: params.max_tokens !== null ? params.max_tokens : undefined, // Use null check
				use_mmap: params.use_mmap !== null ? params.use_mmap : undefined, // Use null check
				use_mlock: params.use_mlock !== null ? params.use_mlock : undefined, // Use null check
				num_thread: params.num_thread !== null ? params.num_thread : undefined, // Use null check
				num_gpu: params.num_gpu !== null ? params.num_gpu : undefined // Use null check
			},
			keepAlive: keepAlive
				? typeof keepAlive === 'number'
					? keepAlive
					: parseInt(keepAlive as string)
				: undefined,
			requestFormat: finalRequestFormat, // Save the determined format

			theme: selectedTheme // Add theme to settings
		});
		dispatch('save');

		// Ensure requestFormatString is correctly formatted after saving (especially for objects)
		if (typeof finalRequestFormat === 'object') {
			try {
				requestFormatString = JSON.stringify(finalRequestFormat, null, 2);
			} catch (e) {
				// This should ideally not happen if validation passed, but handle just in case
				console.error('Error stringifying finalRequestFormat after save:', e);
				requestFormatString = '';
			}
		} else {
			requestFormatString = finalRequestFormat === 'json' ? 'json' : '';
		}
	};

	onMount(async () => {
		selectedTheme = localStorage.theme ?? 'system';

		languages = await getLanguages();

		// Load theme preference from settings, fallback to localStorage or system
		selectedTheme = $settings?.theme ?? localStorage.theme ?? 'system';
		theme.set(selectedTheme); // Ensure theme store is updated on load
		applyTheme(selectedTheme); // Apply the loaded theme

		notificationEnabled = $settings.notificationEnabled ?? false;
		system = $settings.system ?? '';

		requestFormat = $settings.requestFormat ?? null;

		// Initialize requestFormatString based on loaded requestFormat
		if (requestFormat === 'json') {
			requestFormatString = 'json';
		} else if (typeof requestFormat === 'object' && requestFormat !== null) {
			try {
				requestFormatString = JSON.stringify(requestFormat, null, 2);
			} catch (e) {
				console.error('Error stringifying requestFormat on mount:', e);
				requestFormatString = ''; // Fallback to empty string on error
				requestFormat = null; // Reset requestFormat if it's invalid
			}
		} else {
			requestFormatString = ''; // Default to empty if null or not 'json'/object
			requestFormat = null; // Ensure requestFormat is null if not 'json' or valid object
		}


		keepAlive = $settings.keepAlive ?? null;

		// Initialize params, converting null to undefined for use_mmap and use_mlock
		params = {
			...params,
			...$settings.params,
			use_mmap: $settings.params?.use_mmap ?? undefined,
			use_mlock: $settings.params?.use_mlock ?? undefined
		};
		params.stop = Array.isArray($settings?.params?.stop) ? $settings?.params?.stop.join(',') : null; // Ensure null is used
	});

	const applyTheme = (_theme: string) => {
		let themeToApply = _theme;

		if (_theme === 'system') {
			themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} else if (_theme === 'oled-dark') {
			themeToApply = 'dark oled'; // Apply both dark and oled classes
		} else if (_theme === 'rosepine') {
			themeToApply = 'dark rosepine'; // Apply both dark and rosepine classes
		} else if (_theme === 'rosepine-dawn') {
			themeToApply = 'light rosepine-dawn'; // Apply both light and rosepine-dawn classes
		} else if (_theme === 'pink') {
			themeToApply = 'light pink'; // Assuming pink is a light theme
		} else if (_theme === 'green') {
			themeToApply = 'light green'; // Assuming green is a light theme
		} else if (_theme === 'blue') {
			themeToApply = 'light blue'; // Assuming blue is a light theme
		} else if (_theme === 'gem') {
			themeToApply = 'dark gem'; // Assuming gem is a dark theme
		}

		// Remove all existing theme classes first
		themes.forEach((e) => {
			e.split(' ').forEach((cls) => {
				document.documentElement.classList.remove(cls);
			});
		});


		// Add the new theme classes
		themeToApply.split(' ').forEach((e) => {
			document.documentElement.classList.add(e);
		});

		// Handle specific dark/light mode styles that are not theme-specific
		if (!themeToApply.includes('dark')) {
			// Reset dark mode specific styles if not in dark mode
			document.documentElement.style.setProperty('--color-gray-800', '');
			document.documentElement.style.setProperty('--color-gray-850', '');
			document.documentElement.style.setProperty('--color-gray-900', '');
			document.documentElement.style.setProperty('--color-gray-950', '');
		}


		// Handle meta theme color (can be simplified or kept as is)
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			if (_theme.includes('system')) {
				const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
				console.log('Setting system meta theme color: ' + systemTheme);
				metaThemeColor.setAttribute('content', systemTheme === 'light' ? '#ffffff' : '#171717');
			} else {
				console.log('Setting meta theme color: ' + _theme);
				localStorage.theme = _theme; // Save the theme to localStorage
				metaThemeColor.setAttribute(
					'content',
					_theme.includes('dark') || _theme.includes('oled') || _theme.includes('gem')
						? '#171717' // Dark themes
						: _theme === 'her'
							? '#983724' // Her theme
							: '#ffffff' // Light themes
				);
			}
		}

		if (typeof window !== 'undefined' && window.applyTheme) {
			window.applyTheme();
		}

		// Specific styles for oled-dark (now handled by 'oled' class)
		if (_theme.includes('oled-dark')) {
			document.documentElement.style.setProperty('--color-gray-800', '#101010');
			document.documentElement.style.setProperty('--color-gray-850', '#050505');
			document.documentElement.style.setProperty('--color-gray-900', '#000000');
			document.documentElement.style.setProperty('--color-gray-950', '#000000');
			// document.documentElement.classList.add('dark'); // 'dark' class is already added by themeToApply
		}

		console.log(_theme);
	};

	const themeChangeHandler = (_theme: string) => {
		theme.set(_theme);
		localStorage.setItem('theme', _theme);
		applyTheme(_theme);
	};
</script>

<div class="flex flex-col h-full justify-between text-sm">
	<div class="  overflow-y-scroll max-h-[28rem] lg:max-h-full">
		<div class="">
			<div class=" mb-1 text-sm font-medium">{$i18n.t('WebUI Settings')}</div>

			<div class="flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Theme')}</div>
				<div class="flex items-center relative">
					<select
						class=" dark:bg-gray-900 w-fit pr-8 rounded-sm py-2 px-2 text-xs bg-transparent outline-hidden text-right"
						bind:value={selectedTheme}
						placeholder="Select a theme"
						on:change={() => themeChangeHandler(selectedTheme)}
					>
						<option value="system">⚙️ {$i18n.t('System')}</option>
						<option value="dark">🌑 {$i18n.t('Dark')}</option>
						<option value="oled-dark">🌃 {$i18n.t('OLED Dark')}</option>
						<option value="light">☀️ {$i18n.t('Light')}</option>
						<option value="her">🌷 Her</option>
						<option value="rosepine">🪻 {$i18n.t('Rosé Pine')}</option>
						<option value="rosepine-dawn">🌷 {$i18n.t('Rosé Pine Dawn')}</option>
						<option value="pink">🌸 {$i18n.t('Pink')}</option>
						<option value="green">🌳 {$i18n.t('Green')}</option>
						<option value="blue">💧 {$i18n.t('Blue')}</option>
						<option value="gem">💎 {$i18n.t('Gem')}</option>
					</select>
				</div>
			</div>

			<div class=" flex w-full justify-between">
				<div class=" self-center text-xs font-medium">{$i18n.t('Language')}</div>
				<div class="flex items-center relative">
					<select
						class=" dark:bg-gray-900 w-fit pr-8 rounded-sm py-2 px-2 text-xs bg-transparent outline-hidden text-right"
						bind:value={lang}
						placeholder="Select a language"
						on:change={(e) => {
							changeLanguage(lang);
						}}
					>
						{#each languages as language}
							<option value={language['code']}>{language['title']}</option>
						{/each}
					</select>
				</div>
			</div>
			{#if $i18n.language === 'en-US'}
				<div class="mb-2 text-xs text-gray-400 dark:text-gray-500">
					Couldn't find your language?
					<a
						class=" text-gray-300 font-medium underline"
						href="https://github.com/open-webui/open-webui/blob/main/docs/CONTRIBUTING.md#-translations-and-internationalization"
						target="_blank"
					>
						Help us translate Open WebUI!
					</a>
				</div>
			{/if}

			<div>
				<div class=" py-0.5 flex w-full justify-between">
					<div class=" self-center text-xs font-medium">{$i18n.t('Notifications')}</div>

					<button
						class="p-1 px-3 text-xs flex rounded-sm transition"
						on:click={() => {
							toggleNotification();
						}}
						type="button"
					>
						{#if notificationEnabled === true}
							<span class="ml-2 self-center">{$i18n.t('On')}</span>
						{:else}
							<span class="ml-2 self-center">{$i18n.t('Off')}</span>
						{/if}
					</button>
				</div>
			</div>
		</div>



		{#if $user && ($user.role === 'admin' || $user.permissions?.chat?.controls)}
			<hr class="border-gray-50 dark:border-gray-850 my-3" />

			<div>
				<div class=" my-2.5 text-sm font-medium">{$i18n.t('System Prompt')}</div>
				<Textarea
					bind:value={system}
					className="w-full text-sm bg-white dark:text-gray-300 dark:bg-gray-900 outline-hidden resize-none"
					rows={4}
					placeholder={$i18n.t('Enter system prompt here')}
				/>
			</div>

			<div class="mt-2 space-y-3 pr-1.5">
				<div class="flex justify-between items-center text-sm">
					<div class="  font-medium">{$i18n.t('Advanced Parameters')}</div>
					<button
						class=" text-xs font-medium text-gray-500"
						type="button"
						on:click={() => {
							showAdvanced = !showAdvanced;
						}}>{showAdvanced ? $i18n.t('Hide') : $i18n.t('Show')}</button
					>
				</div>

				{#if showAdvanced}
					<AdvancedParams admin={$user?.role === 'admin'} bind:params />
					<hr class=" border-gray-100 dark:border-gray-850" />

					<div class=" w-full justify-between">
						<div class="flex w-full justify-between">
							<div class=" self-center text-xs font-medium">{$i18n.t('Keep Alive')}</div>

							<button
								class="p-1 px-3 text-xs flex rounded-sm transition"
								type="button"
								on:click={() => {
									keepAlive = keepAlive === null ? '5m' : null;
								}}
							>
								{#if keepAlive === null}
									<span class="ml-2 self-center"> {$i18n.t('Default')} </span>
								{:else}
									<span class="ml-2 self-center"> {$i18n.t('Custom')} </span>
								{/if}
							</button>
						</div>

						{#if keepAlive !== null}
							<div class="flex mt-1 space-x-2">
								<input
									class="w-full text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden"
									type="text"
									placeholder={$i18n.t("e.g. '30s','10m'. Valid time units are 's', 'm', 'h'.")}
									bind:value={keepAlive}
								/>
							</div>
						{/if}
					</div>

					<div>
						<div class=" flex w-full justify-between">
							<div class=" self-center text-xs font-medium">{$i18n.t('Request Mode')}</div>

							<button
								class="p-1 px-3 text-xs flex rounded-sm transition"
								on:click={() => {
									toggleRequestFormat();
								}}
							>
								{#if requestFormat === null}
									<span class="ml-2 self-center"> {$i18n.t('Default')} </span>
								{:else}
									<span class="ml-2 self-center"> {$i18n.t('JSON')} </span>
								{/if}
							</button>
						</div>

						{#if requestFormat !== null}
							<div class="flex mt-1 space-x-2">
								<Textarea
									className="w-full  text-sm dark:text-gray-300 dark:bg-gray-900 outline-hidden"
									placeholder={$i18n.t('e.g. "json" or a JSON schema')}
									bind:value={requestFormatString}
								/>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="flex justify-end pt-3 text-sm font-medium">
		<button
			class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full"
			on:click={() => {
				saveHandler();
			}}
		>
			{$i18n.t('Save')}
		</button>
	</div>
</div>
