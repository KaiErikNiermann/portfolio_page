import { error, json } from '@sveltejs/kit';
import { getPostDetail } from '$lib/server/posts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const post = await getPostDetail(params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}

	return json(post);
};
