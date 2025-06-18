<script lang="ts">
	import { settings } from '$lib/stores';
	import { getContext, createEventDispatcher, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';
	import Switch from '$lib/components/common/Switch.svelte';

	const i18n: Writable<i18nType> = getContext('i18n');
	const dispatch = createEventDispatcher();

	export let saveSettings: (updated: any) => Promise<void>;

	let backgroundType: 'none' | 'image' | 'video' = 'none';
	let backgroundValue = '';
	let backgroundVideoUnmute = false;
	let backgroundVideoAutoplay = true;
	let backgroundVideoLoop = true;
	let backgroundVideoControls = false;

	onMount(() => {
		backgroundType = $settings.backgroundType ?? 'none';
		backgroundValue = $settings.backgroundValue ?? '';
		backgroundVideoUnmute = $settings.backgroundVideoUnmute ?? false;
		backgroundVideoAutoplay = $settings.backgroundVideoAutoplay ?? true;
		backgroundVideoLoop = $settings.backgroundVideoLoop ?? true;
		backgroundVideoControls = $settings.backgroundVideoControls ?? false;
	});

	const handleSave = () => {
		const updatedSettings = {
			...$settings,
			backgroundType,
			backgroundValue,
			backgroundVideoUnmute,
			backgroundVideoAutoplay,
			backgroundVideoLoop,
			backgroundVideoControls
		};
		settings.set(updatedSettings);
		saveSettings(updatedSettings);
		dispatch('save');
	};
</script>

<div class="flex flex-col h-full p-1">
	<div class="mb-5">
		<div class="mb-2 text-sm font-medium">{$i18n.t('Background Type')}</div>
		<select bind:value={backgroundType} on:change={handleSave} class="w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm">
			<option value="none">{$i18n.t('None')}</option>
			<option value="image">{$i18n.t('Image')}</option>
			<option value="video">{$i18n.t('Video')}</option>
		</select>
	</div>

	{#if backgroundType === 'image' || backgroundType === 'video'}
		<div class="mb-5">
			<div class="mb-2 text-sm font-medium">{$i18n.t('Background URL')}</div>
			<input type="text" bind:value={backgroundValue} on:change={handleSave} class="w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm" placeholder="https://example.com/background.mp4" />
		</div>
	{/if}

	{#if backgroundType === 'video'}
		<div class="space-y-5">
			<div class="flex justify-between items-center">
				<span class="text-sm font-medium">{$i18n.t('Autoplay')}</span>
				<Switch bind:value={backgroundVideoAutoplay} on:change={handleSave} />
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm font-medium">{$i18n.t('Loop')}</span>
				<Switch bind:value={backgroundVideoLoop} on:change={handleSave} />
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm font-medium">{$i18n.t('Unmute')}</span>
				<Switch bind:value={backgroundVideoUnmute} on:change={handleSave} />
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm font-medium">{$i18n.t('Show Controls')}</span>
				<Switch bind:value={backgroundVideoControls} on:change={handleSave} />
			</div>
		</div>
	{/if}
</div>