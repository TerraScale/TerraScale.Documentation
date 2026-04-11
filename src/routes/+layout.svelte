<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import SearchOverlay from '$lib/components/SearchOverlay.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { activeAnnouncement } from '$lib/content/announcements';

	let { children } = $props();

	let searchOpen = $state(false);
	let announcementDismissed = $state(false);

	onMount(() => {
		const handler = (event: Event) => {
			const target = event.target as HTMLElement | null;
			const button = target?.closest<HTMLElement>('.ts-tabs-static-trigger');
			if (!button) {
				return;
			}

			const group = button.dataset.tabGroup;
			const index = button.dataset.tabIndex;
			if (!group || index === undefined) {
				return;
			}

			document
				.querySelectorAll<HTMLElement>(`.ts-tabs-static-trigger[data-tab-group="${group}"]`)
				.forEach((element) => {
					element.classList.toggle('active', element.dataset.tabIndex === index);
				});
			document
				.querySelectorAll<HTMLElement>(`.ts-tabs-static-panels[data-tab-group="${group}"] .ts-tabs-static-panel`)
				.forEach((element) => {
					element.classList.toggle('active', element.dataset.tabIndex === index);
				});
		};

		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	});
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="TerraScale Blog RSS Feed" href="/blog/rss.xml" />
</svelte:head>

<div class="site-shell">
	<div class="site-atmosphere"></div>
	{#if activeAnnouncement && !announcementDismissed}
		<div class="announcement-bar announcement-{activeAnnouncement.variant || 'info'}">
			<div class="shell announcement-shell">
				<div class="announcement-content">
					{#if activeAnnouncement.link}
						<a href={activeAnnouncement.link}>{activeAnnouncement.text}</a>
					{:else}
						<span>{activeAnnouncement.text}</span>
					{/if}
				</div>
				<button 
					type="button" 
					class="announcement-close" 
					aria-label="Dismiss announcement"
					onclick={() => announcementDismissed = true}
				>
					<Icon name="close" size={14} />
				</button>
			</div>
		</div>
	{/if}
	<Header openSearch={() => (searchOpen = true)} />
	<main>
		{@render children()}
	</main>
	<Footer />
	<SearchOverlay bind:open={searchOpen} on:close={() => (searchOpen = false)} />
	<Toast />
</div>
