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
	import type NoteMetadata from '$lib/types/notes/NoteMetadata';
	import { DateTime } from 'luxon';

	export let NoteContent: SvelteComponent;
	export let metadata: NoteMetadata;
</script>

<article class="mt-10 pt-10">
	<header class="mb-16 text-center">
		<h1 class="text-5xl font-bold text-slate-900 mb-5 lowercase">{metadata.title}</h1>

		<dl>
			<dt class="sr-only">Date</dt>

			<dd class="text-slate-600">
				<time datetime={metadata.date}>
					{DateTime.fromISO(metadata.date).toLocaleString(DateTime.DATE_FULL)}
				</time>
			</dd>
		</dl>
	</header>

	<div class="flex">
		<aside class="min-w-[200px] mr-8">
			<a
				class="group flex font-semibold border-blue-600 text-slate-700 hover:text-blue-600 focus:outline-blue-600"
				href="/notes"
			>
				<svg
					class="overflow-visible mr-3 text-slate-400 w-auto h-6 group-hover:text-slate-600"
					viewBox="0 -9 3 24"
				>
					<path
						d="M3 0L0 3L3 6"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>

				Go back to notes
			</a>

			<hr class="my-5 border-blue-200" />

			<dl>
				<dt class="sr-only">Authors</dt>

				<dd class="flex items-center font-medium mt-6">
					<img
						class="mr-3 w-11 h-11 rounded-full object-cover"
						src={'/images/people/' + metadata.authorImage}
						alt=""
					/>

					<span class="text-slate-900">
						{metadata.author}
					</span>
				</dd>
			</dl>
		</aside>

		<div>
			<svelte:component this={NoteContent} />
		</div>
	</div>
</article>
