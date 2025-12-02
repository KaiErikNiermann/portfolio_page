import type { PageLoad } from './$types';
import type { PostMeta } from '$lib/types/post';
import { error } from '@sveltejs/kit';

export const load = (async ({ fetch }) => {
	const response = await fetch('/api/posts');
	if (!response.ok) {
		throw error(response.status, 'Unable to load posts');
	}

	const posts = (await response.json()) as PostMeta[];
	return { posts };
}) satisfies PageLoad;
