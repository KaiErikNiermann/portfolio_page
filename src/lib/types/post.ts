export type PostMeta = {
	slug: string;
	title: string;
	description: string;
	published: string;
	tags: string[];
};

export type PostDetail = PostMeta & {
	html: string;
};
