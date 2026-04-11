<script lang="ts">
	export let title = '';
	export let href = '#';
</script>

<a class="block rounded-[0.45rem] border border-white/6 bg-white/4 p-4 shadow-none transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-blue-400/40 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-400" href={href}>
	<strong>{title}</strong>
	<span class="mt-2 block leading-[1.7] text-slate-400"><slot /></span>
</a>
