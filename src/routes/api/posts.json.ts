import type { RequestHandler } from "@sveltejs/kit";

export const get: RequestHandler = async () => {
  const allPostFiles = import.meta.glob('../blog/*.md');
  const iterablePostFiles = Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles.map( async ([path, resolver]) => {
      const content = await resolver();

      // ../blog/1.md --> /blog/1
      const postPath = path.slice(2, -3);

      return {
        meta: content.metadata,
        path: postPath
      }
    })
  );

  return {
    body: allPosts
  }
}
