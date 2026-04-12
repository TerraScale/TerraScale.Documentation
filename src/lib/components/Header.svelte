<script lang="ts">
	import { page } from '$app/state';
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from './Icon.svelte';

	export let openSearch: () => void;

	let mobileOpen = false;
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const navItems = [
		{ href: '/guides/getting-started/', label: 'Docs', icon: 'book-open' },
		{ href: '/roadmap/', label: 'Roadmap', icon: 'map' },
		{ href: '/blog/', label: 'Blog', icon: 'pencil-line' },
		{ href: '/guides/getting-started/', label: 'Get Started', primary: true, icon: 'rocket' }
	];
	const statusLink = {
		href: 'https://status.terrascale.tech',
		label: 'Status'
	} as const;
	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const socialLinks = [
		{ href: 'https://discord.gg/terrascale', label: 'Discord', icon: 'discord' },
		{ href: 'https://github.com/TerraScale', label: 'GitHub', icon: 'github' }
	];

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function closeMobile() {
		mobileOpen = false;
	}

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	function isActive(href: string) {
		const pathname = page.url.pathname;
		if (href === '/blog/') {
			return pathname.startsWith('/blog/');
		}

		if (href === '/roadmap/') {
			return pathname.startsWith('/roadmap/');
		}

		if (href === '/guides/getting-started/') {
			return (
				pathname.startsWith('/reference/') ||
				pathname.startsWith('/guides/') ||
				pathname.startsWith('/dashboard/')
			);
		}

		return pathname.startsWith(href);
	}
</script>

<header class="sticky top-0 z-50 border-b border-white/6 bg-[rgba(12,12,16,0.9)] backdrop-blur-[18px]">
	<div class="mx-auto flex min-h-[4.2rem] w-[calc(100%-1.25rem)] max-w-none items-center gap-4 sm:w-[calc(100%-3rem)]">
		<a class="inline-flex items-center gap-3 whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href="/" aria-label="TerraScale Documentation home" on:click={closeMobile}>
			<img
				src="/logo-principal.svg"
				alt=""
				aria-hidden="true"
				class="h-6 w-auto sm:h-7"
			/>
			<span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-slate-200 sm:text-[0.65rem]">
				Documentation
			</span>
		</a>

		<button type="button" class="hidden min-w-48 items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-[0.55rem] text-left text-[0.82rem] tracking-[0.01em] text-slate-300 transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 max-[860px]:hidden sm:inline-flex" on:click={openSearch}>
			<Icon name="search" size={14} />
			<span>Search</span>
			<span class="ml-auto inline-flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.08em] text-slate-400" aria-hidden="true">
				<span class="inline-flex min-w-[1.55rem] items-center justify-center rounded-[0.3rem] border border-white/6 bg-white/5 px-[0.3rem] py-[0.08rem]">Ctrl</span>
				<span class="inline-flex min-w-[1.55rem] items-center justify-center rounded-[0.3rem] border border-white/6 bg-white/5 px-[0.3rem] py-[0.08rem]">K</span>
			</span>
		</button>

		<div class="ml-auto flex items-center gap-2">
			<div class="flex items-center gap-2 max-[860px]:hidden">
				{#each socialLinks as link}
					<a href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} class={link.icon
						? 'inline-flex min-h-8 items-center justify-center rounded-md px-[0.35rem] py-[0.3rem] text-[0.8rem] text-blue-500 transition-colors hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400'
						: 'inline-flex min-h-8 items-center justify-center rounded-md px-[0.45rem] py-[0.3rem] text-[0.8rem] text-blue-500 transition-colors hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400'}>
						{#if link.icon}
							<Icon name={link.icon} size={14} />
							<span class="sr-only">{link.label}</span>
						{:else}
							<span>{link.label}</span>
						{/if}
					</a>
				{/each}
			</div>

			<div class="h-[1.2rem] w-px bg-white/8 max-[860px]:hidden" aria-hidden="true"></div>

			<nav class="hidden items-center gap-[0.15rem] max-[860px]:hidden min-[861px]:flex" aria-label="Primary">
				<a
					href={statusLink.href}
					target="_blank"
					rel="noreferrer"
					class="group inline-flex items-center gap-2 rounded-[0.45rem] px-[0.9rem] py-[0.6rem] text-[0.8rem] font-medium uppercase tracking-[0.05em] text-slate-300 transition-[color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/4 hover:text-slate-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					<span class="inline-flex size-2 rounded-[0.2rem] bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)] animate-pulse"></span>
					<span>{statusLink.label}</span>
				</a>

				{#each navItems as item}
					<a
						class={`relative flex items-center gap-1.5 rounded-[0.45rem] px-[0.9rem] py-[0.6rem] text-[0.8rem] font-medium uppercase tracking-[0.05em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.primary ? 'bg-linear-to-b from-emerald-400 to-emerald-500 text-[#04130d]' : isActive(item.href) ? 'bg-white/4 text-slate-50' : 'text-slate-300 hover:bg-white/4 hover:text-slate-50'}`}
						href={item.href}
					>
						{#if item.icon}
							<Icon name={item.icon} size={item.primary ? 14 : 13} />
						{/if}
						{item.label}
						{#if isActive(item.href) && !item.primary}
							<span class="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-500" aria-hidden="true"></span>
						{/if}
					</a>
				{/each}
			</nav>

			<button
				type="button"
				class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 p-3 text-slate-50 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 min-[861px]:hidden"
				on:click={toggleMobile}
				aria-expanded={mobileOpen}
				aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
			>
				<Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<div class="border-t border-white/8 bg-[rgba(12,12,16,0.98)] min-[861px]:hidden">
			<nav class="mx-auto grid w-[calc(100%-1.25rem)] gap-3 py-4 sm:w-[calc(100%-3rem)]" aria-label="Mobile">
				<button
					type="button"
					class="flex items-center justify-start gap-[0.65rem] rounded-xl border border-white/8 bg-white/4 px-4 py-[0.9rem] text-[0.85rem] tracking-[0.01em] text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
					on:click={() => {
						closeMobile();
						openSearch();
					}}
				>
				<Icon name="search" size={16} />
					<span>Search</span>
				</button>
				{#each navItems as item}
					<a class={`flex items-center justify-start gap-[0.65rem] rounded-xl border px-4 py-[0.9rem] text-[0.82rem] font-medium uppercase tracking-[0.05em] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.primary ? 'border-transparent bg-linear-to-b from-emerald-400 to-emerald-500 text-[#04130d]' : 'border-white/8 bg-white/4 text-slate-300'}`} href={item.href} on:click={closeMobile}>
						{#if item.icon}
							<Icon name={item.icon} size={15} />
						{/if}
						{item.label}
						{#if isActive(item.href) && !item.primary}
							<span class="ml-auto h-0.5 w-6 rounded-full bg-blue-500" aria-hidden="true"></span>
						{/if}
					</a>
				{/each}
				<div class="flex flex-wrap gap-3 pt-2">
					<a
						class="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[0.82rem] tracking-[0.01em] text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
						href={statusLink.href}
						target="_blank"
						rel="noreferrer"
						on:click={closeMobile}
					>
						<span class="inline-flex size-2 rounded-[0.2rem] bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)] animate-pulse"></span>
						<span>{statusLink.label}</span>
					</a>

					{#each socialLinks as link}
						<a class="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[0.82rem] tracking-[0.01em] text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={link.href} target="_blank" rel="noreferrer" on:click={closeMobile}>
							{#if link.icon}
								<Icon name={link.icon} size={15} />
							{/if}
							<span>{link.label}</span>
						</a>
					{/each}
				</div>
			</nav>
		</div>
	{/if}
</header>
