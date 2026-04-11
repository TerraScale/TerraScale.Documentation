<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';

	export let openSearch: () => void;

	let mobileOpen = false;
	const navItems = [
		{ href: '/reference/api/', label: 'Docs' },
		{ href: '/blog/', label: 'Blog' },
		{ href: '/guides/getting-started/', label: 'Get Started', primary: true }
	];
	const socialLinks = [
		{ href: 'https://github.com/TerraScale', label: 'GitHub', icon: 'github' },
		{ href: 'https://docs.terrascale.tech/blog/rss.xml', label: 'RSS' }
	];

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function closeMobile() {
		mobileOpen = false;
	}

	function isActive(href: string) {
		const pathname = page.url.pathname;
		if (href === '/blog/') {
			return pathname.startsWith('/blog/');
		}

		if (href === '/reference/api/') {
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
		<a class="inline-flex items-center whitespace-nowrap font-[var(--font-display)] text-[0.72rem] font-bold tracking-[0.01em] text-blue-500 transition-colors hover:text-blue-400 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 sm:text-[0.8rem]" href="/" aria-label="TerraScale Documentation home" on:click={closeMobile}>
			<span>TerraScale Documentation</span>
		</a>

		<button type="button" class="hidden min-w-48 items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-[0.45rem] text-left text-[0.8rem] font-normal text-slate-300 transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 max-[860px]:hidden sm:inline-flex" on:click={openSearch}>
			<Icon name="search" size={14} />
			<span>Search</span>
			<span class="ml-auto inline-flex items-center gap-1 text-[0.72rem] text-slate-400" aria-hidden="true">
				<span class="inline-flex min-w-[1.55rem] items-center justify-center rounded-[0.3rem] border border-white/6 bg-white/5 px-[0.3rem] py-[0.08rem]">Ctrl</span>
				<span class="inline-flex min-w-[1.55rem] items-center justify-center rounded-[0.3rem] border border-white/6 bg-white/5 px-[0.3rem] py-[0.08rem]">K</span>
			</span>
		</button>

		<div class="ml-auto flex items-center gap-2">
			<div class="flex items-center gap-2 max-[860px]:hidden">
				{#each socialLinks as link}
					<a href={link.href} aria-label={link.label} class={link.icon
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
				{#each navItems as item}
					<a
						class={`relative rounded-[0.45rem] px-[0.85rem] py-2 text-[0.875rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.primary ? 'bg-linear-to-b from-emerald-400 to-emerald-500 text-[#04130d]' : isActive(item.href) ? 'bg-white/4 text-slate-50' : 'text-slate-300 hover:bg-white/4 hover:text-slate-50'}`}
						href={item.href}
					>
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
					class="flex items-center justify-start gap-[0.65rem] rounded-xl border border-white/8 bg-white/4 px-4 py-[0.85rem] text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
					on:click={() => {
						closeMobile();
						openSearch();
					}}
				>
				<Icon name="search" size={16} />
					<span>Search</span>
				</button>
				{#each navItems as item}
					<a class={`flex items-center justify-start gap-[0.65rem] rounded-xl border px-4 py-[0.85rem] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${item.primary ? 'border-transparent bg-linear-to-b from-emerald-400 to-emerald-500 text-[#04130d]' : 'border-white/8 bg-white/4 text-slate-300'}`} href={item.href} on:click={closeMobile}>
						{item.label}
						{#if isActive(item.href) && !item.primary}
							<span class="ml-auto h-0.5 w-6 rounded-full bg-blue-500" aria-hidden="true"></span>
						{/if}
					</a>
				{/each}
				<div class="flex flex-wrap gap-3 pt-2">
					{#each socialLinks as link}
						<a class="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={link.href} on:click={closeMobile}>
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
