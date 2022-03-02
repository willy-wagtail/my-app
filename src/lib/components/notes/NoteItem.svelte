<script lang="ts">
	import type NoteMetadata from '$lib/types/notes/NoteMetadata';
	import { DateTime } from 'luxon';

	export let metadata: NoteMetadata;
	export let baseUrl: string = '';
</script>

<article class="px-4">
	<h2 class="mb-4 text-2xl text-slate-900 font-bold">
		<a
			class="border-b focus:border-b-0 border-blue-600 hover:text-blue-600 focus:outline-blue-600"
			href={baseUrl + '/' + metadata.slug}
		>
			{metadata.title}
		</a>
	</h2>

	<p class="mb-5 text-slate-700">
		{metadata.description}
	</p>

	<div class="flex flex-row-reverse justify-end items-center">
		<dl>
			<dt class="sr-only">Date</dt>

			<dd class="text-sm text-slate-500">
				<time datetime={metadata.date}>
					{DateTime.fromISO(metadata.date).toLocaleString(DateTime.DATE_FULL)}
				</time>
			</dd>
		</dl>

		<svg class="mx-4 text-slate-700" width="2" height="2" fill="currentColor">
			<circle cx="1" cy="1" r="1" />
		</svg>

		<a
			class="border-b focus:border-b-0 border-blue-600 text-slate-700 hover:text-blue-600 focus:outline-blue-600"
			href={baseUrl + '/' + metadata.slug}
		>
			Read more
		</a>
	</div>
</article>
