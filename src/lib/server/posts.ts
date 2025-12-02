import matter from 'gray-matter';
import { marked } from 'marked';
import type { PostDetail, PostMeta } from '$lib/types/post';
import { cleanInlineMathBoundaries } from '$lib/math/inline-math';
import { normalizeAlignEnvironmentTags } from '$lib/math/align-tags';

// Import all markdown files at build time
const postFiles = import.meta.glob('/src/lib/blog-posts/*.md', { 
	query: '?raw', 
	import: 'default',
	eager: true 
}) as Record<string, string>;

marked.setOptions({
	gfm: true
});

function getSlugFromPath(path: string): string {
	const match = path.match(/\/([^/]+)\.md$/);
	return match ? match[1] : '';
}

function loadFile(slug: string): string | null {
	const path = `/src/lib/blog-posts/${slug}.md`;
	return postFiles[path] ?? null;
}

function normalizeMeta(slug: string, fm: Record<string, unknown> = {}): PostMeta {
	const title = typeof fm.title === 'string' ? fm.title : slug;
	const description = typeof fm.description === 'string' ? fm.description : '';
	const published = typeof fm.published === 'string' ? fm.published : new Date().toISOString();
	const tags = Array.isArray(fm.tags) ? (fm.tags.filter((tag) => typeof tag === 'string') as string[]) : [];
	const explicitSlug = typeof fm.slug === 'string' ? fm.slug : slug;

	return {
		slug: explicitSlug,
		title,
		description,
		published,
		tags
	};
}

export async function listPosts(): Promise<PostMeta[]> {
	const posts = Object.entries(postFiles).map(([path, source]) => {
		const slug = getSlugFromPath(path);
		const { data } = matter(source);
		return normalizeMeta(slug, data as Record<string, unknown>);
	});

	return posts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

export async function getPostDetail(slug: string): Promise<PostDetail | null> {
	const source = loadFile(slug);
	if (!source) return null;

	const { data, content } = matter(source);
	const normalizedContent = normalizeAlignEnvironmentTags(cleanInlineMathBoundaries(content));
	const html = (marked.parse(normalizedContent, { async: false }) as string).trim();
	const meta = normalizeMeta(slug, data as Record<string, unknown>);

	return {
		...meta,
		html
	};
}
