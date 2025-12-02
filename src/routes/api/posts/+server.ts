import { json } from '@sveltejs/kit';
import { listPosts } from '$lib/server/posts';

export async function GET() {
	const posts = await listPosts();
	return json(posts);
}
