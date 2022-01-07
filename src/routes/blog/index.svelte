<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch }) => {
		const posts = await fetch('/api/posts.json');
		const allPosts = await posts.json();

		return {
			props: {
				posts: allPosts
			}
		};
	};
</script>

<script lang="ts">
	export let posts: any;
</script>

<h1>Blog</h1>

<!-- handle case when there are no posts -->
<ul>
	{#each posts as post}
		<li>
			<h2>
				<a href={post.path}>
					{post.meta.title}
				</a>
			</h2>
			Published {post.meta.date}
		</li>
	{/each}
</ul>
