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

<header class="site-header">
	<div class="shell shell-header">
		<a class="site-title" href="/" aria-label="TerraScale Documentation home" on:click={closeMobile}>
			<span>TerraScale Documentation</span>
		</a>

		<button type="button" class="search-trigger" on:click={openSearch}>
			<Icon name="search" size={14} />
			<span>Search</span>
			<span class="search-shortcut" aria-hidden="true">
				<span>Ctrl</span>
				<span>K</span>
			</span>
		</button>

		<div class="header-right">
			<div class="header-socials">
				{#each socialLinks as link}
					<a href={link.href} aria-label={link.label} class:icon-only={Boolean(link.icon)}>
						{#if link.icon}
							<Icon name={link.icon} size={14} />
							<span class="sr-only">{link.label}</span>
						{:else}
							<span>{link.label}</span>
						{/if}
					</a>
				{/each}
			</div>

			<div class="nav-separator" aria-hidden="true"></div>

			<nav class="desktop-nav" aria-label="Primary">
				{#each navItems as item}
					<a
						class:active={isActive(item.href)}
						class:primary-link={item.primary}
						href={item.href}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<button
				type="button"
				class="mobile-toggle icon-button"
				on:click={toggleMobile}
				aria-expanded={mobileOpen}
				aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
			>
				<Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<div class="mobile-nav">
			<nav aria-label="Mobile">
				<button
					type="button"
					class="search-trigger mobile-search-trigger"
					on:click={() => {
						closeMobile();
						openSearch();
					}}
				>
				<Icon name="search" size={16} />
					<span>Search</span>
				</button>
				{#each navItems as item}
					<a class:primary-link={item.primary} href={item.href} on:click={closeMobile}>{item.label}</a>
				{/each}
				<div class="mobile-socials">
					{#each socialLinks as link}
						<a href={link.href} on:click={closeMobile}>
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
