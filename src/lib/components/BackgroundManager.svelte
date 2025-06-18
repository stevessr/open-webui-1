<script lang="ts">
	import { settings } from '$lib/stores';
	import { onMount } from 'svelte';

	let backgroundType: 'none' | 'image' | 'video' = 'none';
	let backgroundValue = '';
	let backgroundVideoUnmute = false;
	let backgroundVideoAutoplay = true;
	let backgroundVideoLoop = true;
	let backgroundVideoControls = false;

	onMount(() => {
		settings.subscribe((s) => {
			backgroundType = s.backgroundType ?? 'none';
			backgroundValue = s.backgroundValue ?? '';
			backgroundVideoUnmute = s.backgroundVideoUnmute ?? false;
			backgroundVideoAutoplay = s.backgroundVideoAutoplay ?? true;
			backgroundVideoLoop = s.backgroundVideoLoop ?? true;
			backgroundVideoControls = s.backgroundVideoControls ?? false;
		});
	});
</script>

{#if backgroundType === 'image' && backgroundValue}
	<div
		class="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
		style="background-image: url({backgroundValue})"
	></div>
{/if}

{#if backgroundType === 'video' && backgroundValue}
	<video
		class="absolute top-0 left-0 w-full h-full object-cover"
		src={backgroundValue}
		autoplay={backgroundVideoAutoplay}
		loop={backgroundVideoLoop}
		muted={!backgroundVideoUnmute}
		controls={backgroundVideoControls}
	></video>
{/if}