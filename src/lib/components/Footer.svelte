<script lang="ts">
	// biome-ignore-all lint/correctness/noUnusedImports: referenced in component markup
	// biome-ignore-all lint/correctness/noUnusedVariables: referenced in component markup
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import { toLocaleHref } from '$lib/i18n/links';
	import { getStrings } from '$lib/i18n/strings';

	const year = new Date().getFullYear();
	const currentLocale = $derived(page.data.localeConfig?.prefix ?? 'en');
	const strings = $derived(getStrings(currentLocale));

	const linkGroups = $derived([
		{
			title: strings.footer.product,
			links: [
				{ label: strings.footer.documentation, href: '/', icon: 'book-open' },
				{ label: strings.footer.apiReference, href: '/reference/api/', icon: 'code' },
				{ label: strings.footer.pricing, href: 'https://terrascale.tech/pricing', icon: 'credit-card' },
				{ label: strings.footer.dashboard, href: 'https://dash.terrascale.tech', icon: 'rocket' }
			]
		},
		{
			title: strings.footer.company,
			links: [
				{ label: strings.footer.mainSite, href: 'https://terrascale.tech', icon: 'globe' },
				{ label: strings.footer.status, href: 'https://status.terrascale.tech', icon: 'shield' },
				{ label: strings.footer.blog, href: 'https://blog.terrascale.tech', icon: 'file-text' }
			]
		},
		{
			title: strings.footer.resources,
			links: [
				{ label: strings.footer.helpCenter, href: 'https://help.terrascale.tech', icon: 'heart-pulse' },
				{ label: strings.footer.community, href: 'https://discord.gg/terrascale', icon: 'users' },
				{ label: strings.footer.emailSupport, href: 'mailto:mariogk@terrascale.tech', icon: 'mail' }
			]
		}
	]);

	const socialLinks = $derived([
		{
			label: strings.footer.discord,
			href: 'https://discord.gg/terrascale',
			icon: 'discord',
			className:
				'text-[#5865F2] hover:text-[#7C86F8] hover:border-[#5865F2]/45 hover:bg-[#5865F2]/10'
		},
		{
			label: strings.footer.twitter,
			href: 'https://twitter.com/terrascale',
			icon: 'twitter',
			className:
				'text-[#1D9BF0] hover:text-[#58B7F5] hover:border-[#1D9BF0]/45 hover:bg-[#1D9BF0]/10'
		},
		{
			label: strings.footer.linkedIn,
			href: 'https://linkedin.com/company/terrascale',
			icon: 'linkedin',
			className:
				'text-[#0A66C2] hover:text-[#3384D2] hover:border-[#0A66C2]/45 hover:bg-[#0A66C2]/10'
		},
		{
			label: strings.footer.github,
			href: 'https://github.com/terrascale',
			icon: 'github',
			className:
				'text-slate-100 hover:text-white hover:border-slate-300 hover:bg-white/6'
		}
	]);

	function getLocalizedHref(href: string) {
		return toLocaleHref(href, currentLocale);
	}
</script>

<footer class="relative z-10 border-t border-ts-divider bg-ts-surface">
	<div class="mx-auto w-[calc(100%-1.25rem)] max-w-none py-6 sm:w-[calc(100%-3rem)] sm:py-7">
		<div class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] md:gap-8">
			<div class="max-w-sm">
				<a href={getLocalizedHref('/')} class="inline-flex items-center">
					<img src="/logo-white.svg" alt="TerraScale" class="h-8 w-auto" />
				</a>
				<p class="mt-3 text-[0.82rem] leading-6 text-slate-400">
					{strings.footer.tagline}
				</p>
				<div class="mt-3 grid gap-1.5 text-[0.82rem] text-slate-400">
					<a
						href="mailto:mariogk@terrascale.tech"
						class="inline-flex items-center gap-2 transition-colors hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
					>
						<Icon name="mail" size={14} />
						<span>{strings.footer.contactSupport}</span>
					</a>
					<a
						href="https://discord.gg/terrascale"
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-2 transition-colors hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
					>
						<Icon name="discord" size={14} />
						<span>{strings.footer.discordCommunity}</span>
					</a>
				</div>
				<div class="mt-4 flex items-center gap-2.5">
					{#each socialLinks as social}
						<a
							href={social.href}
							target="_blank"
							rel="noreferrer"
							aria-label={social.label}
							class={`inline-flex size-8 items-center justify-center rounded-md border border-ts-divider bg-ts-card transition-[border-color,color,background-color,transform] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400 ${social.className}`}
						>
							<Icon name={social.icon} size={15} />
						</a>
					{/each}
				</div>
			</div>

			{#each linkGroups as group}
				<div>
					<h2 class="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-slate-50">{group.title}</h2>
					<div class="mt-2.5 grid gap-1.5">
						{#each group.links as link}
							<a
								href={getLocalizedHref(link.href)}
								target={link.href.startsWith('http') ? '_blank' : undefined}
								rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
								class="inline-flex items-center gap-2 text-[0.82rem] leading-6 text-slate-400 transition-colors hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
							>
								<Icon name={link.icon} size={13} />
								<span>{link.label}</span>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="border-t border-ts-divider">
		<div class="mx-auto flex w-[calc(100%-1.25rem)] flex-col gap-2 py-3 text-[0.8rem] text-slate-500 sm:w-[calc(100%-3rem)] sm:flex-row sm:items-center sm:justify-between">
			<p>&copy; {year} TerraScale. {strings.footer.allRightsReserved}</p>
			<div class="flex flex-wrap items-center gap-4">
				<a
					href="https://status.terrascale.tech"
					target="_blank"
					rel="noreferrer"
					class="transition-colors hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					{strings.footer.status}
				</a>
				<a
					href="https://help.terrascale.tech"
					target="_blank"
					rel="noreferrer"
					class="transition-colors hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					{strings.footer.help}
				</a>
			</div>
		</div>
	</div>
</footer>
