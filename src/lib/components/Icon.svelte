<script lang="ts">
	import { getIconMarkup } from '$lib/icons';

	export let name = 'arrow-right';
	export let size = 20;
	export let className = '';
</script>

<span
	class={`icon ${className}`.trim()}
	style={`width:${size}px;height:${size}px;`}
	aria-hidden="true"
>
	{@html getIconMarkup(name)}
</span>
