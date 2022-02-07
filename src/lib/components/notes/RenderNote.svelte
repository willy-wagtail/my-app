<script lang="ts">
	import type NoteMetadata from '$lib/types/notes/NoteMetadata';
	import type { SvelteComponent } from 'svelte';

	export let NoteContent: SvelteComponent;
	export let metadata: NoteMetadata;
</script>

<svelte:component this={NoteContent} />
