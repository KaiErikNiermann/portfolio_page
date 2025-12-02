import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { PostDetail, PostMeta } from '$lib/types/post';
import { cleanInlineMathBoundaries } from '$lib/math/inline-math';
import { normalizeAlignEnvironmentTags } from '$lib/math/align-tags';

const BLOG_DIR = path.resolve('src/lib/blog-posts');

marked.setOptions({
	gfm: true
});

async function loadFile(slug: string) {
	const candidate = path.join(BLOG_DIR, `${slug}.md`);
	try {
		return await fs.readFile(candidate, 'utf-8');
	} catch (error) {
		return null;
	}
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
	const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
	const posts = await Promise.all(
		entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
			.map(async (entry) => {
				const slug = entry.name.replace(/\.md$/, '');
				const source = await fs.readFile(path.join(BLOG_DIR, entry.name), 'utf-8');
				const { data } = matter(source);
				return normalizeMeta(slug, data as Record<string, unknown>);
			})
	);

	return posts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

export async function getPostDetail(slug: string): Promise<PostDetail | null> {
	const source = await loadFile(slug);
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
