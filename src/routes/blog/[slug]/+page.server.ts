import type { PageServerLoad, EntryGenerator } from './$types';
import { listPosts, getPostDetail } from '$lib/server/posts';
import { error } from '@sveltejs/kit';

export const entries: EntryGenerator = async () => {
	const posts = await listPosts();
	return posts.map((post) => ({ slug: post.slug }));
};

export const load = (async ({ params }) => {
	const post = await getPostDetail(params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}
	return { post };
}) satisfies PageServerLoad;
