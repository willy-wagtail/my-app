<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { SvelteComponent } from 'svelte';

	export const load: Load = async (loadInput) => {
		try {
			const note: SvelteComponent = await import(`./_notes/${loadInput.params.note}.md`);

			return {
				props: {
					metadata: { ...note.metadata },
					NoteContent: note.default
				}
			};
		} catch (err: unknown) {
			return {
				status: 404,
				error: err instanceof Error ? err.message : 'Unknown error'
			};
		}
	};
</script>

<script lang="ts">
	import RenderNote from '$lib/components/notes/RenderNote.svelte';
	import type NoteMetadata from '$lib/types/notes/NoteMetadata';

	export let NoteContent: SvelteComponent;
	export let metadata: NoteMetadata;
</script>

<RenderNote {NoteContent} {metadata} />
