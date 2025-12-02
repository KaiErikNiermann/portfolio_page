import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import type { PageServerLoad } from './$types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const PROJECTS_DIR = path.resolve(__dirname, '../lib/cards/projects');
const EXPERIENCE_DIR = path.resolve(__dirname, '../lib/cards/experience');

async function readCardFolder<T>(folderPath: string) {
	const entries = await fs.readdir(folderPath, { withFileTypes: true });
	const cards = await Promise.all(
		entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
			.map(async (entry) => {
				const file = await fs.readFile(path.join(folderPath, entry.name), 'utf-8');
				const { data } = matter(file);
				return data as T;
			})
	);

	return cards;
}

export const load = (async () => {
	const [projects, experiences] = await Promise.all([
		readCardFolder<ProjectCard>(PROJECTS_DIR),
		readCardFolder<ExperienceCard>(EXPERIENCE_DIR)
	]);

	return {
		projects,
		experiences
	};
}) satisfies PageServerLoad;
