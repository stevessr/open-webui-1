<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { baseUrl, validateBaseUrl, testBaseUrlConnection } from '$lib/stores';
	import { toast } from 'svelte-sonner';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	const dispatch = createEventDispatcher();
	const i18n: Writable<i18nType> = getContext('i18n');

	export let show = false;
	export let error = '';
	export let currentUrl = '';

	let customBaseUrl = '';
	let testing = false;
	let testResult: { success?: boolean; error?: string } | null = null;

	onMount(() => {
		customBaseUrl = $baseUrl || currentUrl || '';
	});

	const testConnection = async () => {
		if (!customBaseUrl.trim()) {
			testResult = { success: false, error: 'Please enter a base URL' };
			return;
		}

		testing = true;
		testResult = null;

		try {
			const result = await testBaseUrlConnection(customBaseUrl.trim());
			testResult = result;

			if (result.success) {
				toast.success($i18n.t('Connection test successful'));
			} else {
				toast.error($i18n.t('Connection test failed: {{error}}', { error: result.error }));
			}
		} catch (error) {
			testResult = { success: false, error: 'Test failed' };
			toast.error($i18n.t('Connection test failed'));
		} finally {
			testing = false;
		}
	};

	const saveAndRetry = () => {
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
		dispatch('retry');
		show = false;
	};

	const useDefault = () => {
		baseUrl.reset();
		customBaseUrl = $baseUrl;
		toast.success($i18n.t('Base URL reset to default'));
		dispatch('retry');
		show = false;
	};

	const close = () => {
		show = false;
		dispatch('close');
	};
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
			<div class="p-6">
				<div class="flex items-center mb-4">
					<div class="flex-shrink-0">
						<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							></path>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-lg font-medium text-gray-900 dark:text-white">
							{$i18n.t('Connection Failed')}
						</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							{$i18n.t('Unable to connect to the backend server')}
						</p>
					</div>
				</div>

				<div class="mb-4">
					<div
						class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3"
					>
						<div class="text-sm text-red-700 dark:text-red-300">
							<strong>{$i18n.t('Error:')}</strong>
							{error}
						</div>
						{#if currentUrl}
							<div class="text-xs text-red-600 dark:text-red-400 mt-1">
								{$i18n.t('Current URL:')}
								{currentUrl}
							</div>
						{/if}
					</div>
				</div>

				<div class="mb-4">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						{$i18n.t('Base URL')}
					</label>
					<div class="flex space-x-2">
						<input
							class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
							placeholder={$i18n.t('Enter base URL (e.g., http://localhost:8080)')}
							bind:value={customBaseUrl}
							type="url"
						/>
						<button
							class="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition disabled:opacity-50"
							on:click={testConnection}
							disabled={testing || !customBaseUrl.trim()}
							type="button"
						>
							{#if testing}
								{$i18n.t('Testing...')}
							{:else}
								{$i18n.t('Test')}
							{/if}
						</button>
					</div>

					{#if testResult}
						<div
							class="mt-2 text-sm {testResult.success
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{#if testResult.success}
								✓ {$i18n.t('Connection successful')}
							{:else}
								✗ {testResult.error || $i18n.t('Connection failed')}
							{/if}
						</div>
					{/if}
				</div>

				<div class="text-xs text-gray-500 dark:text-gray-400 mb-6">
					{$i18n.t('Common solutions:')}
					<ul class="list-disc list-inside mt-1 space-y-1">
						<li>{$i18n.t('Check if the backend server is running')}</li>
						<li>{$i18n.t('Verify the URL format (include http:// or https://)')}</li>
						<li>{$i18n.t('Check firewall and network settings')}</li>
						<li>{$i18n.t('Try using localhost instead of 127.0.0.1 or vice versa')}</li>
					</ul>
				</div>

				<div class="flex space-x-3">
					<button
						class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition"
						on:click={close}
						type="button"
					>
						{$i18n.t('Cancel')}
					</button>
					<button
						class="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-md transition"
						on:click={useDefault}
						type="button"
					>
						{$i18n.t('Use Default')}
					</button>
					<button
						class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
						on:click={saveAndRetry}
						disabled={!customBaseUrl.trim()}
						type="button"
					>
						{$i18n.t('Save & Retry')}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
