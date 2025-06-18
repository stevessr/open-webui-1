<script lang="ts">
	import { goto } from '$app/navigation';
	import { WEBUI_NAME, config, baseUrl, validateBaseUrl, testBaseUrlConnection } from '$lib/stores';
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	const i18n: Writable<i18nType> = getContext('i18n');

	let loaded = false;
	let showBaseUrlConfig = false;
	let customBaseUrl = '';
	let baseUrlTesting = false;
	let baseUrlTestResult: { success?: boolean; error?: string } | null = null;

	const testBaseUrl = async () => {
		if (!customBaseUrl.trim()) {
			baseUrlTestResult = { success: false, error: 'Please enter a base URL' };
			return;
		}

		baseUrlTesting = true;
		baseUrlTestResult = null;

		try {
			const result = await testBaseUrlConnection(customBaseUrl.trim());
			baseUrlTestResult = result;

			if (result.success) {
				toast.success($i18n.t('Base URL connection test successful'));
			} else {
				toast.error($i18n.t('Base URL connection test failed: {{error}}', { error: result.error }));
			}
		} catch (error) {
			baseUrlTestResult = { success: false, error: 'Test failed' };
			toast.error($i18n.t('Base URL connection test failed'));
		} finally {
			baseUrlTesting = false;
		}
	};

	const saveBaseUrlAndRetry = async () => {
		if (!customBaseUrl.trim()) {
			toast.error($i18n.t('Please enter a valid base URL'));
			return;
		}

		const validation = validateBaseUrl(customBaseUrl.trim());
		if (!validation.valid) {
			toast.error($i18n.t('Invalid base URL: {{error}}', { error: validation.error }));
			return;
		}

		baseUrl.set(customBaseUrl.trim());
		toast.success($i18n.t('Base URL updated successfully'));

		// Try to reload the page to test the new URL
		location.href = '/';
	};

	const resetBaseUrl = () => {
		baseUrl.reset();
		customBaseUrl = $baseUrl;
		toast.success($i18n.t('Base URL reset to default'));
		location.href = '/';
	};

	onMount(async () => {
		// Initialize custom base URL with current value
		customBaseUrl = $baseUrl || '';

		if ($config) {
			await goto('/');
		}

		loaded = true;
	});
</script>

{#if loaded}
	<div class="absolute w-full h-full flex z-50">
		<div class="absolute rounded-xl w-full h-full backdrop-blur-sm flex justify-center">
			<div class="m-auto pb-44 flex flex-col justify-center">
				<div class="max-w-md">
					<div class="text-center text-2xl font-medium z-50">
						{$i18n.t('{{webUIName}} Backend Required', { webUIName: $WEBUI_NAME })}
					</div>

					<div class=" mt-4 text-center text-sm w-full">
						{$i18n.t(
							"Oops! You're using an unsupported method (frontend only). Please serve the WebUI from the backend."
						)}

						<br class=" " />
						<br class=" " />
						<a
							class=" font-semibold underline"
							href="https://github.com/open-webui/open-webui#how-to-install-"
							target="_blank">{$i18n.t('See readme.md for instructions')}</a
						>
						{$i18n.t('or')}
						<a class=" font-semibold underline" href="https://discord.gg/5rJgQTnV4s" target="_blank"
							>{$i18n.t('join our Discord for help.')}</a
						>
					</div>

					<!-- Base URL Configuration Section -->
					{#if showBaseUrlConfig}
						<div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
							<h3 class="text-lg font-medium mb-3 text-center">{$i18n.t('Configure Backend URL')}</h3>

							<div class="space-y-3">
								<div>
									<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										{$i18n.t('Backend Base URL')}
									</label>
									<input
										class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
										placeholder={$i18n.t('Enter backend URL (e.g., http://localhost:8080)')}
										bind:value={customBaseUrl}
										type="url"
									/>
								</div>

								<div class="flex space-x-2">
									<button
										class="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition disabled:opacity-50"
										on:click={testBaseUrl}
										disabled={baseUrlTesting || !customBaseUrl.trim()}
										type="button"
									>
										{#if baseUrlTesting}
											{$i18n.t('Testing...')}
										{:else}
											{$i18n.t('Test Connection')}
										{/if}
									</button>
									<button
										class="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition"
										on:click={resetBaseUrl}
										type="button"
									>
										{$i18n.t('Reset')}
									</button>
								</div>

								{#if baseUrlTestResult}
									<div class="text-sm {baseUrlTestResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
										{#if baseUrlTestResult.success}
											✓ {$i18n.t('Connection successful')}
										{:else}
											✗ {baseUrlTestResult.error || $i18n.t('Connection failed')}
										{/if}
									</div>
								{/if}

								<button
									class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition disabled:opacity-50"
									on:click={saveBaseUrlAndRetry}
									disabled={!customBaseUrl.trim()}
									type="button"
								>
									{$i18n.t('Save & Retry Connection')}
								</button>

								<button
									class="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition"
									on:click={() => showBaseUrlConfig = false}
									type="button"
								>
									{$i18n.t('Cancel')}
								</button>
							</div>
						</div>
					{/if}

					<div class=" mt-6 mx-auto relative group w-fit space-y-3">
						<button
							class="relative z-20 flex px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition font-medium text-sm w-full justify-center"
							on:click={() => {
								location.href = '/';
							}}
						>
							{$i18n.t('Check Again')}
						</button>

						<button
							class="relative z-20 flex px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition font-medium text-sm w-full justify-center"
							on:click={() => {
								showBaseUrlConfig = !showBaseUrlConfig;
							}}
						>
							{#if showBaseUrlConfig}
								{$i18n.t('Hide Configuration')}
							{:else}
								{$i18n.t('Configure Backend URL')}
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
