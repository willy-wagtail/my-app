<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ params, fetch }) => {
		const currentCategory = params.category;
		const response = await fetch('/api/posts.json');
		const posts = await response.json();

		const matchingPosts = posts.filter((post: any) =>
			post.meta.categories.includes(currentCategory)
		);

		return {
			props: {
				posts: matchingPosts
			}
		};
	};
</script>
