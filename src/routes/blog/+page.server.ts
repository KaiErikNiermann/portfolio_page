import type { PageServerLoad } from './$types';
import { listPosts } from '$lib/server/posts';

export const load = (async () => {
	const posts = await listPosts();
	return { posts };
}) satisfies PageServerLoad;
