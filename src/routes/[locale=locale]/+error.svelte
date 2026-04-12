<script lang="ts">
	// biome-ignore-all lint/correctness/noUnusedVariables: referenced in component markup
	import { page } from '$app/state';
	import { toLocaleHref } from '$lib/i18n/links';

	type LocaleCopy = {
		title: string;
		description: string;
		homeCta: string;
	};

	const copyByLocale: Record<string, LocaleCopy> = {
		en: {
			title: 'Page not found',
			description: 'The page you requested could not be found.',
			homeCta: 'Go to homepage'
		},
		'pt-br': {
			title: 'Página não encontrada',
			description: 'Não foi possível encontrar a página solicitada.',
			homeCta: 'Ir para a página inicial'
		},
		es: {
			title: 'Página no encontrada',
			description: 'No se pudo encontrar la página solicitada.',
			homeCta: 'Ir al inicio'
		}
	};

	let localeConfig = $derived(page.data.localeConfig);
	let localePrefix = $derived(localeConfig?.prefix ?? 'en');
	let copy = $derived(copyByLocale[localePrefix] ?? copyByLocale.en);
	let homeHref = $derived(toLocaleHref('/', localePrefix));
</script>

<svelte:head>
	<title>{copy.title} | TerraScale</title>
</svelte:head>

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-none px-0 pb-16 pt-7 sm:w-[calc(100%-3rem)] md:pb-20">
	<div class="rounded-2xl border border-white/15 bg-white/7 p-8 shadow-[4px_4px_0_rgba(37,99,235,0.35)] backdrop-blur-[14px] max-[640px]:p-4">
		<p class="mb-[0.85rem] text-[0.72rem] font-medium uppercase tracking-[0.12em] text-blue-300">404</p>
		<h1 class="text-[2rem] leading-[1.15] tracking-[0.01em] text-slate-50 sm:text-[2.4rem]">{copy.title}</h1>
		<p class="mt-4 max-w-2xl text-[0.95rem] leading-[1.8] tracking-[0.01em] text-slate-400">{copy.description}</p>
		<div class="mt-6 flex flex-wrap items-center gap-3">
			<a
				class="inline-flex items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-blue-600 px-[1.15rem] py-[0.85rem] text-[0.82rem] font-medium uppercase tracking-[0.06em] text-[#03111f] shadow-[4px_4px_0_rgba(37,99,235,0.35)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				href={homeHref}
			>
				{copy.homeCta}
			</a>
		</div>
	</div>
</section>
