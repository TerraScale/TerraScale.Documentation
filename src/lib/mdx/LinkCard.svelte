<script lang="ts">
	export let title = '';
	export let href = '#';
</script>

<a class="ts-link-card" href={href}>
	<strong>{title}</strong>
	<span><slot /></span>
</a>
