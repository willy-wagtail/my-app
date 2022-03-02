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
	import RenderNoteMarkdown from '$lib/components/notes/RenderNoteMarkdown.svelte';
	import type NoteMetadata from '$lib/types/notes/NoteMetadata';
	import { DateTime } from 'luxon';

	export let NoteContent: SvelteComponent;
	export let metadata: NoteMetadata;
</script>

<svelte:head>
	<title>Note | {metadata.title}</title>

	<meta data-key="description" name="description" content={metadata.description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />

	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />

	<!-- <meta property="og:image" content="https://xxxx.com{imagePath}" />
	<meta property="og:image:width" content={metadata.coverWidth} />
	<meta property="og:image:height" content={metadata.coverHeight} />
	<meta name="twitter:image" content="https://xxx.com{imagePath}" />
	<meta property="og:url" content="https://xxx.com/notes/{metadata.slug}/" /> -->
</svelte:head>

<article class="mt-10 pt-10">
	<header class="xl:mb-16 flex flex-col-reverse xl:flex-col items-center">
		<h1 class="mt-4 xl:mt-0 mb-5 text-4xl font-bold text-slate-700">{metadata.title}</h1>

		<dl>
			<dt class="sr-only">Date</dt>

			<dd class="text-slate-600">
				<time datetime={metadata.date}>
					{DateTime.fromISO(metadata.date).toLocaleString(DateTime.DATE_FULL)}
				</time>
			</dd>
		</dl>
	</header>

	<div class="xl:flex">
		<aside class="mb-16 xl:mb-0 xl:mr-8 min-w-[200px]">
			<div class="hidden xl:block">
				<a
					class="group flex font-semibold border-blue-600 text-slate-600 hover:text-blue-600 focus:outline-blue-600"
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

				<hr class="mt-4 mb-5 border-blue-200" />
			</div>

			<dl>
				<dt class="sr-only">Authors</dt>

				<dd class="mt-6 flex justify-center xl:justify-start items-center font-medium">
					<img
						class="mr-3 w-11 h-11 rounded-full object-cover"
						src={'/images/people/' + metadata.authorImage}
						alt=""
					/>

					<span class="text-slate-700">
						{metadata.author}
					</span>
				</dd>
			</dl>
		</aside>

		<RenderNoteMarkdown {NoteContent} />
	</div>
</article>
