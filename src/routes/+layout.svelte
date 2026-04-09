<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import SearchOverlay from '$lib/components/SearchOverlay.svelte';

	let searchOpen = false;

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

<div class="site-shell">
	<div class="site-atmosphere"></div>
	<Header openSearch={() => (searchOpen = true)} />
	<main>
		<slot />
	</main>
	<Footer />
	<SearchOverlay bind:open={searchOpen} on:close={() => (searchOpen = false)} />
</div>
