<script lang="ts">
	import { addToast } from '$lib/stores/toast.svelte';
	import { getStrings } from '$lib/i18n/strings';

	let { text = '', locale = 'en' } = $props<{ text: string; locale?: string }>();
	const strings = $derived(getStrings(locale));

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let copied = $state(false);

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			addToast(strings.copy.success, 'success');
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
			addToast(strings.copy.failed, 'error');
		}
	}
</script>

<button
	data-copy-button
	onclick={copy}
	aria-label={strings.copy.ariaLabel}
	title={strings.copy.title}
	class="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-[0.35rem] border border-white/10 bg-white/5 p-0 text-slate-400 opacity-0 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-slate-50 focus-visible:opacity-100"
>
	{#if copied}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-emerald-500"
		>
			<polyline points="20 6 9 17 4 12"></polyline>
		</svg>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
		</svg>
	{/if}
</button>
