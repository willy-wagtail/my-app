<script lang="ts">
	import type NoteMetadata from '$lib/types/notes/NoteMetadata';
	import type { SvelteComponent } from 'svelte';

	export let NoteContent: SvelteComponent;
	export let metadata: NoteMetadata;
</script>

<article class="mt-10 pt-10">
	<h1
		class="text-3xl mb-16 text-center font-bold 
	text-slate-900"
	>
		some article title
	</h1>

	<svelte:component this={NoteContent} />
</article>

<!-- class="col-span-full 
text-3xl
sm:text-4xl
 sm:text-center 
 xl:mb-16 
 font-extrabold 
 tracking-tight 
 text-slate-900 
dark:text-slate-200" -->
