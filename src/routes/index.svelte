<script lang="ts">
	import NoteItem from '$lib/components/NoteItem.svelte';
</script>

<header class="py-16 px-4 text-center">
	<h1 class="text-5xl font-bold mb-5 text-slate-800">my notes</h1>

	<p class="text-lg text-slate-700 mb-5">
		A collection of notes on various topics of interest to me. These notes are meant to be memos so
		are loosely-formed and unpolished.
	</p>
</header>

<div class="space-y-16">
	<NoteItem />
	<NoteItem />
	<NoteItem />
	<NoteItem />
</div>
