<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { switchLocalePath } from '$lib/i18n/links';
	import type { LocaleConfig } from '$lib/i18n/locales';

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement | undefined = $state();

	const currentLocale = $derived(page.data.localeConfig as LocaleConfig);
	const locales = $derived(page.data.locales as LocaleConfig[]);

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (isOpen && dropdownRef && !dropdownRef.contains(event.target as Node)) {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<div class="relative" bind:this={dropdownRef}>
	<button
		type="button"
		class="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.8rem] font-medium tracking-[0.05em] text-slate-300 uppercase transition-colors hover:bg-white/10 hover:text-slate-50"
		aria-expanded={isOpen}
		aria-haspopup="true"
		onclick={toggle}
	>
		<Icon name="globe" size={14} />
		<span>{currentLocale?.prefix || 'en'}</span>
		<Icon name="chevron-down" size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[rgba(12,12,16,0.95)] shadow-xl backdrop-blur-[18px]"
			role="menu"
			aria-orientation="vertical"
		>
			<div class="flex flex-col py-1">
				{#each locales as locale}
					<a
						href={switchLocalePath(page.url.pathname, locale.prefix)}
						class="flex items-center justify-between px-4 py-2 text-[0.8rem] tracking-[0.05em] text-slate-300 uppercase transition-colors hover:bg-white/10 hover:text-slate-50"
						role="menuitem"
						onclick={close}
					>
						<span>{locale.label}</span>
						{#if currentLocale?.prefix === locale.prefix}
							<Icon name="check" size={14} className="text-blue-500" />
						{/if}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
