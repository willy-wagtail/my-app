<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (_) => {
		const allNoteFiles = import.meta.glob('./_notes/*.md');

		const iterableNoteFiles = Object.entries(allNoteFiles);

		const allNotes = await Promise.all(
			iterableNoteFiles.map(async ([path, resolver]) => {
				const content = await resolver();

				return {
					metadata: content.metadata
				};
			})
		);

		const sortedNotes = allNotes.sort((a, b) => {
			const timestampA = Date.parse(a.metadata.date);
			const timestampB = Date.parse(b.metadata.date);

			if (!isNaN(timestampA) && !isNaN(timestampB)) {
				return timestampB - timestampA;
			} else {
				return 0; // todo: should probably throw error here.
			}
		});

		return {
			props: {
				notes: sortedNotes
			}
		};
	};
</script>

<script lang="ts">
	import NoteItem from '$lib/components/notes/NoteItem.svelte';

	export let notes: any[];
</script>

<svelte:head>
	<title>Notes - William Cheung</title>
</svelte:head>

<header class="py-16 px-4 text-center">
	<h1 class="text-5xl font-bold mb-5 text-slate-800">My Notes</h1>

	<p class="text-lg text-slate-700 mb-5">
		A collection of notes on various topics of interest to me. These notes are meant to be memos so
		are loosely-formed and unpolished.
	</p>
</header>

<div class="space-y-16">
	{#each notes as note}
		<NoteItem baseUrl="/notes" metadata={note.metadata} />
	{/each}
</div>
