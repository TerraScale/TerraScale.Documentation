<script lang="ts">
	// biome-ignore assist/source/organizeImports: local ordering keeps transition imports grouped.
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import { toasts, removeToast } from '$lib/stores/toast.svelte';
	// biome-ignore lint/correctness/noUnusedImports: referenced in transition directives
	import { fly } from 'svelte/transition';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in transition directives
	let prefersReducedMotion = $state(false);

	$effect(() => {
		if (typeof window === 'undefined' || !('matchMedia' in window)) {
			return;
		}

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => {
			prefersReducedMotion = mediaQuery.matches;
		};

		update();
		mediaQuery.addEventListener('change', update);

		return () => mediaQuery.removeEventListener('change', update);
	});
</script>

<div class="toast-container">
	{#each toasts as toast (toast.id)}
		<div
			class="toast toast-{toast.type}"
			in:fly={{ y: prefersReducedMotion ? 0 : 20, duration: prefersReducedMotion ? 1 : 300 }}
			out:fly={{ y: prefersReducedMotion ? 0 : -20, duration: prefersReducedMotion ? 1 : 300, opacity: prefersReducedMotion ? 1 : 0 }}
			role="alert"
		>
			{#if toast.type === 'success'}
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
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
			{:else if toast.type === 'error'}
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
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="15" y1="9" x2="9" y2="15"></line>
					<line x1="9" y1="9" x2="15" y2="15"></line>
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
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="16" x2="12" y2="12"></line>
					<line x1="12" y1="8" x2="12.01" y2="8"></line>
				</svg>
			{/if}
			<span>{toast.message}</span>
			<button class="close-btn" onclick={() => removeToast(toast.id)} aria-label="Close">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 100;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: rgba(12, 12, 16, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		color: #f8fafc;
		font-size: 0.875rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		pointer-events: auto;
	}

	.toast-success svg:first-child {
		color: #10b981;
	}

	.toast-error svg:first-child {
		color: #f43f5e;
	}

	.toast-info svg:first-child {
		color: #3b82f6;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #94a3b8;
		cursor: pointer;
		padding: 0.25rem;
		margin-left: 0.5rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #f8fafc;
	}
</style>
