import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async () => {
	const allPostFiles = import.meta.glob('../blog/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const content = await resolver();

			// ../blog/1.md --> /blog/1
			const postPath = path.slice(2, -3);

			return {
				meta: content.metadata,
				path: postPath
			};
		})
	);

	const sortedPosts = allPosts.sort((a, b) => {
		const timestampA = Date.parse(a.meta.date);
		const timestampB = Date.parse(b.meta.date);

		if (!isNaN(timestampA) && !isNaN(timestampB)) {
			return timestampB - timestampA;
		} else {
			return 0; // todo: should probably throw error here.
		}
	});

	return {
		body: sortedPosts
	};
};
