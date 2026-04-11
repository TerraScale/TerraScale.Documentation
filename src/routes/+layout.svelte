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

	const announcementToneClasses = {
		info: 'border-b border-white/8 bg-linear-to-r from-blue-500/15 to-cyan-500/15 text-blue-200',
		warning: 'border-b border-white/8 bg-linear-to-r from-amber-500/15 to-orange-600/15 text-amber-200',
		success: 'border-b border-white/8 bg-linear-to-r from-emerald-500/15 to-emerald-600/15 text-emerald-200'
	} as const;

	function getAnnouncementTone(variant?: string) {
		return announcementToneClasses[(variant as keyof typeof announcementToneClasses) ?? 'info'] ?? announcementToneClasses.info;
	}
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="TerraScale Blog RSS Feed" href="/blog/rss.xml" />
</svelte:head>


<div class="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_26rem)]">
	<div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_24rem),radial-gradient(circle_at_80%_78%,rgba(139,92,246,0.08),transparent_24rem)]"></div>
	{#if activeAnnouncement && !announcementDismissed}
		<div class={getAnnouncementTone(activeAnnouncement.variant)}>
			<div class="mx-auto flex min-h-10 w-[calc(100%-1.25rem)] max-w-none items-center justify-center px-4 py-1 sm:w-[calc(100%-3rem)]">
				<div class="flex flex-1 justify-center text-center text-[0.85rem] font-medium">
					{#if activeAnnouncement.link}
						<a class="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={activeAnnouncement.link}>{activeAnnouncement.text}</a>
					{:else}
						<span>{activeAnnouncement.text}</span>
					{/if}
				</div>
				<button 
					type="button" 
					class="flex size-6 items-center justify-center rounded-sm bg-transparent opacity-70 transition-[opacity,background-color] hover:bg-white/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" 
					aria-label="Dismiss announcement"
					onclick={() => announcementDismissed = true}
				>
					<Icon name="close" size={14} />
				</button>
			</div>
		</div>
	{/if}
	<Header openSearch={() => (searchOpen = true)} />
	<main class="relative z-10 pt-16 sm:pt-[4.2rem]">
		{@render children()}
	</main>
	<Footer />
	<SearchOverlay bind:open={searchOpen} on:close={() => (searchOpen = false)} />
	<Toast />
</div>
