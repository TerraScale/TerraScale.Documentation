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

<div class="pointer-events-none fixed right-6 bottom-6 z-[100] flex flex-col gap-2">
	{#each toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex items-center gap-3 rounded-lg border border-white/10 bg-[rgba(12,12,16,0.95)] px-4 py-3 text-sm text-slate-50 shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-[8px]"
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
					class="text-emerald-500"
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
					class="text-rose-500"
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
					class="text-blue-500"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="16" x2="12" y2="12"></line>
					<line x1="12" y1="8" x2="12.01" y2="8"></line>
				</svg>
			{/if}
			<span>{toast.message}</span>
			<button
				class="ml-2 flex items-center justify-center rounded bg-transparent p-1 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-slate-50"
				onclick={() => removeToast(toast.id)}
				aria-label="Close"
			>
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
