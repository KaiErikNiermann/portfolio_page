import type { PageLoad } from './$types';
import type { PostDetail } from '$lib/types/post';
import { error } from '@sveltejs/kit';

export const load = (async ({ fetch, params }) => {
	const response = await fetch(`/api/posts/${params.slug}`);
	if (!response.ok) {
		throw error(response.status, 'Unable to load post');
	}

	const post = (await response.json()) as PostDetail;
	return { post };
}) satisfies PageLoad;
