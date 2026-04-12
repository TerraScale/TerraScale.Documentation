<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	const year = new Date().getFullYear();

	const linkGroups = [
		{
			title: 'Product',
			links: [
				{ label: 'Documentation', href: '/', icon: 'book-open' },
				{ label: 'API Reference', href: '/reference/api/', icon: 'code' },
				{ label: 'Pricing', href: 'https://terrascale.tech/pricing', icon: 'credit-card' },
				{ label: 'Dashboard', href: 'https://dash.terrascale.tech', icon: 'rocket' }
			]
		},
		{
			title: 'Company',
			links: [
				{ label: 'Main Site', href: 'https://terrascale.tech', icon: 'globe' },
				{ label: 'Status', href: 'https://status.terrascale.tech', icon: 'shield' },
				{ label: 'Blog', href: 'https://blog.terrascale.tech', icon: 'file-text' }
			]
		},
		{
			title: 'Resources',
			links: [
				{ label: 'Help Center', href: 'https://help.terrascale.tech', icon: 'heart-pulse' },
				{ label: 'Community', href: 'https://discord.gg/terrascale', icon: 'users' },
				{ label: 'Email Support', href: 'mailto:mariogk@terrascale.tech', icon: 'mail' }
			]
		}
	] as const;

	const socialLinks = [
		{
			label: 'Discord',
			href: 'https://discord.gg/terrascale',
			icon: 'discord',
			className:
				'text-[#5865F2] hover:text-[#7C86F8] hover:border-[#5865F2]/45 hover:bg-[#5865F2]/10'
		},
		{
			label: 'Twitter',
			href: 'https://twitter.com/terrascale',
			icon: 'twitter',
			className:
				'text-[#1D9BF0] hover:text-[#58B7F5] hover:border-[#1D9BF0]/45 hover:bg-[#1D9BF0]/10'
		},
		{
			label: 'LinkedIn',
			href: 'https://linkedin.com/company/terrascale',
			icon: 'linkedin',
			className:
				'text-[#0A66C2] hover:text-[#3384D2] hover:border-[#0A66C2]/45 hover:bg-[#0A66C2]/10'
		},
		{
			label: 'GitHub',
			href: 'https://github.com/terrascale',
			icon: 'github',
			className:
				'text-slate-100 hover:text-white hover:border-slate-300 hover:bg-white/6'
		}
	] as const;
</script>

<footer class="relative z-10 border-t border-ts-divider bg-ts-surface">
	<div class="mx-auto w-[calc(100%-1.25rem)] max-w-none py-6 sm:w-[calc(100%-3rem)] sm:py-7">
		<div class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] md:gap-8">
			<div class="max-w-sm">
				<a href="/" class="inline-flex items-center">
					<img src="/logo-white.svg" alt="TerraScale" class="h-8 w-auto" />
				</a>
				<p class="mt-3 text-[0.82rem] leading-6 text-slate-400">
					TerraScale documentation for teams building fast, globally distributed systems.
				</p>
				<div class="mt-3 grid gap-1.5 text-[0.82rem] text-slate-400">
					<a
						href="mailto:mariogk@terrascale.tech"
						class="inline-flex items-center gap-2 transition-colors hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
					>
						<Icon name="mail" size={14} />
						<span>Contact support</span>
					</a>
					<a
						href="https://discord.gg/terrascale"
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-2 transition-colors hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
					>
						<Icon name="discord" size={14} />
						<span>Discord community</span>
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
								href={link.href}
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
			<p>&copy; {year} TerraScale. All rights reserved.</p>
			<div class="flex flex-wrap items-center gap-4">
				<a
					href="https://status.terrascale.tech"
					target="_blank"
					rel="noreferrer"
					class="transition-colors hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					Status
				</a>
				<a
					href="https://help.terrascale.tech"
					target="_blank"
					rel="noreferrer"
					class="transition-colors hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				>
					Help
				</a>
			</div>
		</div>
	</div>
</footer>
