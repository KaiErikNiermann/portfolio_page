import matter from 'gray-matter';
import type { PageServerLoad } from './$types';

// Import all card files at build time
const projectFiles = import.meta.glob('/src/lib/cards/projects/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const experienceFiles = import.meta.glob('/src/lib/cards/experience/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export type ProjectCard = {
	title: string;
	description: string;
	tags: string[];
	link?: string;
};

export type ExperienceCard = {
	title: string;
	role?: string;
	period?: string;
	description: string;
	tags: string[];
};

function readCards<T>(files: Record<string, string>): T[] {
	return Object.values(files).map((source) => {
		const { data } = matter(source);
		return data as T;
	});
}

export const load = (async () => {
	const projects = readCards<ProjectCard>(projectFiles);
	const experiences = readCards<ExperienceCard>(experienceFiles);

	return {
		projects,
		experiences
	};
}) satisfies PageServerLoad;
