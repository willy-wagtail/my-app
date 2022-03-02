<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	export let NoteContent: SvelteComponent;
</script>

<div class="note-content">
	<svelte:component this={NoteContent} />
</div>

<style lang="scss">
	.note-content {
		> p {
			@apply;
		}
	}
</style>
