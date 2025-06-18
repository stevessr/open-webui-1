<script lang="ts">
	import { getStaticUrl } from '$lib/constants';

	export let className = 'size-8';
	export let src = getStaticUrl('static/favicon.png');
</script>

<img
	src={src ?? getStaticUrl('static/favicon.png')}
	class=" {className} object-cover rounded-full"
	alt="profile"
	draggable="false"
/>
