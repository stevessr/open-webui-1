<script lang="ts">
	import { settings } from '$lib/stores';
	import { createEventDispatcher, getContext, onMount } from 'svelte'; // Import onMount
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	const i18n: Writable<i18nType> = getContext('i18n');
	const dispatch = createEventDispatcher(); // Create dispatcher

	export let saveSettings: Function; // Add prop to receive save function

	// This component doesn't need its own save logic,
	// the parent SettingsModal handles saving when any setting changes via the store binding.
	// export let saveSettings: Function; // Not strictly needed if using direct store binding

	// Initialize local variables from the store if needed for complex logic,
	// but for simple bindings, direct store access ($settings.propertyName) is fine.
</script>

{#await onMount(async () => {
	settings.update((s) => {
		return { ...s, sidebarOpacity: s.sidebarOpacity ?? 100, backgroundOpacity: s.backgroundOpacity ?? 100, backgroundOverlayOpacity: s.backgroundOverlayOpacity ?? 100, bubbleOpacity: s.bubbleOpacity ?? 100, chatBackgroundGradientOpacity: s.chatBackgroundGradientOpacity ?? 100, overlayOpacity: s.overlayOpacity ?? 40 }; // Default to 40 if not set
	});
})}
	<!-- Loading state or placeholder if needed -->
{:then}
	<div class="space-y-6 overflow-y-scroll max-h-[28rem] lg:max-h-full custom-scrollbar">
		<div>
			<div class=" mb-1.5 text-sm font-medium">{$i18n.t('opacitySettings')}</div>

			<!-- Sidebar Opacity -->
			<div class=" py-3 flex w-full justify-between text-xs">
				<div class=" self-center text-xs">{$i18n.t('sidebarOpacity')}</div>
				<div class="flex items-center space-x-2">
					<input
						bind:value={$settings.sidebarOpacity}
						type="range"
						class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-thumb-lg"
						min="0"
						max="100"
					/>
					<span class="text-xs w-8 text-right">{$settings.sidebarOpacity}%</span>
				</div>
			</div>

			<!-- Background Opacity -->
			<div class=" py-3 flex w-full justify-between text-xs">
				<div class=" self-center text-xs">{$i18n.t('backgroundOpacity')}</div>
				<div class="flex items-center space-x-2">
					<input
						bind:value={$settings.backgroundOpacity}
						type="range"
						class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-thumb-lg"
						min="0"
						max="100"
					/>
					<span class="text-xs w-8 text-right">{$settings.backgroundOpacity}%</span>
				</div>
			</div>

			<!-- Background Overlay Opacity -->
			<div class=" py-3 flex w-full justify-between text-xs">
				<div class=" self-center text-xs">{$i18n.t('backgroundOverlayOpacity')}</div>
				<div class="flex items-center space-x-2">
					<input
						bind:value={$settings.backgroundOverlayOpacity}
						type="range"
						class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-thumb-lg"
						min="0"
						max="100"
					/>
					<span class="text-xs w-8 text-right">{$settings.backgroundOverlayOpacity}%</span>
				</div>
			</div>

			<!-- Bubble Opacity -->
			<div class=" py-3 flex w-full justify-between text-xs">
				<div class=" self-center text-xs">{$i18n.t('bubbleOpacity')}</div>
				<div class="flex items-center space-x-2">
					<input
						bind:value={$settings.bubbleOpacity}
						type="range"
						class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-thumb-lg"
						min="0"
						max="100"
					/>
					<span class="text-xs w-8 text-right">{$settings.bubbleOpacity}%</span>
				</div>
			</div>

			<!-- Chat Background Gradient Opacity -->
			<div class=" py-3 flex w-full justify-between text-xs">
				<div class=" self-center text-xs">{$i18n.t('chatBackgroundGradientOpacity')}</div>
				<div class="flex items-center space-x-2">
					<input
						bind:value={$settings.chatBackgroundGradientOpacity}
						type="range"
						class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-thumb-lg"
						min="0"
						max="100"
					/>
					<span class="text-xs w-8 text-right">{$settings.chatBackgroundGradientOpacity}%</span>
				</div>
			</div>

			<!-- Overlay Opacity (Moved from Interface.svelte) -->
			<div class=" py-3 flex w-full justify-between text-xs">
				<div class=" self-center text-xs">{$i18n.t('overlayOpacity')}</div>
				<div class="flex items-center space-x-2">
					<input
						bind:value={$settings.overlayOpacity}
						type="range"
						class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-thumb-lg"
						min="0"
						max="100"
					/>
					<span class="text-xs w-8 text-right">{$settings.overlayOpacity}%</span>
				</div>
			</div>
		</div>
	</div>
{/await}

<!-- Add Save Button -->
<div class="flex justify-end pt-3">
	<button
		class="save-bottom px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full"
		type="button"
		on:click={() => {
			saveSettings({}); // Call the passed save function
			dispatch('save'); // Dispatch event for toast message
		}}
	>
		{$i18n.t('save')}
		<!-- Use existing 'save' key -->
	</button>
</div>

<style>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
	}
	/* Custom styles for larger range input thumb */
	.range-thumb-lg::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1rem; /* 16px */
		height: 1rem; /* 16px */
		background-color: #4f46e5; /* Indigo-600 or your preferred color */
		border-radius: 9999px; /* Fully rounded */
		cursor: pointer;
	}

	.range-thumb-lg::-moz-range-thumb {
		width: 1rem; /* 16px */
		height: 1rem; /* 16px */
		background-color: #4f46e5; /* Indigo-600 or your preferred color */
		border-radius: 9999px; /* Fully rounded */
		cursor: pointer;
		border: none; /* Remove default border */
	}

	/* Optional: Dark mode thumb color */
	.dark .range-thumb-lg::-webkit-slider-thumb {
		background-color: #818cf8; /* Indigo-400 or your preferred dark mode color */
	}

	.dark .range-thumb-lg::-moz-range-thumb {
		background-color: #818cf8; /* Indigo-400 or your preferred dark mode color */
	}

	/* Custom scrollbar styles */
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px; /* Width of the scrollbar */
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #f1f1f1; /* Color of the track */
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888; /* Color of the scroll thumb */
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555; /* Color of the scroll thumb on hover */
	}

	/* Optional: Dark mode scrollbar colors */
	.dark .custom-scrollbar::-webkit-scrollbar-track {
		background: #333;
	}

	.dark .custom-scrollbar::-webkit-scrollbar-thumb {
		background: #666;
	}

	.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #999;
	}
</style>
