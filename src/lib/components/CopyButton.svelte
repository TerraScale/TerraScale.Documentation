<script lang="ts">
	import { addToast } from '$lib/stores/toast.svelte';

	let { text = '' } = $props<{ text: string }>();

	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			addToast('Copied to clipboard!', 'success');
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
			addToast('Failed to copy', 'error');
		}
	}
</script>

<button
	data-copy-button
	onclick={copy}
	aria-label="Copy code to clipboard"
	title="Copy code"
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
			class="icon-success"
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

<style>
	[data-copy-button] {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.35rem;
		color: #94a3b8;
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s ease;
		z-index: 10;
	}

	:global([data-code-block]:hover) [data-copy-button],
	[data-copy-button]:focus-visible {
		opacity: 1;
	}

	[data-copy-button]:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #f8fafc;
	}

	.icon-success {
		color: #10b981;
	}
</style>
