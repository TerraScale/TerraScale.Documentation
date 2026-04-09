<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';

	export let openSearch: () => void;

	let mobileOpen = false;
	const navItems = [
		{ href: '/guides/getting-started/', label: 'Docs' },
		{ href: '/blog/', label: 'Blog' },
		{ href: '/reference/api/', label: 'API' }
	];

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function closeMobile() {
		mobileOpen = false;
	}
</script>

<header class="site-header">
	<div class="shell shell-header">
		<a class="brand" href="/" aria-label="TerraScale home" on:click={closeMobile}>
			<img src="/icon-blue.svg" alt="" />
			<span class="brand-wordmark">TerraScale</span>
		</a>

		<nav class="desktop-nav" aria-label="Primary">
			{#each navItems as item}
				<a class:active={page.url.pathname.startsWith(item.href)} href={item.href}>{item.label}</a>
			{/each}
		</nav>

		<div class="header-actions">
			<button type="button" class="search-trigger ts-btn-glass" on:click={openSearch}>
				<Icon name="search" size={16} />
				<span>Search</span>
			</button>
			<a class="ts-btn-primary" href="/guides/getting-started/">Get Started</a>
			<button type="button" class="mobile-toggle icon-button" on:click={toggleMobile} aria-expanded={mobileOpen}>
				<Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<div class="mobile-nav ts-glass-heavy">
			<nav aria-label="Mobile">
				{#each navItems as item}
					<a href={item.href} on:click={closeMobile}>{item.label}</a>
				{/each}
				<button type="button" class="ts-btn-glass mobile-search" on:click={() => { closeMobile(); openSearch(); }}>
					<Icon name="search" size={16} />
					<span>Search</span>
				</button>
				<a class="ts-btn-primary" href="/guides/getting-started/" on:click={closeMobile}>Start Building</a>
			</nav>
		</div>
	{/if}
</header>
