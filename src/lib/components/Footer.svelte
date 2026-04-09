<script lang="ts">
	import Icon from './Icon.svelte';

	const footerLinks = [
		{ href: '/guides/getting-started/', label: 'Getting Started' },
		{ href: '/reference/api/', label: 'API Reference' },
		{ href: '/blog/', label: 'Blog' },
		{ href: '/about/support/', label: 'Support' }
	];
</script>

<footer class="site-footer">
	<div class="shell footer-shell">
		<div>
			<a class="brand footer-brand" href="/" aria-label="TerraScale home">
				<img src="/icon-white.svg" alt="" class="footer-logo" />
				<span class="brand-wordmark brand-wordmark-footer">TerraScale</span>
			</a>
			<p>
				TerraScale documentation for developers building globally distributed applications with a
				high-performance database platform.
			</p>
			<div class="footer-badges">
				<span class="ts-badge ts-badge-secondary">99.99% Uptime</span>
				<span class="ts-badge ts-badge-primary">Cloudflare Ready</span>
			</div>
		</div>

		<div>
			<h2>Explore</h2>
			<div class="footer-links">
				{#each footerLinks as link}
					<a href={link.href}>{link.label}</a>
				{/each}
			</div>
		</div>

		<div>
			<h2>Social</h2>
			<div class="footer-socials">
				<a href="https://github.com/TerraScale" aria-label="GitHub">
					<Icon name="github" size={18} />
				</a>
				<a href="https://discord.gg/your-invite-link" aria-label="Discord">
					<Icon name="discord" size={18} />
				</a>
			</div>
		</div>
	</div>
</footer>
