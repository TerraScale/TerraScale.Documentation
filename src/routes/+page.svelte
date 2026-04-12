<script lang="ts">
	// biome-ignore lint/correctness/noUnusedImports: referenced in component markup
	import Icon from '$lib/components/Icon.svelte';

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	let { data }: { data: { entry: { title: string; description: string } } } = $props();

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const features = [
		{
			icon: 'zap',
			title: 'Lightning Fast',
			description: 'Blazing fast queries with global edge caching and optimized indexing for sub-10ms latency.',
			accent: 'blue' as const
		},
		{
			icon: 'chart-column',
			title: 'Real-Time Analytics',
			description: 'Monitor your data and performance with real-time insights and comprehensive dashboards.',
			accent: 'cyan' as const
		},
		{
			icon: 'shield',
			title: 'Enterprise Security',
			description: 'SOC 2 compliant with end-to-end encryption and advanced access controls.',
			accent: 'emerald' as const
		},
		{
			icon: 'globe',
			title: 'Global Scale',
			description: 'Deploy worldwide across 19 regions with automatic failover and geographic distribution.',
			accent: 'purple' as const
		}
	];

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const exploreCards = [
		{
			icon: 'rocket',
			title: 'Getting Started',
			description: 'Set up your TerraScale account and make your first API call in minutes.',
			href: '/guides/getting-started/'
		},
		{
			icon: 'file-text',
			title: 'API Reference',
			description: 'Complete API documentation with examples for all endpoints.',
			href: '/reference/api/'
		},
		{
			icon: 'blocks',
			title: 'SDKs & Libraries',
			description: 'Official client libraries for C#, Go, and TypeScript.',
			href: '/guides/sdks/csharp/'
		}
	];

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const featureIconStyles: Record<string, string> = {
		blue: 'border-blue-400/25 bg-blue-500/12 text-blue-400',
		cyan: 'border-cyan-400/25 bg-cyan-500/12 text-cyan-400',
		emerald: 'border-emerald-400/25 bg-emerald-500/12 text-emerald-400',
		purple: 'border-purple-400/25 bg-purple-500/12 text-purple-400'
	};

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const featureBarStyles: Record<string, string> = {
		blue: 'from-blue-500/40 to-blue-500/0',
		cyan: 'from-cyan-500/40 to-cyan-500/0',
		emerald: 'from-emerald-500/40 to-emerald-500/0',
		purple: 'from-purple-500/40 to-purple-500/0'
	};

	// biome-ignore lint/correctness/noUnusedVariables: referenced in component markup
	const codeLines = [
		{ text: 'import { TerraScaleClient } from ', comment: false },
		{ text: "'@terrascale/sdk';", comment: false },
		{ text: '', comment: false },
		{ text: '// Initialize the client', comment: true },
		{ text: 'const client = new TerraScaleClient({', comment: false },
		{ text: "  apiKey: 'ts_live_your_api_key',", comment: false },
		{ text: "  endpoint: 'https://api.terrascale.io',", comment: false },
		{ text: "  defaultDatabase: 'my-database'", comment: false },
		{ text: '});', comment: false },
		{ text: '', comment: false },
		{ text: '// Store an item', comment: true },
		{ text: 'await client.putItem({', comment: false },
		{ text: "  partitionKey: 'user#123',", comment: false },
		{ text: "  sortKey: 'profile',", comment: false },
		{ text: '  attributes: {', comment: false },
		{ text: "    name: 'John Doe',", comment: false },
		{ text: "    email: 'john@example.com'", comment: false },
		{ text: '  }', comment: false },
		{ text: '});', comment: false },
		{ text: '', comment: false },
		{ text: '// Query items', comment: true },
		{ text: 'const result = await client.query({', comment: false },
		{ text: "  partitionKey: 'user#123'", comment: false },
		{ text: '});', comment: false }
	];
</script>

<svelte:head>
	<title>{data.entry.title}</title>
	<meta name="description" content={data.entry.description} />
</svelte:head>

<section class="relative overflow-hidden">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/3 bg-[radial-gradient(circle,rgba(37,99,235,0.14)_0%,transparent_65%)]"></div>
		<div class="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/4 translate-y-1/4 bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_65%)]"></div>
	</div>

	<div class="relative mx-auto flex w-[calc(100%-1.25rem)] max-w-4xl flex-col items-center px-4 pb-12 pt-24 text-center sm:w-[calc(100%-3rem)] sm:pt-32 md:pb-16">
		<div class="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.76rem] font-medium uppercase tracking-[0.08em] text-slate-300 backdrop-blur-sm">
			<span class="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
			<span>Now in Public Alpha</span>
		</div>

		<img src="/logo-principal.svg" alt="TerraScale" class="mb-8 w-full max-w-sm sm:max-w-lg" />

		<h1 class="text-[2.45rem] leading-[1.12] tracking-[0.01em] text-ts-text sm:text-[3.35rem] md:text-[4.1rem]">
			Scale Your <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Database</span>
			<br />Effortlessly
		</h1>

		<p class="mx-auto mt-7 max-w-2xl text-[0.98rem] leading-[1.95] tracking-[0.01em] text-ts-text-muted sm:text-[1.04rem]">
			The most advanced database platform for modern applications.
			Deploy globally. Scale infinitely. Build faster.
		</p>

		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a
				class="inline-flex items-center justify-center gap-2 rounded-ts-md border border-transparent bg-linear-to-b from-ts-primary to-blue-700 px-6 py-3.5 text-[0.84rem] leading-[1.2] font-medium uppercase tracking-[0.06em] text-blue-50 shadow-ts-brutal-blue transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.4)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				href="/guides/getting-started/"
			>
				<span>Get Started Free</span>
				<Icon name="arrow-right" size={16} />
			</a>
			<a
				class="inline-flex items-center justify-center gap-2 rounded-ts-md border border-ts-divider bg-ts-surface px-6 py-3.5 text-[0.84rem] leading-[1.2] font-medium uppercase tracking-[0.06em] text-slate-300 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-white/15 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				href="/reference/api/"
			>
				<span>View Documentation</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</div>
	</div>
</section>

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-6xl py-20 sm:w-[calc(100%-3rem)]">
	<div class="mb-12 text-center">
		<h2 class="text-[1.9rem] leading-[1.15] tracking-[0.01em] text-ts-text sm:text-[2.3rem]">
			Why Choose <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">TerraScale</span>
		</h2>
		<p class="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-[1.85] tracking-[0.01em] text-ts-text-muted">
			Built for developers, trusted by enterprises. Experience the next generation of database infrastructure.
		</p>
	</div>

	<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each features as feature}
			<article class="group relative overflow-hidden rounded-ts-xl border border-ts-divider bg-ts-surface p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-white/[0.12]">
				<div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r {featureBarStyles[feature.accent]}"></div>
				<div class="mb-4 inline-flex size-10 items-center justify-center rounded-lg border {featureIconStyles[feature.accent]}">
					<Icon name={feature.icon} size={20} />
				</div>
				<h3 class="mb-2 text-[1rem] font-semibold tracking-[0.01em] text-ts-text">{feature.title}</h3>
				<p class="text-[0.92rem] leading-[1.75] tracking-[0.01em] text-ts-text-muted">{feature.description}</p>
			</article>
		{/each}
	</div>
</section>

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-4xl py-16 sm:w-[calc(100%-3rem)]">
	<div class="mb-10 text-center">
		<h2 class="text-[1.9rem] leading-[1.15] tracking-[0.01em] text-ts-text sm:text-[2.3rem]">Get Started in Seconds</h2>
		<p class="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-[1.85] tracking-[0.01em] text-ts-text-muted">
			Simple APIs, powerful features. Deploy your database with just a few lines of code.
		</p>
	</div>

	<div class="overflow-hidden rounded-ts-xl border border-ts-divider bg-ts-bg">
		<div class="flex items-center gap-2 border-b border-ts-divider bg-ts-surface px-4 py-3">
			<Icon name="code" size={14} />
			<span class="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-ts-text-muted">example.ts</span>
		</div>
		<pre class="overflow-x-auto p-5 text-[0.82rem] leading-[1.7] text-slate-200"><code class="font-[ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace]">{#each codeLines as line}<span class={line.comment ? 'text-slate-400' : 'text-slate-200'}>{line.text}</span>
{/each}</code></pre>
	</div>
</section>

<section class="mx-auto w-[calc(100%-1.25rem)] max-w-6xl py-20 sm:w-[calc(100%-3rem)]">
	<div class="mb-12 text-center">
		<h2 class="text-[1.9rem] leading-[1.15] tracking-[0.01em] text-ts-text sm:text-[2.3rem]">Explore the Documentation</h2>
		<p class="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-[1.85] tracking-[0.01em] text-ts-text-muted">
			Everything you need to build, deploy, and scale with TerraScale.
		</p>
	</div>

	<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each exploreCards as card}
			<a
				class="group relative overflow-hidden rounded-ts-xl border border-ts-divider bg-ts-surface p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-ts-primary-light/40 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				href={card.href}
			>
				<div class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-ts-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
				<div class="mb-4 inline-flex size-10 items-center justify-center rounded-lg border border-blue-300/22 bg-blue-500/12 text-ts-primary-light">
					<Icon name={card.icon} size={20} />
				</div>
				<h3 class="mb-2 text-[1rem] font-semibold tracking-[0.01em] text-ts-text">{card.title}</h3>
				<p class="text-[0.92rem] leading-[1.75] tracking-[0.01em] text-ts-text-muted">{card.description}</p>
				<span class="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] font-medium uppercase tracking-[0.06em] text-ts-primary-light transition-colors group-hover:text-blue-300">
					Learn more
					<Icon name="arrow-right" size={14} />
				</span>
			</a>
		{/each}
	</div>
</section>

<section class="relative overflow-hidden">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(37,99,235,0.1)_0%,transparent_60%)]"></div>
	</div>

	<div class="relative mx-auto flex w-[calc(100%-1.25rem)] max-w-3xl flex-col items-center py-24 text-center sm:w-[calc(100%-3rem)]">
		<h2 class="text-[1.9rem] leading-[1.15] tracking-[0.01em] text-ts-text sm:text-[2.3rem]">Ready to Build the Future?</h2>
		<p class="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-[1.85] tracking-[0.01em] text-ts-text-muted">
			Join thousands of developers building scalable, reliable applications with TerraScale.
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a
				class="inline-flex items-center justify-center gap-2 rounded-ts-md border border-transparent bg-linear-to-b from-ts-primary to-blue-700 px-6 py-3.5 text-[0.84rem] leading-[1.2] font-medium uppercase tracking-[0.06em] text-blue-50 shadow-ts-brutal-blue transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.4)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				href="/guides/getting-started/"
			>
				Start Building Today
			</a>
			<a
				class="inline-flex items-center justify-center gap-2 rounded-ts-md border border-ts-divider bg-ts-surface px-6 py-3.5 text-[0.84rem] leading-[1.2] font-medium uppercase tracking-[0.06em] text-slate-300 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-white/15 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400"
				href="https://terrascale.tech/pricing"
			>
				View Pricing
			</a>
		</div>
	</div>
</section>
